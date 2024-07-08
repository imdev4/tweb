import {createSignal, type Signal} from 'solid-js';
import type {Size} from './types';

/**
 * Returns `ImageData` and image info from the given `HTMLImageElement`
 */
export function getImageDataFromImageElement(img: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true
  });

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  return {
    height: img.naturalHeight,
    width: img.naturalWidth,
    tempCtx: ctx,
    imageData: ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
  };
}

/**
 * Creates canvas
 */
export function createCanvas(width: number, height: number, className?: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  if(className) {
    canvas.classList.add(className);
  }

  canvas.width = width;
  canvas.height = height;
  canvas.style.aspectRatio = `${width} / ${height}`;

  return canvas
}

/**
 * Merges multiple canvases into one
 */
export function mergeIntoCanvas(sources: CanvasImageSource[], originalWidth: number, originalHeight: number, cropOptions: CropCanvasOptions) {
  const mergedCanvas = document.createElement('canvas');
  const context = mergedCanvas.getContext('2d');

  mergedCanvas.width = originalWidth;
  mergedCanvas.height = originalHeight;

  for(const canvas of sources) {
    context.drawImage(canvas, 0, 0);
  }

  return cropCanvas(context, cropOptions);
}

/**
 * Converts SVG element to `ImageData`
 */
export function convertSvgToImageData(svg: SVGSVGElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgCodeEncoded = svgString.replace(/\n/g, '').replace(/"/g, `'`);
    const src = `data:image/svg+xml,${svgCodeEncoded}`

    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = src;
  });
}

/**
 * Equality checker for primitives in two arrays
 */
export function primitiveEqual<T>(a: T[], b: T[]): boolean {
  if(a.length !== b.length) {
    return false;
  }

  for(let i = 0; i < a.length; i++) {
    const elA = a[i];
    const elB = b[i];

    for(const key in elA) {
      const valA = elA[key];
      const valB = elB[key];
      if(isPrimitive(valA) && isPrimitive(valB) && valA !== valB) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Returns true if given value is primitive
 */
export function isPrimitive(val: unknown): boolean {
  return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null || val === undefined;
}

/**
 * Returns current caret position in the document
 */
export function getCaretPosition(): number {
  const sel = window.getSelection();
  if(sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(range.startContainer);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  }
  return -1;
}

/**
 * Sets caret at the desired position for the given element
 */
export function setCaretPosition(element: HTMLElement, position: number) {
  if(element && element.isContentEditable) {
    const range = document.createRange();
    const selection = window.getSelection();

    if(selection) {
      range.setStart(element.firstChild || element, position);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

/**
 * Extracts `FontFace` rules as css-string
 */
function extractFontFaceRules(sheet: CSSStyleSheet): string[] {
  const rules: string[] = [];

  const cssRules = Array.from(sheet.cssRules);
  for(const rule of cssRules) {
    if(rule.type === CSSRule.FONT_FACE_RULE) {
      rules.push(rule.cssText);
    }
  }

  return rules;
}

/**
 * Clones `FontFace`s from current document
 */
export function cloneFontFace() {
  const styleSheet = document.createElementNS('http://www.w3.org/2000/svg', 'style');

  const fontFaceRules: string[] = [];
  for(let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i] as CSSStyleSheet;
    fontFaceRules.push(...extractFontFaceRules(sheet));
  }

  if(fontFaceRules.length > 0) {
    styleSheet.appendChild(document.createTextNode(fontFaceRules.join('\n')));
  }

  return styleSheet;
}

/**
 * Clones context of the given canvas
 */
export function cloneCanvasContext(oldCanvas: HTMLCanvasElement) {
  const newCanvas = document.createElement('canvas');
  const context = newCanvas.getContext('2d');

  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  context.drawImage(oldCanvas, 0, 0);

  return context
}

/**
 * Rotates canvas to the given degree
 */
export function rotateCanvas(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, degrees: number) {
  const radians = degrees * Math.PI / 180;

  context.save();
  context.translate(context.canvas.width / 2, context.canvas.height / 2);
  context.rotate(radians);
  context.translate(-context.canvas.width / 2, -context.canvas.height / 2);

  const tempCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(context.canvas.width, context.canvas.height);
  const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
  tempCanvas.width = context.canvas.width;
  tempCanvas.height = context.canvas.height;
  tempContext.translate(tempCanvas.width / 2, tempCanvas.height / 2);
  tempContext.rotate(radians);
  tempContext.drawImage(context.canvas, -context.canvas.width / 2, -context.canvas.height / 2);

  const rotatedImageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.putImageData(rotatedImageData, 0, 0);
  context.restore();

  return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
}

/**
 * Rotates an element relatively to the given container
 */
export function rotateElement(element: Size, degree: number, container: Size): Size {
  const radians = degree * (Math.PI / 180);

  const centerX = container.x + container.w / 2;
  const centerY = container.y + container.h / 2;

  const elementCenterX = element.x + element.w / 2;
  const elementCenterY = element.y + element.h / 2;

  const newX = centerX + (elementCenterX - centerX) * Math.cos(radians) - (elementCenterY - centerY) * Math.sin(radians);
  const newY = centerY + (elementCenterX - centerX) * Math.sin(radians) + (elementCenterY - centerY) * Math.cos(radians);

  const rotatedElement: Size = {
    x: newX - element.w / 2,
    y: newY - element.h / 2,
    w: element.w,
    h: element.h
  };

  return rotatedElement;
}

/**
 * Creates a clone of ImageData
 */
export function cloneImageData(imageData: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  )
}

type CropCanvasOptions = {
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  flipHorizontal: boolean;
}

/**
 * Prepares new canvas with cropped area
 */
export function cropCanvas(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, {cropX, cropY, cropWidth, cropHeight, flipHorizontal}: CropCanvasOptions) {
  const croppedCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(cropWidth, cropHeight);
  const croppedContext = croppedCanvas.getContext('2d') as CanvasRenderingContext2D;

  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;

  if(flipHorizontal) {
    croppedContext.scale(-1, 1);
    croppedContext.translate(-cropWidth, 0);
  }

  croppedContext.drawImage(
    context.canvas,
    cropX, cropY, cropWidth, cropHeight, // Source
    0, 0, cropWidth, cropHeight // Destination
  );

  if(flipHorizontal) {
    croppedContext.setTransform(1, 0, 0, 1, 0, 0);
  }

  return croppedCanvas as HTMLCanvasElement;
}

/**
 * Crop `ImageData` (wrapped `cropCanvas`)
 */
export function cropImageData(imageData: ImageData, opts: CropCanvasOptions) {
  const tempCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(imageData.width, imageData.height);
  const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;

  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;

  tempContext.putImageData(imageData, 0, 0);

  return cropCanvas(tempContext, opts) as HTMLCanvasElement;
}

/**
 * Converts given array to array of signals
 */
export function mapToSignals<T>(arr: T[]): Signal<T>[] {
  return arr.map(el => createSignal(el));
}

/**
 * Returns inverted color for background
 */
export function getInvertedBackground(rgbString: string) {
  const [r, g, b] = rgbString.split(',').map(el => Number(el.trim()));
  if([r, g, b].some(color => isNaN(color) || color < 0 || color > 255)) {
    throw new Error('Invalid RGB string');
  }

  // Luminance calculation
  // https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.5 ? '0, 0, 0' : '255, 255, 255';
}
