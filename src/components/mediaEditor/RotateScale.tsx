import {For, onMount, onCleanup, createSignal, createEffect} from 'solid-js'
import {doubleRaf} from '../../helpers/schedulers';

type Scale = [number, number];

/**
 * Returns scale array
 */
function getScale(scale: Scale, step: number): number[] {
  const [start, end] = scale;
  const result: number[] = [];

  for(let i = start; i <= end; i += step) {
    result.push(i);
  }

  return result;
}

/**
 * Returns position of the searchable number on the scale, adjusted for text alignment.
 */
function getPositionOnScale(scale: Scale, width: number, search: number): number {
  const [start, end] = scale;
  const range = end - start;
  if(search < start || search > end) {
    throw new Error('Search value is out of the scale range');
  }

  const relativePosition = (search - start) / range;
  const positionInPixels = relativePosition * width;

  return positionInPixels;
}

/**
 * Opposite method for `getPositionOnScale`, adjusted for text alignment.
 */
function getScaleValueFromPosition(scale: Scale, width: number, position: number): number {
  const [start, end] = scale;
  const range = end - start;
  if(position < 0 || position > width) {
    throw new Error('Position value is out of the width range');
  }

  const relativePosition = position / width;
  const scaleValue = start + (relativePosition * range);

  return Math.ceil(scaleValue);
}

/**
 * Returns closes ceil scale value
 */
function getClosestScaleValue(scaleValues: number[], value: number): number {
  return scaleValues.reduce((prev, curr) => {
    return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
  });
}

type RotateScale = {
  current: number;
  max: Scale;
  scale: Scale;
  step: number;
  onChange(degrees: number): void;
  onRelease(degrees: number): void;
}

/**
 * Rotation scale input component
 */
export function RotateScale(props: RotateScale) {
  let scaleRef: HTMLDivElement;
  let containerRef: HTMLDivElement;
  const scale = getScale(props.scale, props.step);

  const [degrees, setDegrees] = createSignal(props.current);
  const [currentScaleValue, setCurrentScaleValue] = createSignal(getClosestScaleValue(scale, props.current));
  const [scaleRect, setScaleWidth] = createSignal<DOMRect>();
  const [containerRect, setContainerWidth] = createSignal<DOMRect>();
  const [position, setPosition] = createSignal(0);
  const [dragPosition, setDragPosition] = createSignal<number | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);
  const [trimmedPosition, setTrimmedPosition] = createSignal<number | null>(null);
  const [dragStart, setDragStart] = createSignal(-1);

  function calculatePosition() {
    const result = getPositionOnScale(props.scale, scaleRect().width, props.current);
    const containerCenter = containerRect().width / 2;
    setPosition((result - containerCenter) * -1);
  }

  async function updateSizes() {
    await doubleRaf()
    setScaleWidth(scaleRef.getBoundingClientRect());
    setContainerWidth(containerRef.getBoundingClientRect());
    calculatePosition();
  }

  function changeScaleWithTransition() {
    scaleRef.addEventListener('transitionend', () => {
      scaleRef.style.transition = 'none';
    }, {once: true});
    scaleRef.style.transition = '.2s ease transform';
    setDegrees(props.current);
    calculatePosition();
    setCurrentScaleValue(getClosestScaleValue(scale, props.current));
  }

  onMount(() => {
    updateSizes();
    window.addEventListener('resize', updateSizes);
  });

  onCleanup(() => {
    window.removeEventListener('resize', updateSizes);
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', onStop);
  });

  createEffect<number>((prev) => {
    if(prev !== props.current) {
      if(props.current !== degrees()) {
        changeScaleWithTransition();
      }
    }
    return props.current;
  }, props.current);

  createEffect<number>((prev) => {
    const newPosition = dragPosition();
    if(isDragging()) {
      if(prev !== newPosition) {
        const containerCenter = containerRect().width / 2;
        const pos = newPosition * -1 + containerCenter;
        const newValue = getScaleValueFromPosition(props.scale, scaleRect().width, pos);

        const trimmedValue = Math.max(props.max[0], Math.min(props.max[1], newValue));
        if(newValue !== trimmedValue) {
          if(trimmedPosition() === null) {
            const trimmedPositionValue = (getPositionOnScale(props.scale, scaleRect().width, trimmedValue) - containerCenter) * -1;
            setTrimmedPosition(trimmedPositionValue);
          }
        } else {
          if(trimmedPosition() !== null) {
            setTrimmedPosition(null);
          }
        }

        if(trimmedValue !== degrees()) {
          setDegrees(trimmedValue);
          props.onChange(trimmedValue);
          setCurrentScaleValue(getClosestScaleValue(scale, trimmedValue));
        }
      }
    }
    return newPosition;
  }, dragPosition())

  function startDrag(e: MouseEvent) {
    setDragStart(e.clientX);
    setIsDragging(true);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onStop);
  }

  function onDrag(e: MouseEvent) {
    if(isDragging()) {
      const dx = e.clientX - dragStart();
      const result = position() + dx;
      setDragPosition(result);
    }
  }

  function onStop() {
    setIsDragging(false);
    setDragStart(-1);
    setPosition(typeof trimmedPosition() === 'number' ? trimmedPosition() : dragPosition());
    props.onRelease(degrees());

    setDragPosition(null);
    setTrimmedPosition(null);

    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', onStop);
  }

  return <div ref={containerRef} class="rotate-scale-container" onMouseDown={startDrag}>
    <div
      ref={scaleRef}
      class="scale"
      style={{
        transform: `translateX(${typeof trimmedPosition() === 'number' ? trimmedPosition() : typeof dragPosition() === 'number' ? dragPosition() : position()}px)`
      }}
    >
      <For each={scale}>
        {item => <span class={currentScaleValue() === item ? 'active' : ''}>{String(item)}°</span>}
      </For>
    </div>
  </div>
}
