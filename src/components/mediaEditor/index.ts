import {createEffect} from 'solid-js'
import safeAssign from '../../helpers/object/safeAssign';
import ButtonIcon from '../buttonIcon';
import I18n from '../../lib/langPack';
import {mediaEditorClassName} from '../popups/mediaEditor';
import {EditorTab, type MediaEditorTab} from './EditorTab';
import {EnhanceMediaEditorTab, defaultEffects} from './EnhanceTab';
import {CropMediaEditorTab} from './CropTab';
import {TextMediaEditorTab} from './TextTab';
import {DrawMediaEditorTab} from './DrawTab';
import {StickersMediaEditorTab} from './StickersTab';
import {State} from './State';
import {CanvasWorker} from './CanvasWorker';
import {type ProxiedManagers} from '../../lib/appManagers/getProxiedManagers';
import {DrawType, EditorLayerType, type EditorLayerLottieSticker, type CropState} from './types';
import {
  getImageDataFromImageElement,
  createCanvas,
  mergeIntoCanvas,
  convertSvgToImageData,
  cloneFontFace,
  rotateCanvas
} from './utils';
import {attachLayers} from './Layers';
import {attachCropMode} from './CropMode';
import ButtonCorner from '../buttonCorner';
import deepEqual from '../../helpers/object/deepEqual';
import {attachCanvasFrame} from './CanvasFrame';
import debounce from '../../helpers/schedulers/debounce';
import {GIF} from './gif';

type Point = {
  x: number;
  y: number;
}

type MediaEditorOptions = {
  mainContainer: HTMLElement
  mainContainerWrapper: HTMLElement
  tabsHeader: HTMLElement
  tabsContent: HTMLElement
  tabsContainer: HTMLElement
  originalImage: HTMLImageElement;
  managers: ProxiedManagers;
  onClose(): void;
  onDone(newData: HTMLCanvasElement | Blob): void;
}

const tabs: Record<EditorTab, typeof MediaEditorTab> = {
  [EditorTab.Enhance]: EnhanceMediaEditorTab,
  [EditorTab.Crop]: CropMediaEditorTab,
  [EditorTab.Text]: TextMediaEditorTab,
  [EditorTab.Draw]: DrawMediaEditorTab,
  [EditorTab.Stickers]: StickersMediaEditorTab
};

export class MediaEditor {
  private mainContainer: HTMLElement
  private mainContainerWrapper: HTMLElement
  private cropBar: HTMLElement
  private tabsHeader: HTMLElement
  private tabsContent: HTMLElement
  private tabsContainer: HTMLElement
  private originalImage: HTMLImageElement;
  private onClose: () => void;
  private canvasWorker: CanvasWorker;
  private tabs: Record<EditorTab, MediaEditorTab>;
  private imageCanvas: HTMLCanvasElement;
  private tempImageContext: CanvasRenderingContext2D;
  private drawCanvas: HTMLCanvasElement;
  private drawContext: CanvasRenderingContext2D;
  private currentTab = EditorTab.Enhance;
  private managers: ProxiedManagers;
  public state: State;
  private onDone: (newData: HTMLCanvasElement | Blob) => void;

  private isDrawing = false;
  private drawPoints: Point[] = [];

  constructor(options: MediaEditorOptions) {
    safeAssign(this, options);
    this.canvasWorker = new CanvasWorker();
    this.construct();
  }

  private construct() {
    this.mainContainer.style.setProperty('--reversed-rotation', '0deg');

    // Canvas
    const {width, height, imageData, tempCtx} = getImageDataFromImageElement(this.originalImage);
    this.imageCanvas = createCanvas(width, height, 'main-canvas');
    this.tempImageContext = tempCtx;
    this.drawCanvas = createCanvas(width, height, 'draw-canvas');
    this.drawContext = this.drawCanvas.getContext('2d', {
      willReadFrequently: true
    });
    this.mainContainer.append(this.imageCanvas);
    this.mainContainer.append(this.drawCanvas);

    const initialCrop: CropState = {
      x: 0,
      y: 0,
      w: width,
      h: height,
      angle: 0,
      flip: false,
      aspectRatio: false
    }

    const offscreenCanvas = this.imageCanvas.transferControlToOffscreen();
    this.canvasWorker.setup({
      offscreenCanvas,
      imageData,
      defaultEffects: {...defaultEffects},
      cropState: initialCrop
    });
    this.drawImage();

    // Tabs header
    const tabsHeaderContainer = document.createElement('div');
    tabsHeaderContainer.classList.add(mediaEditorClassName + '-tabs-header-top');

    const tabsHeaderLeft = document.createElement('div');
    tabsHeaderLeft.classList.add(mediaEditorClassName + '-tabs-header-left');
    const closeButton = ButtonIcon('close');
    closeButton.addEventListener('click', () => {
      this.onClose();
    });

    tabsHeaderLeft.append(closeButton);
    const title = new I18n.IntlElement({
      key: 'MediaEditor.Popup.Title'
    });
    title.element.classList.add('edit-title');
    tabsHeaderLeft.append(title.element);
    tabsHeaderContainer.append(tabsHeaderLeft);

    const tabsHeaderRight = document.createElement('div');
    tabsHeaderRight.classList.add(mediaEditorClassName + '-tabs-header-right');

    this.state = new State({
      initialState: {
        effects: defaultEffects,
        draw: this.drawContext.getImageData(0, 0, width, height),
        layers: [],
        crop: initialCrop
      },
      canvasWorker: this.canvasWorker,
      drawContext: this.drawContext,
      container: tabsHeaderRight
    });

    tabsHeaderContainer.append(tabsHeaderRight);
    this.tabsHeader.append(tabsHeaderContainer);

    // Tabs navigation
    const tabsSelectorContainer = document.createElement('div');
    tabsSelectorContainer.classList.add(mediaEditorClassName + '-tabs-header-bottom');

    this.tabs = Object.entries(tabs).reduce((res, [key, TabConstructor]) => {
      const tab = key as EditorTab;
      const instance = new TabConstructor({
        tab,
        tabsSelectorContainer,
        tabsContentContainer: this.tabsContent,
        canvasWorker: this.canvasWorker,
        state: this.state,
        managers: this.managers,
        onChangeTab: (newTab) => this.onChangeTab(newTab),
        redrawImage: () => this.drawImage()
      });

      if(tab === this.currentTab) {
        instance.activate();
      }

      return {...res, [tab]: instance};
    }, {} as Record<EditorTab, MediaEditorTab>);

    this.tabsHeader.append(tabsSelectorContainer);
    this.calculateCanvasScale();
    this.mainContainer.append(attachLayers(this.state, width, height));

    // Save button
    const saveButton = ButtonCorner({icon: 'check'});
    saveButton.addEventListener('click', () => this.save());
    this.tabsContainer.append(saveButton);

    // Crop actions
    this.cropBar = attachCropMode({
      state: this.state,
      width,
      height,
      rotateCanvas: (newAngle, angleDiff) => {
        this.canvasWorker.rotateCanvas({angle: newAngle});
        return rotateCanvas(this.drawContext, angleDiff);
      },
      onRotationDone: (newAngle) => {
        this.mainContainer.style.setProperty('--reversed-rotation', `${newAngle * -1}deg`);
      }
    });
    this.mainContainerWrapper.append(this.cropBar);

    const [getCropState] = this.state.cropSignal;
    const debouncedCropUpdate = debounce((cropState: CropState) => {
      this.canvasWorker.updateCropState(cropState);
    }, 400, false, true);
    createEffect<CropState>((prev) => {
      const cropState = getCropState();
      if(!deepEqual(cropState, prev)) {
        this.updateCropState(cropState);
        debouncedCropUpdate(cropState);
      }
      return cropState;
    });

    const [position] = this.state.positionSignal;
    createEffect<number>(prev => {
      const newPosition = position();
      if(prev !== newPosition) {
        this.updateCropState(this.state.current.crop, true);
      }
      return newPosition;
    }, position());

    // Crop frame
    this.mainContainerWrapper.append(attachCanvasFrame({state: this.state}));
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('resize', this.onWindowResize)
    this.cropBar.addEventListener('transitionend', (e) => {
      if(e.propertyName === 'opacity') {
        this.calculateCanvasScale();
      }
    });
  }

  private onWindowResize = () => {
    this.calculateCanvasScale();
  }

  private async save() {
    const [canvasSize] = this.state.canvasSizeSignal;
    const cropData = {
      cropX: this.state.current.crop.x,
      cropY: this.state.current.crop.y,
      cropWidth: this.state.current.crop.w,
      cropHeight: this.state.current.crop.h,
      flipHorizontal: this.state.current.crop.flip
    };

    const animationInfo = this.getAnimationInfo();
    // if(animationInfo.maxFramesNumber > 0) {
    // FIXME: skipped, because it's very slow
    if(false) {
      console.time('[MediaEditor] getting frames')
      const gif = new GIF(canvasSize().width, canvasSize().height);
      for(let i = 0; i < animationInfo.maxFramesNumber; i++) {
        const layers = await this.getStaticLayers(i);
        const mergedCanvas = mergeIntoCanvas(this.getStaticCanvasResult(layers), canvasSize().width, canvasSize().height, cropData)
        const ctx = mergedCanvas.getContext('2d', {
          willReadFrequently: true
        });
        gif.addFrame(ctx.getImageData(0, 0, canvasSize().width, canvasSize().height));
      }
      console.timeEnd('[MediaEditor] getting frames');

      console.time('[MediaEditor] encoding');
      const blob = await gif.getBlob(progress => {
        console.log(`[MediaEditor] GIF Encoding: ${progress * 100}%`);
      });
      this.onDone(blob);
    } else {
      // Merge all canvases
      const layers = await this.getStaticLayers();
      const resultCanvas = mergeIntoCanvas(this.getStaticCanvasResult(layers), canvasSize().width, canvasSize().height, cropData);
      this.onDone(resultCanvas);
    }
  }

  private async getStaticLayers(frameNumber = 0) {
    const styles = cloneFontFace();
    const layers: CanvasImageSource[] = [];
    const sortedLayers = this.state.current.layers.sort((a, b) => a.z - b.z);
    for(const layer of sortedLayers) {
      if(layer.type === EditorLayerType.Text) {
        const clone = layer.controller.svg.cloneNode(true) as SVGSVGElement;
        clone.appendChild(styles);
        clone.style.transformOrigin = 'top left';
        clone.style.transform = 'scale(var(--canvas-scale))';
        layers.push(await convertSvgToImageData(clone));
      } else if(layer.type === EditorLayerType.LottieSticker) {
        // TODO: check maxFrames and start loop if exceeded
        // TODO: check svg element
        layer.player.requestFrame(frameNumber);
        layers.push(layer.controller.canvas);
      } else {
        layers.push(layer.controller.canvas);
      }
    }

    return layers;
  }

  private getStaticCanvasResult(layers: CanvasImageSource[]): CanvasImageSource[] {
    return [this.imageCanvas, ...layers, this.drawCanvas];
  }

  private getAnimationInfo() {
    const lottieLayers = this.state.current.layers.filter(layer => layer.type === EditorLayerType.LottieSticker) as EditorLayerLottieSticker[];
    lottieLayers.map((layer) => layer.player.stop());

    const maxFramesNumber = Math.max(...lottieLayers.map((layer) => layer.player.maxFrame));
    return {
      maxFramesNumber
    }
  }

  private drawImage() {
    this.canvasWorker.drawImage({});
  }

  private enterDrawMode = () => {
    this.mainContainer.classList.add('draw-mode');
    this.drawCanvas.addEventListener('mousedown', this.drawStart);
    this.drawCanvas.addEventListener('mousemove', this.draw);
    this.drawCanvas.addEventListener('mouseup', this.drawStop);
    this.drawCanvas.addEventListener('mouseout', this.drawStop);
  }

  private leaveDrawMode = () => {
    this.mainContainer.classList.remove('draw-mode');
    this.drawCanvas.removeEventListener('mousedown', this.drawStart);
    this.drawCanvas.removeEventListener('mousemove', this.draw);
    this.drawCanvas.removeEventListener('mouseup', this.drawStop);
    this.drawCanvas.removeEventListener('mouseout', this.drawStop);
  }

  private drawStart = (event: MouseEvent) => {
    this.calculateCanvasScale();
    this.isDrawing = true;
    const [getScale] = this.state.canvasScaleSignal;
    const scale = getScale();
    this.drawPoints = [{x: event.offsetX * scale, y: event.offsetY * scale}]
  }

  private drawStop = () => {
    if(!this.isDrawing) return;
    const [drawState] = this.state.drawToolSignal;
    const state = drawState();
    this.isDrawing = false;
    if(state.type === DrawType.Arrow) {
      this.drawArrowHead(state.size);
    }
    const [canvasSize] = this.state.canvasSizeSignal;
    this.drawPoints = [];
    this.state.setState({
      ...this.state.current,
      draw: this.drawContext.getImageData(0, 0, canvasSize().width, canvasSize().height)
    });
    this.drawContext.globalCompositeOperation = 'source-over';
  }

  private draw = (event: MouseEvent) => {
    const [drawState] = this.state.drawToolSignal;
    const state = drawState();

    if(state.type === DrawType.Pen) {
      this.drawPen(event, state.color, state.size);
    } else if(state.type === DrawType.Neon) {
      this.drawNeon(event, state.color, state.size);
    } else if(state.type === DrawType.Brush) {
      this.drawBrush(event, state.color, state.size);
    } else if(state.type === DrawType.Arrow) {
      this.drawPen(event, state.color, state.size);
    } else if(state.type === DrawType.Blur) {
      this.drawBlur(event, state.size);
    } else if(state.type === DrawType.Eraser) {
      this.drawErase(event, state.size);
    }
  }

  private drawErase = (event: MouseEvent, size: number) => {
    if(!this.isDrawing) return;
    const [getScale] = this.state.canvasScaleSignal;
    const scale = getScale();

    this.drawPoints.push({x: event.offsetX * scale, y: event.offsetY * scale});

    const ctx = this.drawContext;
    ctx.lineWidth = size;
    ctx.globalCompositeOperation = 'destination-out';
    this.drawCurve();
  }

  private drawArrowHead = (size: number) => {
    const ctx = this.drawContext;

    const numPoints = 5;
    const pathLength = this.drawPoints.length;
    if(pathLength < 2) return;

    const startIndex = Math.max(pathLength - numPoints, 0);
    const points = this.drawPoints.slice(startIndex);

    let dx = 0, dy = 0;
    for(let i = 1; i < points.length; i++) {
      dx += points[i].x - points[i - 1].x;
      dy += points[i].y - points[i - 1].y;
    }

    const length = points.length - 1;
    const averageDx = dx / length;
    const averageDy = dy / length;
    const angle = Math.atan2(averageDy, averageDx);

    const arrowLength = size * 2;
    const arrowWidth = size / 2;
    const lastPoint = this.drawPoints[pathLength - 1];
    const endX = lastPoint.x;
    const endY = lastPoint.y;

    const leftX = endX - arrowLength * Math.cos(angle - Math.PI / 6);
    const leftY = endY - arrowLength * Math.sin(angle - Math.PI / 6);
    const rightX = endX - arrowLength * Math.cos(angle + Math.PI / 6);
    const rightY = endY - arrowLength * Math.sin(angle + Math.PI / 6);

    const leftSideX = endX - (arrowWidth / 2) * Math.sin(angle);
    const leftSideY = endY + (arrowWidth / 2) * Math.cos(angle);
    const rightSideX = endX + (arrowWidth / 2) * Math.sin(angle);
    const rightSideY = endY - (arrowWidth / 2) * Math.cos(angle);

    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(leftSideX, leftSideY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(rightSideX, rightSideY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }


  private drawCurve = () => {
    const ctx = this.drawContext;
    const points = this.drawPoints;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for(let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    ctx.quadraticCurveTo(
      points[points.length - 2].x,
      points[points.length - 2].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );

    ctx.stroke();
  }

  private drawPen = (event: MouseEvent, color: string, size: number) => {
    if(!this.isDrawing) return;
    const [getScale] = this.state.canvasScaleSignal;
    const scale = getScale();

    this.drawPoints.push({x: event.offsetX * scale, y: event.offsetY * scale});

    const ctx = this.drawContext;
    ctx.strokeStyle = `rgb(${color})`;
    ctx.lineWidth = size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    this.drawCurve();
  }

  private applyBlur = (imageData: ImageData, radius: number) =>{
    // TODO: find a faster way to do blur
    // TODO: more blur
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const blurredPixels = new Uint8ClampedArray(pixels.length);

    for(let y = 0; y < height; y++) {
      for(let x = 0; x < width; x++) {
        let red = 0, green = 0, blue = 0, alpha = 0;
        let total = 0;

        // Iterate over the pixels in a square around the current pixel
        for(let j = -radius; j <= radius; j++) {
          for(let i = -radius; i <= radius; i++) {
            const pixelIndex = ((y + j) * width + (x + i)) * 4;
            if(pixelIndex >= 0 && pixelIndex < pixels.length) {
              red += pixels[pixelIndex];
              green += pixels[pixelIndex + 1];
              blue += pixels[pixelIndex + 2];
              alpha += pixels[pixelIndex + 3];
              total++;
            }
          }
        }

        const currentIndex = (y * width + x) * 4;
        blurredPixels[currentIndex] = red / total;
        blurredPixels[currentIndex + 1] = green / total;
        blurredPixels[currentIndex + 2] = blue / total;
        blurredPixels[currentIndex + 3] = alpha / total;
      }
    }

    return new ImageData(blurredPixels, width, height);
  }

  private drawBlur = (event: MouseEvent, size: number) => {
    if(!this.isDrawing) return;
    const [getScale] = this.state.canvasScaleSignal;
    const scale = getScale();

    const {x: lastX, y: lastY} = this.drawPoints[this.drawPoints.length - 1];
    const currentX = event.offsetX * scale;
    const currentY = event.offsetY * scale;
    this.drawPoints.push({x: currentX, y: currentY});

    const points = this.interpolatePoints(lastX, lastY, currentX, currentY);
    for(const point of points) {
      this.clonePixelsUnderCursor(point.x, point.y, size);
    }
  }

  private clonePixelsUnderCursor(x: number, y: number, size: number) {
    const [canvasSize] = this.state.canvasSizeSignal;
    const startX = Math.max(0, x - size / 2);
    const startY = Math.max(0, y - size / 2);
    const width = Math.min(canvasSize().width - startX, size);
    const height = Math.min(canvasSize().height - startY, size);

    const pixels = this.tempImageContext.getImageData(startX, startY, width, height);

    const blurRadius = 10;
    const blurredPixels = this.applyBlur(pixels, blurRadius);

    // Draw the blurred pixel data on canvas2
    this.drawContext.putImageData(blurredPixels, startX, startY);
  }

  private interpolatePoints(x1: number, y1: number, x2: number, y2: number) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    const points = [];

    if(steps === 0) {
      // If start and end points are the same, return just that point
      points.push({x: x1, y: y1});
    } else {
      for(let step = 0; step <= steps; step++) {
        const t = step / steps;
        const x = Math.round(x1 + (x2 - x1) * t);
        const y = Math.round(y1 + (y2 - y1) * t);

        // Ensure only unique points are added
        if(points.length === 0 || x !== points[points.length - 1].x || y !== points[points.length - 1].y) {
          points.push({x, y});
        }
      }
    }

    return points;
  }

  private drawBrush = (event: MouseEvent, color: string, size: number) => {
    if(!this.isDrawing) return;
    const [getScale] = this.state.canvasScaleSignal;
    const scale = getScale();

    const {x: lastX, y: lastY} = this.drawPoints[this.drawPoints.length - 1];

    const ctx = this.drawContext;
    const brushWidth = size;
    const brushHeight = size * 0.5;
    const smoothingFactor = 5;

    const currentX = event.offsetX * scale;
    const currentY = event.offsetY * scale;
    const deltaX = currentX - lastX;
    const deltaY = currentY - lastY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const steps = Math.ceil(distance / smoothingFactor);

    for(let i = 0; i < steps; i++) {
      const t = i / steps;
      const interpolatedX = lastX + t * deltaX;
      const interpolatedY = lastY + t * deltaY;

      const startX = interpolatedX - brushWidth / 2;
      const startY = interpolatedY - brushHeight / 2;
      ctx.fillStyle = `rgba(${color}, 0.4)`;
      ctx.shadowBlur = size * 0.5;
      ctx.shadowColor = `rgba(${color}, 0.4)`;
      ctx.fillRect(startX, startY, brushWidth, brushHeight);
    }

    this.drawPoints.push({x: currentX, y: currentY});
  }

  private drawNeon = (event: MouseEvent, color: string, size: number) => {
    if(!this.isDrawing) return;
    const [getScale] = this.state.canvasScaleSignal;
    const scale = getScale();
    this.drawPoints.push({x: event.offsetX * scale, y: event.offsetY * scale});

    const ctx = this.drawContext;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Neon effect
    const neonColor = `rgb(${color})`;
    ctx.shadowBlur = size;
    ctx.shadowColor = neonColor;

    this.drawCurve();
  }

  private addNewTextLayer = (e: MouseEvent) => {
    const [getScale] = this.state.canvasScaleSignal;
    const scale = getScale();
    const hasActiveLayer = this.state.activeLayerSignal[0]() !== null
    const clickInFrame = e.target instanceof HTMLElement && !e.target.closest('.frame') && !e.target.classList.contains('frame')
    if(hasActiveLayer && !clickInFrame) {
      return;
    }

    const [canvasSize] = this.state.canvasSizeSignal;
    const [textStyles] = this.state.textToolSignal;
    const w = canvasSize().width / 2;
    const h = 400;
    const x = e.offsetX * scale - w / 2;
    const y = e.offsetY * scale - h / 2;

    const id = crypto.randomUUID();
    this.state.addLayer({
      id,
      type: EditorLayerType.Text,
      x,
      y,
      z: 0,
      angle: 0,
      w,
      h,
      text: '',
      color: '255, 255, 255',
      ...textStyles()
    });

    this.state.activeLayerSignal[1](id);
  }

  private enterTextMode() {
    this.mainContainer.classList.add('text-mode');
    this.mainContainer.addEventListener('click', this.addNewTextLayer);
  }

  private leaveTextMode() {
    this.mainContainer.classList.remove('text-mode');
    this.mainContainer.removeEventListener('click', this.addNewTextLayer);
  }

  private enterCropMode() {
    this.canvasWorker.drawImage({});
    this.mainContainer.classList.add('crop-mode');
    this.mainContainer.style.setProperty('transform', `rotate(${this.state.current.crop.angle}deg)`);
    this.mainContainer.style.setProperty('--reversed-rotation', `${this.state.current.crop.angle * -1}deg`);
  }

  private leaveCropMode() {
    this.canvasWorker.rotateCanvas({angle: this.state.current.crop.angle});
    this.mainContainer.classList.remove('crop-mode');
    this.mainContainer.style.setProperty('--reversed-rotation', '0deg');
    this.mainContainer.style.setProperty('transform', 'none');
  }

  private async onChangeTab(newTab: EditorTab) {
    this.state.activeLayerSignal[1](null);
    if(document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.currentTab = newTab;
    if(newTab === EditorTab.Draw) {
      this.enterDrawMode();
    } else {
      this.leaveDrawMode();
    }

    if(newTab === EditorTab.Text) {
      this.enterTextMode();
    } else {
      this.leaveTextMode();
    }

    if(newTab === EditorTab.Crop) {
      this.enterCropMode();
    } else {
      this.leaveCropMode();
    }

    for(const [tab, instance] of Object.entries(this.tabs)) {
      if(instance) {
        if(tab === newTab) {
          instance.activate();
        } else {
          instance.deactivate();
        }
      }
    }
  }

  private calculateCanvasScale = () => {
    const naturalWidth = this.originalImage.naturalWidth;
    const rect = this.drawCanvas.getBoundingClientRect();

    const newScale = naturalWidth / rect.width;
    const [, setScale] = this.state.canvasScaleSignal;
    setScale(newScale);
    this.mainContainer.style.setProperty('--canvas-scale', String(newScale));
    this.mainContainer.style.setProperty('--canvas-width', String(naturalWidth) + 'px');
  }

  private updateCropState(cropState: CropState, setReversedState = false) {
    this.mainContainer.style.transform = `rotate(${cropState.angle}deg)`;
    if(setReversedState) {
      this.mainContainer.style.setProperty('--reversed-rotation', `${cropState.angle * -1}deg`);
    }
  }
}
