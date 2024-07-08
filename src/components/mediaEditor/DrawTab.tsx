import {render} from 'solid-js/web'
import {MediaEditorTab, type MediaEditorTabOptions} from './EditorTab';
import {ColorPickerRow} from './ColorPicker';
import {RangeRow} from './Range';
import {DrawType} from './types';
import {DrawTypes} from './DrawTypes';

const drawTypes = [DrawType.Pen, DrawType.Arrow, DrawType.Brush, DrawType.Neon, DrawType.Blur, DrawType.Eraser];

export class DrawMediaEditorTab extends MediaEditorTab {
  constructor(options: MediaEditorTabOptions) {
    super(options);

    this.langKey = 'MediaEditor.Popup.Tabs.Draw';
    this.icon = 'brush';
    this.construct = this.render.bind(this);
    this.build();
  }

  private async render(container: HTMLElement) {
    render(() => {
      const [state, setState] = this.state.drawToolSignal;

      return <>
        <ColorPickerRow
          color={state().color}
          onChange={newColor => {
            setState(prev => ({...prev, color: newColor}));
          }}
        />
        <RangeRow
          className='size-selector-row'
          item={{
            name: 'MediaEditor.Popup.Size',
            min: 8,
            max: 32,
            step: 1
          }}
          value={state().size}
          onChange={newValue => {
            setState(prev => ({...prev, size: newValue}));
          }}
          color={state().color}
        />
        <DrawTypes
          items={drawTypes}
          selectedType={state().type}
          color={state().color}
          onChange={(newType) => {
            setState(prev => ({...prev, type: newType}))
          }}
        />
      </>
    }, container);
  }
}
