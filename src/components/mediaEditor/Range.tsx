import {i18n, type LangPackKey} from '../../lib/langPack';
import {RangeSelectorTsx} from '../rangeSelectorTsx';
import Section from '../section';

type Item = {
  step: number;
  min: number;
  max: number;
  name: LangPackKey;
}

type RenderRangeProps = {
  item: Item;
  value: number;
  color?: string;
  className?: string;
  onChange(newValue: number): void;
  onRelease?(): void;
}

export function RangeRow(props: RenderRangeProps) {
  return (
    <Section class={props.className} noDelimiter={true} noShadow={true} style={{'--primary-color': props.color ? `rgb(${props.color})` : undefined}}>
      <div class="range-row-text">
        <span>{i18n(props.item.name)}</span>
        {/* TODO: rerender value */}
        {/* TODO: gray color in Enhance, blue numbers (if not default) */}
        {/* TODO: white color in Text */}
        <span>{props.value}</span>
      </div>
      <RangeSelectorTsx
        step={props.item.step}
        min={props.item.min}
        max={props.item.max}
        value={props.value}
        onScrub={props.onChange}
        onMouseUp={props.onRelease}
      />
    </Section>
  );
}
