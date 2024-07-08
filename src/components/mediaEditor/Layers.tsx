import {render} from 'solid-js/web'
import {type Signal, createSignal, createEffect, onMount, onCleanup, For} from 'solid-js';
import {type State} from './State';
import {type EditorLayer, EditorLayerText, EditorLayerType, type Size, TextStyle} from './types';
import safeAssign from '../../helpers/object/safeAssign';
import {doubleRaf} from '../../helpers/schedulers';
import {getInvertedBackground, primitiveEqual, setCaretPosition, getCaretPosition, mapToSignals} from './utils';
import {LayerFrame} from './Frame';


type LayerControllerOptions = {
  data: EditorLayer;
  width: number;
  height: number;
  canvas?: HTMLCanvasElement;
  svg?: SVGSVGElement;
}

export class LayerController {
  public canvas?: HTMLCanvasElement;
  public context?: CanvasRenderingContext2D;
  public svg?: SVGSVGElement;
  private data: EditorLayer;
  private width: number;
  private height: number;

  constructor(options: LayerControllerOptions) {
    safeAssign(this, options);

    if(this.data.type !== EditorLayerType.Text) {
      this.context = this.canvas.getContext('2d', {
        willReadFrequently: true
      });
    }

    if(this.data.type === EditorLayerType.VideoSticker) {
      this.redrawVideo();
    }

    this.redraw(this.data);
  }

  private raf: number;
  private redrawVideo() {
    if(this.data.type === EditorLayerType.VideoSticker) {
      if(!this.data.video) {
        return window.cancelAnimationFrame(this.raf);
      }

      this.redrawRotatedContent(this.data.video);
      this.raf = window.requestAnimationFrame(() => {
        this.redrawVideo();
      });
    }
  }

  private redrawRotatedContent(image: CanvasImageSource) {
    if(!this.canvas || !this.context) {
      throw new Error('Cannot redraw content');
    }

    this.context.clearRect(0, 0, this.width, this.height);
    const radians = this.data.angle * (Math.PI / 180);
    this.context.save();
    this.context.translate(this.data.x + this.data.w / 2, this.data.y + this.data.h / 2);
    this.context.rotate(radians);
    this.context.drawImage(image, -this.data.w / 2, -this.data.h / 2, this.data.w, this.data.h);
    this.context.restore();
  }

  public redraw(data: EditorLayer) {
    this.data = data;

    if(this.data.type === EditorLayerType.StaticSticker) {
      this.redrawRotatedContent(this.data.image);
    } else if(this.data.type === EditorLayerType.LottieSticker) {
      this.redrawRotatedContent(this.data.player.canvas[0]);
      if(!this.data.player.overrideRender) {
        this.data.player.overrideRender = (frame) => {
          if(frame instanceof ImageBitmap || frame instanceof HTMLCanvasElement) {
            this.redrawRotatedContent(frame);
          } else {
            throw new Error('Cannot render this type of animated stickers')
          }
        }
      }
    } else if(this.data.type === EditorLayerType.VideoSticker) {
      this.redrawRotatedContent(this.data.video);
    }
  }
}

type LayerProps = {
  data: Signal<EditorLayer>;
  width: number;
  height: number;
  canvasScale: number;
  active: boolean;
  onSelect(): void;
  deleteLayer(): void;
  updateState(newData: Partial<EditorLayer>): void;
  getMaxZIndex(): number;
}

const caretCache = new Map<string, number>();

function Layer(props: LayerProps) {
  const [data, updateData] = props.data;
  let canvas: HTMLCanvasElement;
  let svg: SVGSVGElement;
  let controller: LayerController;
  onMount(() => {
    const currentData = data();
    controller = new LayerController({
      svg,
      canvas,
      data: currentData,
      width: props.width,
      height: props.height
    });

    let update;
    updateData(prev => {
      update = {...prev, controller};
      return update;
    });
  });

  createEffect(() => {
    controller.redraw(data());
  });

  async function checkFocus() {
    await doubleRaf();
    const editableElement = document.getElementById(`editable-${state.id}`);
    setCaretPosition(editableElement, caretCache.get(state.id) || 0);
  }

  createEffect((prev) => {
    if(state.type === EditorLayerType.Text) {
      if(prev !== props.active) {
        if(props.active) {
          checkFocus();
        } else {
          // Delete layer if no text is provided
          if(!state.text) {
            props.deleteLayer();
          }
        }
      }
    }
    return props.active;
  }, props.active);

  async function onInput(e: Event) {
    if(e.target instanceof HTMLElement) {
      const newText = e.target.innerText;
      caretCache.set(data().id, getCaretPosition())
      if(newText !== (data() as EditorLayerText).text) {
        let update;
        updateData(prev => {
          update = {...prev, text: newText};
          return update;
        });

        props.updateState(update);
      }
    }
  }

  function zIndexToTop() {
    updateData(prev => ({...prev, z: props.getMaxZIndex()}));
  }

  function onRotate(angle: number) {
    updateData(prev => ({
      ...prev,
      angle
    }));
  }

  function onMove(pos: Pick<Size, 'x' | 'y'>) {
    updateData(prev => ({
      ...prev,
      ...pos
    }));
  }

  function onResize(size: Size) {
    updateData(prev => ({
      ...prev,
      ...size
    }));
  }

  function sync() {
    props.updateState(data());
  }

  const state = data();

  return <div
    class={`layer layer-${state.type}`}
    style={{
      // TODO: try narrow images
      'height': '100%',
      'aspect-ratio': `${props.width} / ${props.height}`,
      'z-index': String(data().z)
    }}
  >
    <LayerFrame
      size={props.data[0]()}
      canvasScale={props.canvasScale}
      active={props.active}
      onSelect={props.onSelect}
      canvasHeight={props.height}
      canvasWidth={props.width}
      onStartResize={zIndexToTop}
      onStopResize={sync}
      onStopRotation={sync}
      onStopDrag={sync}
      onStartDrag={zIndexToTop}
      onStartRotation={zIndexToTop}
      onRotate={onRotate}
      onMove={onMove}
      onResize={onResize}
      lockAspectRatio={state.type !== EditorLayerType.Text}
    />
    {state.type === EditorLayerType.Text ?
      <svg
        ref={svg}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          '--canvas-scale': props.canvasScale,
          'z-index': String(data().z),
          'width': '100%',
          'height': '100%'
        }}
      >
        <foreignObject
          style={{
            'text-align': 'center',
            'width': `calc(${data().w}px / var(--canvas-scale))`,
            'height': `calc(${data().h}px / var(--canvas-scale))`,
            'transform': `translate(calc(${data().x}px / var(--canvas-scale)), calc(${data().y}px / var(--canvas-scale))) rotate(${data().angle}deg)`,
            'transform-origin': `calc(${data().w}px / var(--canvas-scale) / 2) calc(${data().h}px / var(--canvas-scale) / 2)`
          }}
        >
          <p
            id={`editable-${state.id}`}
            ref={checkFocus}
            style={{
              'text-align': state.textAlign,
              'display': 'inline-block',
              'max-width': '100%',
              'color': `rgba(${state.style === TextStyle.White ? getInvertedBackground(state.color) : state.color}, 1)`,
              'font-family': state.fontFamily,
              'font-size': state.fontSize + 'px',
              'font-weight': state.fontWeight,
              'font-style': state.fontStyle,
              'border-radius': '10px',
              'background-color': `rgba(${state.style === TextStyle.White ? `${state.color}, 1` : state.style === TextStyle.Black ? getInvertedBackground(state.color) : '255, 255, 255, 0'})`,
              'line-height': 1.25
            }}
            contentEditable={true}
            onInput={onInput}
          >
            {state.text}
          </p>
        </foreignObject>
      </svg> :
      <canvas
        ref={canvas}
        width={props.width}
        height={props.height}
      />
    }
  </div>
}

type LayersProps = {
  state: State;
  width: number;
  height: number;
}

/**
 * Renderers layers on the canvas (text/stickers)
 */
function Layers(props: LayersProps) {
  const [layers, setLayers] = createSignal<Signal<EditorLayer>[]>(mapToSignals(props.state.current.layers));
  const [activeLayer, setActiveLayer] = props.state.activeLayerSignal;
  const [getScale] = props.state.canvasScaleSignal;

  function onDelete(e: KeyboardEvent) {
    const layerId = activeLayer();
    if(e.key === 'Backspace' && layerId !== null) {
      const isInEditable = e.target instanceof HTMLElement && e.target.hasAttribute('contenteditable');
      if(isInEditable && e.target.innerHTML.length) {
        return;
      }
      props.state.removeLayer(layerId);
    }
  }

  onMount(() => {
    window.addEventListener('keyup', onDelete);
  });

  onCleanup(() => {
    window.removeEventListener('keyup', onDelete);
  });

  const [position] = props.state.positionSignal;
  createEffect<number>((prev) => {
    if(prev !== position() || layers().length !== props.state.current.layers.length) {
      setLayers([...mapToSignals(props.state.current.layers)]);
    }
    return position();
  }, position());

  const [history] = props.state.historySignal;
  createEffect<EditorLayer[]>((prev) => {
    if(history().length) {
      if(!primitiveEqual(prev, props.state.current.layers)) {
        setLayers([...mapToSignals(props.state.current.layers)]);
      }
    }
    return props.state.current.layers;
  }, props.state.current.layers);

  return <For each={layers()}>
    {layer => (
      <Layer
        data={layer}
        width={props.width}
        height={props.height}
        canvasScale={getScale()}
        active={layer[0]().id === activeLayer()}
        onSelect={() => setActiveLayer(layer[0]().id)}
        getMaxZIndex={() => props.state.getMaxZIndex()}
        deleteLayer={() => props.state.removeLayer(layer[0]().id)}
        updateState={(newData) => props.state.updateLayer(layer[0]().id, newData)}
      />
    )}
  </For>
}

export function attachLayers(state: State, width: number, height: number) {
  const container = document.createElement('div')
  container.classList.add('media-editor-layers');

  render(() => <Layers state={state} width={width} height={height} />, container);
  return container
}
