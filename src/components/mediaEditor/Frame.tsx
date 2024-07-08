import {createSignal, createEffect} from 'solid-js';
import {HandlesTypes, type Size} from './types';
import clamp from '../../helpers/number/clamp';

type LayerFrameProps = {
  size: Size & {z?: number; angle?: number;};
  canvasScale: number;
  canvasWidth: number;
  canvasHeight: number;
  active: boolean;
  lockAspectRatio: boolean;
  onRotate?(angle: number): void;
  onMove?(pos: Pick<Size, 'x' | 'y'>): void;
  onResize?(size: Size): void;
  onSelect?(): void;
  onStartResize?(): void;
  onStopResize?(): void;
  onStartDrag?(): void;
  onStopDrag?(): void;
  onStartRotation?(): void;
  onStopRotation?(): void;
}

type ResizeState = {
  isResizing: true;
  type: HandlesTypes;
  aspectRatio: number;
} | {
  isResizing: false;
}

type RotateState = {
  isRotating: true;
  type: HandlesTypes;
  offsetLeft: number;
  offsetTop: number;
  centerX: number;
  centerY: number;
  initialDegrees: number;
} | {
  isRotating: false;
}

type DragState = {
  isDragging: true;
  startX: number;
  startY: number;
} | {
  isDragging: false;
}

type GetNewSizeProps = {
  currentState: Size;
  type: HandlesTypes;
  canvasScale: number;
  movementX: number;
  movementY: number;
  aspectRatio: number;
  lockAspectRatio: boolean;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function getNewSize(props: GetNewSizeProps): Size {
  const {
    minWidth, maxWidth,
    minHeight, maxHeight,
    minX, maxX,
    minY, maxY
  } = props;

  const dx = (props.movementX * props.canvasScale);
  const dy = (props.movementY * props.canvasScale);

  if(props.type === HandlesTypes.BottomRight) {
    if(props.lockAspectRatio) {
      let newWidth = clamp(props.currentState.w + dx, minWidth, maxWidth);
      let newHeight = newWidth / props.aspectRatio;
      if(newHeight + props.currentState.y > maxY) {
        newHeight = maxY - props.currentState.y;
        newWidth = newHeight * props.aspectRatio;
      }
      if(newHeight < minHeight) {
        newHeight = minHeight;
        newWidth = newHeight * props.aspectRatio;
      }
      return {
        x: clamp(props.currentState.x, minX, maxX - newWidth),
        y: clamp(props.currentState.y, minY, maxY - newHeight),
        h: newHeight,
        w: newWidth
      };
    }

    return {
      x: clamp(props.currentState.x, minX, maxX - props.currentState.w),
      y: clamp(props.currentState.y, minY, maxY - props.currentState.h),
      h: clamp(props.currentState.h + dy, minHeight, maxHeight),
      w: clamp(props.currentState.w + dx, minWidth, maxWidth)
    };
  } else if(props.type === HandlesTypes.BottomLeft) {
    if(props.lockAspectRatio) {
      let newWidth = clamp(props.currentState.w - dx, minWidth, maxWidth);
      let newHeight = newWidth / props.aspectRatio;
      if(newHeight + props.currentState.y > maxY) {
        newHeight = maxY - props.currentState.y;
        newWidth = newHeight * props.aspectRatio;
      }
      if(newHeight < minHeight) {
        newHeight = minHeight;
        newWidth = newHeight * props.aspectRatio;
      }
      return {
        x: clamp(props.currentState.x + (props.currentState.w - newWidth), minX, maxX - newWidth),
        y: clamp(props.currentState.y, minY, maxY - newHeight),
        h: newHeight,
        w: newWidth
      };
    }

    return {
      x: clamp(props.currentState.x + dx, minX, maxX - props.currentState.w + dx),
      y: clamp(props.currentState.y, minY, maxY - props.currentState.h),
      h: clamp(props.currentState.h + dy, minHeight, maxHeight),
      w: clamp(props.currentState.w - dx, minWidth, maxWidth)
    };
  } else if(props.type === HandlesTypes.TopLeft) {
    if(props.lockAspectRatio) {
      let newWidth = clamp(props.currentState.w - dx, minWidth, maxWidth);
      let newHeight = newWidth / props.aspectRatio;
      if(newHeight + props.currentState.y > maxY) {
        newHeight = maxY - props.currentState.y;
        newWidth = newHeight * props.aspectRatio;
      }
      if(newHeight < minHeight) {
        newHeight = minHeight;
        newWidth = newHeight * props.aspectRatio;
      }
      return {
        x: clamp(props.currentState.x + (props.currentState.w - newWidth), minX, maxX - newWidth),
        y: clamp(props.currentState.y + (props.currentState.h - newHeight), minY, maxY - newHeight),
        h: newHeight,
        w: newWidth
      };
    }

    return {
      x: clamp(props.currentState.x + dx, minX, maxX - props.currentState.w + dx),
      y: clamp(props.currentState.y + dy, minY, maxY - props.currentState.h + dy),
      h: clamp(props.currentState.h - dy, minHeight, maxHeight),
      w: clamp(props.currentState.w - dx, minWidth, maxWidth)
    };
  } else if(props.type === HandlesTypes.TopRight) {
    if(props.lockAspectRatio) {
      let newWidth = clamp(props.currentState.w + dx, minWidth, maxWidth);
      let newHeight = newWidth / props.aspectRatio;
      if(newHeight + props.currentState.y > maxY) {
        newHeight = maxY - props.currentState.y;
        newWidth = newHeight * props.aspectRatio;
      }
      if(newHeight < minHeight) {
        newHeight = minHeight;
        newWidth = newHeight * props.aspectRatio;
      }
      return {
        x: clamp(props.currentState.x, minX, maxX - newWidth),
        y: clamp(props.currentState.y + (props.currentState.h - newHeight), minY, maxY - newHeight),
        h: newHeight,
        w: newWidth
      };
    }

    return {
      x: clamp(props.currentState.x, minX, maxX - props.currentState.w),
      y: clamp(props.currentState.y + dy, minY, maxY - props.currentState.h + dy),
      h: clamp(props.currentState.h - dy, minHeight, maxHeight),
      w: clamp(props.currentState.w + dx, minWidth, maxWidth)
    };
  }

  return props.currentState;
}

/**
 * Frame component with rotate/resize/move features
 */
export function LayerFrame(props: LayerFrameProps) {
  const [resizingState, setResizingState] = createSignal<ResizeState>({
    isResizing: false
  });
  const [rotateState, setRotateState] = createSignal<RotateState>({
    isRotating: false
  });
  const [draggingState, setDraggingState] = createSignal<DragState>({
    isDragging: false
  });

  function startResize(type: HandlesTypes) {
    props.onStartResize?.();

    setResizingState({
      isResizing: true,
      aspectRatio: props.size.w / props.size.h,
      type
    });
  }

  function stopResize() {
    setResizingState({
      isResizing: false
    });

    props.onStopResize?.();
  }

  function onResize(e: MouseEvent) {
    const state = resizingState();
    if(state.isResizing) {
      const newSize = getNewSize({
        currentState: props.size,
        type: state.type,
        canvasScale: props.canvasScale,
        movementX: e.movementX,
        movementY: e.movementY,
        aspectRatio: state.aspectRatio,
        lockAspectRatio: props.lockAspectRatio,
        minHeight: 32,
        minWidth: 32,
        maxHeight: props.canvasHeight,
        maxWidth: props.canvasWidth,
        minX: 0,
        minY: 0,
        maxY: props.canvasHeight,
        maxX: props.canvasWidth
      });

      props.onResize(newSize);
    }
  }

  createEffect(() => {
    const {isResizing} = resizingState();
    if(isResizing) {
      window.addEventListener('mousemove', onResize)
      window.addEventListener('mouseup', stopResize)
    } else {
      window.removeEventListener('mousemove', onResize)
      window.removeEventListener('mouseup', stopResize)
    }
  });

  function startDrag(e: MouseEvent) {
    if(e.target instanceof HTMLElement && !e.target.classList.contains('resize-handle') && !e.target.classList.contains('rotate-handle')) {
      props.onStartDrag?.();
      setDraggingState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY
      });
    }
  }

  function onDrag(e: MouseEvent) {
    const state = draggingState();
    if(state.isDragging) {
      const x = (e.movementX * props.canvasScale) + props.size.x;
      const y = (e.movementY * props.canvasScale) + props.size.y;

      props.onMove({
        x: clamp(x, 0, props.canvasWidth - props.size.w),
        y: clamp(y, 0, props.canvasHeight - props.size.h)
      });
    }
  }

  function stopDrag() {
    setDraggingState({
      isDragging: false
    });

    props.onStopDrag?.();
  }

  createEffect(() => {
    const {isDragging} = draggingState()
    if(isDragging) {
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', stopDrag)
    } else {
      window.removeEventListener('mousemove', onDrag)
      window.removeEventListener('mouseup', stopDrag)
    }
  });

  function startRotate(e: MouseEvent, type: HandlesTypes) {
    if(!(e.target instanceof HTMLElement)) {
      throw new Error('Cannot start rotation');
    }

    const mainCanvas = e.target.closest('.popup-body').querySelector('.main-canvas');
    if(!(mainCanvas instanceof HTMLElement)) {
      throw new Error('Cannot start rotation');
    }

    props.onStartRotation?.();

    const rect = mainCanvas.getBoundingClientRect();
    const centerX = (props.size.x / props.canvasScale) + (props.size.w / 2 / props.canvasScale);
    const centerY = (props.size.y / props.canvasScale) + (props.size.h / 2 / props.canvasScale);

    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const initialRadians = Math.atan2(cursorY - centerY, cursorX - centerX);
    const initialDegrees = (initialRadians * (180 / Math.PI)) - props.size.angle;

    setRotateState({
      isRotating: true,
      type,
      offsetLeft: rect.left,
      offsetTop: rect.top,
      centerX,
      centerY,
      initialDegrees
    });
  }

  function stopRotate() {
    setRotateState({
      isRotating: false
    });

    props.onStopRotation?.();
  }

  function onRotate(e: MouseEvent) {
    const state = rotateState();
    if(state.isRotating) {
      const cursorX = e.clientX - state.offsetLeft;
      const cursorY = e.clientY - state.offsetTop;

      const dy = cursorY - state.centerY;
      const dx = cursorX - state.centerX;

      const radians = Math.atan2(dy, dx);
      const degrees = Math.ceil((radians * (180 / Math.PI)));

      const result = degrees - state.initialDegrees;
      props.onRotate(result);
    }
  }

  createEffect(() => {
    const {isRotating} = rotateState()
    if(isRotating) {
      window.addEventListener('mousemove', onRotate)
      window.addEventListener('mouseup', stopRotate)
    } else {
      window.removeEventListener('mousemove', onRotate)
      window.removeEventListener('mouseup', stopRotate)
    }
  });

  return <div
    class={`frame ${rotateState().isRotating || draggingState().isDragging || resizingState().isResizing || props.active ? 'active' : ''}`}
    style={{
      'width': `calc(${props.size.w}px / var(--canvas-scale))`,
      'height': `calc(${props.size.h}px / var(--canvas-scale))`,
      'transform': `translate(calc(${props.size.x}px / var(--canvas-scale)), calc(${props.size.y}px / var(--canvas-scale))) rotate(${props.size.angle}deg)`,
      'z-index': String(props.size.z + 1)
    }}
    onMouseDown={props.onMove ? startDrag : undefined}
    onMouseUp={props.onSelect}
  >
    {[HandlesTypes.TopLeft, HandlesTypes.TopRight, HandlesTypes.BottomLeft, HandlesTypes.BottomRight].map(type => (
      <>
        {props.onResize ? <div class={`resize-handle type-${type}`} onMouseDown={() => startResize(type)} /> : undefined}
        {props.onRotate ? <div class={`rotate-handle type-${type}`} onMouseDown={(e) => startRotate(e, type)} /> : undefined}
      </>
    ))}
  </div>
}
