import {render} from 'solid-js/web'
import {createEffect} from 'solid-js'
import {type State} from './State';
import {LayerFrame} from './Frame';

type CanvasFrameProps = {
  state: State;
}

/**
 * Editable frame for canvas itself
 */
function CanvasFrame(props: CanvasFrameProps) {
  const [cropState, setCropState] = props.state.cropSignal;
  const [getScale] = props.state.canvasScaleSignal;
  const [size] = props.state.canvasSizeSignal;

  return (
    <LayerFrame
      lockAspectRatio={false}
      canvasWidth={size().width}
      canvasHeight={size().height}
      size={{
        x: cropState().x,
        y: cropState().y,
        w: cropState().w,
        h: cropState().h,
        angle: 0
      }}
      active={true}
      canvasScale={getScale()}
      onResize={(size) => {
        setCropState(prev => ({...prev, ...size}));
      }}
      onStopResize={() => {
        props.state.setState({
          ...props.state.current,
          crop: cropState()
        });
      }}
      onMove={(pos) => {
        setCropState(prev => ({...prev, ...pos}));
      }}
      onStopDrag={() => {
        props.state.setState({
          ...props.state.current,
          crop: cropState()
        });
      }}
    />
  );
}

type AttachCanvasFrameProps = CanvasFrameProps;

/**
 * Attaches canvas frame to the editor
 */
export function attachCanvasFrame(props: AttachCanvasFrameProps) {
  const container = document.createElement('div');

  const [getScale] = props.state.canvasScaleSignal;
  const [getSize] = props.state.canvasSizeSignal;

  render(() => (
    <div class="canvas-frame" style={{
      '--canvas-scale': getScale(),
      'margin-left': `calc(${getSize().width}px / var(--canvas-scale) / -2)`
    }}>
      <CanvasFrame
        state={props.state}
      />
    </div>
  ), container);
  return container
}
