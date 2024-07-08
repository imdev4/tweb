import safeAssign from '../../helpers/object/safeAssign';
import ButtonIcon from '../buttonIcon';
import {createSignal, type Signal} from 'solid-js';
import {type MediaEditorState, type DrawTool, DrawType, type TextTool, TextStyle, type EditorLayer, type CropState} from './types';
import {type CanvasWorker} from './CanvasWorker';
import {mediaEditorFonts} from './TextTab';

type CanvasHistoryOptions = {
  canvasWorker: CanvasWorker;
  container: HTMLElement;
  initialState: MediaEditorState;
  drawContext: CanvasRenderingContext2D;
}

export class State {
  public historySignal: Signal<MediaEditorState[]>;
  public positionSignal: Signal<number>;
  public drawToolSignal: Signal<DrawTool>;
  public textToolSignal: Signal<TextTool>;
  public cropSignal: Signal<CropState>;
  public activeLayerSignal: Signal<string | null>;
  public canvasScaleSignal: Signal<number>;
  public canvasSizeSignal: Signal<{width: number; height: number}>;

  private canvasWorker: CanvasWorker;
  private drawContext: CanvasRenderingContext2D;
  private container: HTMLElement;
  private undoButton: HTMLElement;
  private redoButton: HTMLElement;

  constructor(options: CanvasHistoryOptions) {
    safeAssign(this, options);

    const history = this.createInternalSignal([options.initialState]);
    this.historySignal = [history.accessor, history.setter];

    const position = this.createInternalSignal<number>(Infinity);
    this.positionSignal = [position.accessor, position.setter];

    const activeLayer = this.createInternalSignal<string | null>(null);
    this.activeLayerSignal = [activeLayer.accessor, activeLayer.setter];

    const cropSignal = this.createInternalSignal<CropState>(options.initialState.crop);
    this.cropSignal = [cropSignal.accessor, cropSignal.setter];

    const canvasScaleSignal = this.createInternalSignal(1);
    this.canvasScaleSignal = [canvasScaleSignal.accessor, canvasScaleSignal.setter];

    const canvasSizeSignal = this.createInternalSignal({width: options.drawContext.canvas.width, height: options.drawContext.canvas.height});
    this.canvasSizeSignal = [canvasSizeSignal.accessor, canvasSizeSignal.setter];

    const drawTool = this.createInternalSignal<DrawTool>({
      type: DrawType.Pen,
      size: 14,
      color: '255, 255, 255'
    });
    this.drawToolSignal = [drawTool.accessor, drawTool.setter];

    const textTool = this.createInternalSignal<TextTool>({
      style: TextStyle.NoFrame,
      textAlign: 'left',
      color: '255, 255, 255',
      ...mediaEditorFonts[0]
    });
    this.textToolSignal = [textTool.accessor, textTool.setter];

    this.undoButton = ButtonIcon('undo');
    this.undoButton.addEventListener('click', () => {
      this.undo();
    });
    this.container.append(this.undoButton);

    this.redoButton = ButtonIcon('redo');
    this.redoButton.addEventListener('click', () => {
      this.redo();
    });
    this.container.append(this.redoButton);
    this.revalidateButtons();
  }

  private createInternalSignal<T>(initialState: T) {
    const [accessor, setter] = createSignal<T>(initialState);
    return {
      accessor,
      setter,
      signal: [accessor, setter]
    }
  }

  public get current(): MediaEditorState {
    const [historyState] = this.historySignal;
    const history = historyState();
    const [positionState] = this.positionSignal;
    const position = positionState();

    if(position === Infinity) {
      return history[history.length - 1];
    }
    return history[position];
  }

  private revalidateButtons() {
    if(this.canRedo()) {
      this.redoButton.removeAttribute('disabled');
    } else {
      this.redoButton.setAttribute('disabled', 'disabled');
    }

    if(this.canUndo()) {
      this.undoButton.removeAttribute('disabled');
    } else {
      this.undoButton.setAttribute('disabled', 'disabled');
    }
  }

  public addLayer(layer: EditorLayer) {
    const newZ = this.getMaxZIndex();
    const newLayer: EditorLayer = ({...layer, z: newZ});

    this.setState({
      ...this.current,
      layers: [...this.current.layers, newLayer]
    });
  }

  public removeLayer(id: string) {
    const layerIndex = this.current.layers.findIndex(layer => layer.id === id);
    if(layerIndex < 0) {
      throw new Error('Cannot remove layer');
    }

    const newLayers = [...this.current.layers];
    newLayers.splice(layerIndex, 1);

    this.setState({
      ...this.current,
      layers: newLayers
    });
  }

  public getMaxZIndex() {
    return Math.max(1000, ...this.current.layers.map(layer => layer.z)) + 10
  }

  public updateLayer(id: string, update: Partial<EditorLayer>) {
    const layerIndex = this.current.layers.findIndex(layer => layer.id === id);
    if(layerIndex < 0) {
      throw new Error('Cannot find layer');
    }

    const layers = [...this.current.layers];
    layers[layerIndex] = {
      ...layers[layerIndex],
      ...update
    } as EditorLayer;

    this.setState({
      ...this.current,
      layers
    });
  }

  public setState(historyItem: MediaEditorState) {
    const [position, positionSet] = this.positionSignal;
    const [, historySet] = this.historySignal;
    historySet(prev => {
      return [...prev.slice(0, position() + 1), historyItem]
    });

    if(position() !== Infinity) {
      positionSet(Infinity);
    }

    this.revalidateButtons();
  };

  private applyHistory(historyItem: MediaEditorState) {
    this.canvasWorker.rotateCanvas({
      angle: historyItem.crop.angle
    });
    this.canvasWorker.applyEffects({
      effects: historyItem.effects
    });
    this.drawContext.putImageData(historyItem.draw, 0, 0);

    const [, setCrop] = this.cropSignal;
    setCrop(historyItem.crop);
  }

  public canUndo() {
    const [historyState] = this.historySignal;
    const history = historyState();
    const [positionState] = this.positionSignal;
    const position = positionState();

    return history.length > 1 && position !== 0;
  }

  public canRedo() {
    const [historyState] = this.historySignal;
    const history = historyState();
    const [positionState] = this.positionSignal;
    const position = positionState();
    return history.length > 1 && position !== Infinity && position < history.length - 1;
  }

  public undo() {
    if(!this.canUndo()) {
      return;
    }

    const [historyState] = this.historySignal;
    const history = historyState();
    const [positionState, positionSet] = this.positionSignal;
    const position = positionState();
    const prevPosition = position === Infinity ? history.length - 2 : position - 1;
    positionSet(prevPosition);
    this.applyHistory(history[prevPosition]);
    this.revalidateButtons();
  }

  public redo() {
    if(!this.canRedo()) {
      return;
    }

    const [historyState] = this.historySignal;
    const history = historyState();
    const [positionState, positionSet] = this.positionSignal;
    const position = positionState();
    const prevPosition = position + 1;
    positionSet(prevPosition);
    this.applyHistory(history[prevPosition]);
    this.revalidateButtons();
  }
}
