import {render} from 'solid-js/web'
import {type State} from './State';
import {ButtonIconTsx} from '../buttonIconTsx';
import {RotateScale} from './RotateScale';
import {rotateElement} from './utils';


type CropModeProps = {
  state: State;
  width: number;
  height: number;
  rotateCanvas(newAngle: number, angleDiff: number): ImageData;
  onRotationDone(newAngle: number): void;
}

/**
 * Crop mode
 */
function CropMode(props: CropModeProps) {
  const [cropState, setCropState] = props.state.cropSignal;

  function onRotate(angle: number, silent: boolean) {
    setCropState(prev => ({...prev, angle}));

    if(silent === false) {
      props.state.setState({
        ...props.state.current,
        crop: {
          ...props.state.current.crop,
          angle
        }
      });
    }
  }

  function onFlip() {
    const newFlip = !props.state.current.crop.flip;
    setCropState(prev => ({...prev, flip: newFlip}));

    props.state.setState({
      ...props.state.current,
      crop: {
        ...props.state.current.crop,
        flip: newFlip
      }
    });
  }

  return <>
    <ButtonIconTsx
      icon="rotate"
      noRipple={true}
      onClick={() => {
        if(props.state.current.crop.angle === -45) {
          onRotate(45, false);
        } else {
          onRotate(-45, false);
        }
      }}
    />

    <RotateScale
      current={cropState().angle}
      step={15}
      max={[-45, 45]}
      scale={[-180, 180]}
      onChange={(angle) => {
        onRotate(angle, true)
      }}
      onRelease={(angle) => {
        const diff = angle - props.state.current.crop.angle;
        const newLayers = [...props.state.current.layers].map(layer => ({
          ...layer,
          ...rotateElement(layer, diff, {x: 0, y: 0, w: props.width, h: props.height}),
          angle: layer.angle + diff
        }));

        props.state.setState({
          ...props.state.current,
          layers: newLayers,
          draw: props.rotateCanvas(angle, diff),
          crop: {
            ...props.state.current.crop,
            angle
          }
        });

        for(const layer of props.state.current.layers) {
          layer.controller?.redraw(layer);
        }

        props.onRotationDone(angle);
      }}
    />

    <ButtonIconTsx
      icon="flip_rotate"
      class={cropState().flip ? 'active' : undefined}
      noRipple={true}
      onClick={onFlip}
    />
  </>
}

/**
 * Attaches crop mode controls to the canvas
 */
export function attachCropMode(props: CropModeProps) {
  const container = document.createElement('div')
  container.classList.add('media-editor-crop');

  const [size] = props.state.canvasSizeSignal;
  render(() => (
    <CropMode
      state={props.state}
      width={size().width}
      height={size().height}
      rotateCanvas={props.rotateCanvas}
      onRotationDone={props.onRotationDone}
    />
  ), container);
  return container
}
