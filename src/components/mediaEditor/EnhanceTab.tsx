import {render} from 'solid-js/web';
import {createEffect, createSignal} from 'solid-js';
import {type LangPackKey} from '../../lib/langPack';
import {MediaEditorTab, type MediaEditorTabOptions} from './EditorTab';
import {Effect, MediaEditorState} from './types';
import {RangeRow} from './Range';

type Item = {
  name: LangPackKey;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

const items: Record<Effect, Item> = {
  [Effect.Enhance]: {name: 'MediaEditor.Popup.Tabs.Enhance.Enhance', min: 0, max: 100, step: 1, defaultValue: 0},
  [Effect.Brightness]: {name: 'MediaEditor.Popup.Tabs.Enhance.Brightness', min: -100, max: 100, step: 1, defaultValue: 0},
  [Effect.Contrast]: {name: 'MediaEditor.Popup.Tabs.Enhance.Contrast', min: -100, max: 100, step: 1, defaultValue: 0},
  [Effect.Saturation]: {name: 'MediaEditor.Popup.Tabs.Enhance.Saturation', min: -100, max: 100, step: 1, defaultValue: 0},
  [Effect.Warmth]: {name: 'MediaEditor.Popup.Tabs.Enhance.Warmth', min: -100, max: 100, step: 1, defaultValue: 0},
  [Effect.Fade]: {name: 'MediaEditor.Popup.Tabs.Enhance.Fade', min: 0, max: 100, step: 1, defaultValue: 0},
  [Effect.Highlights]: {name: 'MediaEditor.Popup.Tabs.Enhance.Highlights', min: -100, max: 100, step: 1, defaultValue: 0},
  [Effect.Shadows]: {name: 'MediaEditor.Popup.Tabs.Enhance.Shadows', min: -100, max: 100, step: 1, defaultValue: 0},
  [Effect.Vignette]: {name: 'MediaEditor.Popup.Tabs.Enhance.Vignette', min: 0, max: 100, step: 1, defaultValue: 0},
  [Effect.Grain]: {name: 'MediaEditor.Popup.Tabs.Enhance.Grain', min: 0, max: 100, step: 1, defaultValue: 0},
  [Effect.Sharpen]: {name: 'MediaEditor.Popup.Tabs.Enhance.Sharpen', min: 0, max: 100, step: 1, defaultValue: 0}
}

export const defaultEffects = Object.entries(items).reduce((res, [key, value]) => ({...res, [key]: value.defaultValue}), {} as Record<Effect, number>)


export class EnhanceMediaEditorTab extends MediaEditorTab {
  constructor(options: MediaEditorTabOptions) {
    super(options);

    this.langKey = 'MediaEditor.Popup.Tabs.Enhance';
    this.icon = 'enhance';
    this.construct = this.render.bind(this);
    this.build();
  }

  private async render(container: HTMLElement) {
    render(() => {
      const [effects, setEffects] = createSignal<MediaEditorState['effects']>({...defaultEffects});
      createEffect(() => {
        if(typeof this.state.positionSignal[0]() === 'number') {
          setEffects({...this.state.current.effects});
        }
      });

      return <>
        {Object.entries(items).map(([key, item]) => {
          const effect = key as Effect;
          const value = effects()[effect];

          return (
            <RangeRow
              item={item}
              value={value}
              onChange={newValue => {
                effects()[effect] = newValue;
              }}
              onRelease={() => {
                this.state.setState({
                  ...this.state.current,
                  effects: {
                    ...this.state.current.effects,
                    [effect]: effects()[effect]
                  }
                });
                this.applyEffects();
              }}
            />
          )
        })}
      </>
    }, container);
  }

  private applyEffects() {
    this.canvasWorker.applyEffects({effects: this.state.current.effects});
  }
}
