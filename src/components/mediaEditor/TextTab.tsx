import {render} from 'solid-js/web'
import {createEffect} from 'solid-js'
import {MediaEditorTab, type MediaEditorTabOptions} from './EditorTab';
import {ColorPickerRow} from './ColorPicker';
import {RangeRow} from './Range';
import {FontPicker} from './FontPicker';
import {type FontItem, type EditorLayerText, EditorLayerType, TextStyle, type TextAlign, type OptionalRecord} from './types';
import {ButtonIconTsx} from '../buttonIconTsx';

/**
 * DISCLAIMER: These fonts are system ones and they have proprietary license (Apple).
 * So we used here system ones + similar fallbacks for another platforms.
 *
 * NOTE: To use the same font on different platforms we need to buy a license for each font.
 * https: //support.apple.com/en-us/103197
 */
export const mediaEditorFonts: FontItem[] = [
  {
    name: 'Roboto',
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 16
  },
  {
    name: 'Typewriter',
    fontFamily: `'AmericanTypewriter', 'Courier New', Courier, monospace`,
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 16
  },
  {
    name: 'Avenir Next',
    fontFamily: `'Avenir Next', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
    fontStyle: 'italic',
    fontWeight: 700,
    fontSize: 16
  },
  {
    name: 'Courier New',
    fontFamily: `'Courier New PS Bold MT', 'Courier New', Courier, monospace`,
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: 16
  },
  {
    name: 'Noteworthy',
    fontFamily: `'Noteworthy', 'Comic Sans MS', 'Marker Felt', sans-serif`,
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: 16
  },
  {
    name: 'Georgia',
    fontFamily: `'Georgia Bold', Georgia, 'Times New Roman', Times, serif`,
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: 16
  },
  {
    name: 'Papyrus',
    fontFamily: `'Papyrus', 'Comic Sans MS', cursive, sans-serif`,
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 19
  },
  {
    name: 'Snell Roundhand',
    fontFamily: `'Snell Roundhand', 'Brush Script MT', cursive`,
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: 16
  }
];


const styles: Record<TextStyle, Icon> = {
  [TextStyle.NoFrame]: 'text_ornament_no_frame',
  [TextStyle.Black]: 'text_ornament_black',
  [TextStyle.White]: 'text_ornament_white'
}
const stylesArray = Object.entries(styles) as [TextStyle, Icon][];

const aligns: OptionalRecord<TextAlign, Icon> = {
  'left': 'align_left',
  'center': 'align_centre',
  'right': 'align_right'
};
const alignsArray = Object.entries(aligns) as [TextAlign, Icon][];


type StylingSelectorProps<T extends string, P extends OptionalRecord<T, Icon>> = {
  current: T;
  data: [T, Icon][];
  onChange(style: T): void;
}

/**
 * Generic styling selector
 */
function StylingSelector<T extends string, P extends OptionalRecord<T, Icon>>(props: StylingSelectorProps<T, P>) {
  return <div>
    {props.data.map(([value, icon]) => (
      <ButtonIconTsx
        icon={icon}
        noRipple={true}
        onClick={() => props.onChange(value)}
        class={[value === props.current ? 'active' : undefined, `styling-icon-${icon}`].filter(Boolean).join(' ')}
      />
    ))}
  </div>
}

export class TextMediaEditorTab extends MediaEditorTab {
  constructor(options: MediaEditorTabOptions) {
    super(options);

    this.langKey = 'MediaEditor.Popup.Tabs.Text';
    this.icon = 'text';
    this.construct = this.render.bind(this);
    this.build();
  }

  private async render(container: HTMLElement) {
    render(() => {
      const [state, setState] = this.state.textToolSignal;
      const [activeLayer] = this.state.activeLayerSignal;

      createEffect<string>((prev) => {
        const layerId = activeLayer();
        if(layerId !== prev && layerId !== null) {
          const layer = this.state.current.layers.find(el => el.id === layerId);
          if(!layer) {
            throw new Error('Cannot find layer');
          }

          if(layer.type === EditorLayerType.Text) {
            setState({
              ...state(),
              fontFamily: layer.fontFamily,
              fontSize: layer.fontSize,
              fontStyle: layer.fontStyle,
              fontWeight: layer.fontWeight,
              color: layer.color
            })
          }
        }
        return layerId
      }, activeLayer());

      const updateLayer = (data: Partial<EditorLayerText>) => {
        const layerId = activeLayer();
        if(layerId !== null) {
          this.state.updateLayer(layerId, data);
        }
      }

      return <>
        <ColorPickerRow
          color={state().color}
          onChange={newColor => {
            setState(prev => ({...prev, color: newColor}));
            updateLayer({color: newColor});
          }}
        />

        <div class="text-styling">
          <StylingSelector
            data={alignsArray}
            current={state().textAlign}
            onChange={textAlign => {
              setState(prev => ({...prev, textAlign}));
              updateLayer({textAlign});
            }}
          />

          <StylingSelector
            data={stylesArray}
            current={state().style}
            onChange={style => {
              setState(prev => ({...prev, style}));
              updateLayer({style});
            }}
          />
        </div>

        <RangeRow
          className='size-selector-row'
          item={{
            name: 'MediaEditor.Popup.Size',
            min: 8,
            max: 32,
            step: 1
          }}
          value={state().fontSize}
          onChange={newValue => {
            setState(prev => ({...prev, fontSize: newValue}));
            updateLayer({fontSize: newValue});
          }}
          color={state().color}
        />
        <FontPicker
          fonts={mediaEditorFonts}
          current={state().fontFamily}
          onChange={({fontSize, ...font}) => {
            setState(prev => ({...prev, ...font}));
            updateLayer({...font});
          }}
        />
      </>
    }, container);
  }
}
