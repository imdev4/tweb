import {createSignal, createEffect, onMount} from 'solid-js';
import {createStore} from 'solid-js/store';
import ColorPicker from '../colorPicker';

const presets = [
  '255, 255, 255', // #FFFFFF
  '254, 68, 56',   // #FE4438
  '255, 137, 1',   // #FF8901
  '255, 214, 10',  // #FFD60A
  '51, 199, 89',   // #33C759
  '98, 229, 224',  // #62E5E0
  '10, 132, 255',  // #0A84FF
  '189, 92, 243'   // #BD5CF3
];

type Props = {
  color: string;
  onChange(newColor: string): void;
}

/**
 * Color picker for editor
 */
export function ColorPickerRow(props: Props) {
  const [colorPicker] = createStore(new ColorPicker({
    linesWidth: 312,
    linesHeight: 60,
    paletteWidth: 208,
    paletteHeight: 130,
    circleTop: 19,
    onChange: ({rgbaArray}) => {
      const newColor = rgbaArray.slice(0, 3).join(', ')
      setCurrentColor(newColor);
      props.onChange(newColor);
    }
  }));

  const [currentColor, setCurrentColor] = createSignal<string>(presets[0]);
  const [isColorPickerOpened, setIsColorPickerOpened] = createSignal(false);

  onMount(() => {
    colorPicker.setColor(props.color);
    colorPicker.container.classList.toggle('active', false);
  });

  const toggleColorPicker = (newValue: boolean) => {
    colorPicker.container.classList.toggle('active', newValue);
    setIsColorPickerOpened(newValue);
  }

  return <>
    <div class="color-picker-container">
      <div class={`presets-list ${isColorPickerOpened() ? 'active' : ''}`}>
        {presets.map(preset =>
          <button
            class="preset-color"
            data-active={preset === currentColor()}
            style={{'--preset-color': preset}}
            onClick={() => {
              setCurrentColor(preset);
              props.onChange(preset);
            }}
          />
        )}
        <button class="preset-color rainbow" data-active={isColorPickerOpened()} style={{'--preset-color': presets[0]}} onClick={() => toggleColorPicker(!isColorPickerOpened())}></button>
      </div>
      {colorPicker.container}
    </div>
  </>
}
