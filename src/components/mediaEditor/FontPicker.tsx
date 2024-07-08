import Section from '../section';
import {i18n} from '../../lib/langPack';
import {type FontItem} from './types';

type Props = {
  fonts: FontItem[];
  current: string;
  onChange(font: FontItem): void;
}

export function FontPicker(props: Props) {
  return <Section class="font-picker">
    <div class="font-row-text">{i18n('MediaEditor.Popup.Font')}</div>

    {props.fonts.map(font => {
      const isSelected = props.current === font.fontFamily;
      return (
        <div
          class={`font-selector section-item ${isSelected ? 'active' : ''}`}
          aria-label={font.name}
          onClick={() => props.onChange(font)}
          style={{
            'font-family': font.fontFamily,
            'font-size': font.fontSize + 'px',
            'font-style': font.fontStyle,
            'font-weight': font.fontWeight
          }}
        >
          {font.name}
        </div>
      );
    })}
  </Section>
}
