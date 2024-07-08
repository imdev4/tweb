import {render} from 'solid-js/web'
import {createSignal} from 'solid-js'
import {MediaEditorTab, type MediaEditorTabOptions} from './EditorTab';
import Section from '../section';
import {i18n, LangPackKey} from '../../lib/langPack';
import {AspectRatios} from './types';
import Icon from '../icon';

const ratioTitles = {
  [AspectRatios['Free']]: 'MediaEditor.Popup.AspectRaio.Free',
  [AspectRatios['Original']]: 'MediaEditor.Popup.AspectRaio.Original',
  [AspectRatios['Square']]: 'MediaEditor.Popup.AspectRaio.Square',
  [AspectRatios['3:2']]: 'MediaEditor.Popup.AspectRaio.3_2',
  [AspectRatios['4:3']]: 'MediaEditor.Popup.AspectRaio.4_3',
  [AspectRatios['5:4']]: 'MediaEditor.Popup.AspectRaio.5_4',
  [AspectRatios['7:5']]: 'MediaEditor.Popup.AspectRaio.7_5',
  [AspectRatios['16:9']]: 'MediaEditor.Popup.AspectRaio.16_9',
  [AspectRatios['2:3']]: 'MediaEditor.Popup.AspectRaio.2_3',
  [AspectRatios['3:4']]: 'MediaEditor.Popup.AspectRaio.3_4',
  [AspectRatios['4:5']]: 'MediaEditor.Popup.AspectRaio.4_5',
  [AspectRatios['5:7']]: 'MediaEditor.Popup.AspectRaio.5_7',
  [AspectRatios['9:16']]: 'MediaEditor.Popup.AspectRaio.9_16'
} as Record<AspectRatios, LangPackKey>;

type RatioIcon = {
  name: Icon;
  rotated: boolean;
}

const ratioIcons = {
  [AspectRatios['Free']]: {name: 'aspect_ratio_free', rotated: false},
  [AspectRatios['Original']]: {name: 'aspect_ratio_imageoriginal', rotated: false},
  [AspectRatios['Square']]: {name: 'aspect_ratio_square', rotated: false},
  [AspectRatios['3:2']]: {name: 'aspect_ratio_3_2', rotated: false},
  [AspectRatios['4:3']]: {name: 'aspect_ratio_4_3', rotated: false},
  [AspectRatios['5:4']]: {name: 'aspect_ratio_5_4', rotated: false},
  [AspectRatios['7:5']]: {name: 'aspect_ratio_7_5', rotated: false},
  [AspectRatios['16:9']]: {name: 'aspect_ratio_16_9', rotated: false},
  [AspectRatios['2:3']]: {name: 'aspect_ratio_3_2', rotated: true},
  [AspectRatios['3:4']]: {name: 'aspect_ratio_4_3', rotated: true},
  [AspectRatios['4:5']]: {name: 'aspect_ratio_5_4', rotated: true},
  [AspectRatios['5:7']]: {name: 'aspect_ratio_7_5', rotated: true},
  [AspectRatios['9:16']]: {name: 'aspect_ratio_16_9', rotated: true}
} as Record<AspectRatios, RatioIcon>;

const topRatios = [AspectRatios['Free'], AspectRatios['Original'], AspectRatios['Square']];
const bottomLeftRatios = [AspectRatios['3:2'], AspectRatios['4:3'], AspectRatios['5:4'], AspectRatios['7:5'], AspectRatios['16:9']];
const bottomRightRatios = [AspectRatios['2:3'], AspectRatios['3:4'], AspectRatios['4:5'], AspectRatios['5:7'], AspectRatios['9:16']];

type RatioItem = {
  title: LangPackKey;
  icon: RatioIcon;
  active: boolean;
  onSelect(): void;
}

function RatioItem(props: RatioItem) {
  return <div class={`ratio-item section-item ${props.active ? 'active' : ''}`} onClick={props.onSelect}>
    <span class={`ratio-item-icon icon-${props.icon.name} ${props.icon.rotated ? 'rotated' : ''}`}>{Icon(props.icon.name)}</span>
    {i18n(props.title)}
  </div>
}

export class CropMediaEditorTab extends MediaEditorTab {
  constructor(options: MediaEditorTabOptions) {
    super(options);

    this.langKey = 'MediaEditor.Popup.Tabs.Crop';
    this.icon = 'crop';
    this.construct = this.render.bind(this);
    this.build();
  }

  private async render(container: HTMLElement) {
    render(() => {
      const [size] = this.state.canvasSizeSignal;
      const [cropTool, setCropTool] = this.state.cropSignal;
      const [currentAspectRatio, setCurrentAspectRatio] = createSignal<AspectRatios | null>(null)

      function onSelectRatio(ratio: AspectRatios) {
        setCurrentAspectRatio(ratio);
        const w = size().width;
        const h = size().height;
        const minSide = Math.min(w, h);
        const maxSide = Math.max(w, h);

        const newPos = {
          x: 0,
          y: 0
        };

        if(ratio === AspectRatios.Free) {
          setCropTool((prev) => ({
            ...prev,
            ...newPos,
            h,
            w,
            aspectRatio: false
          }));
        } else if(ratio === AspectRatios.Original) {
          setCropTool((prev) => ({
            ...prev,
            ...newPos,
            h,
            w,
            aspectRatio: 1
          }));
        } else if(ratio === AspectRatios.Square) {
          const newH = minSide === h ? h : w;
          const newW = minSide === h ? h : w;
          setCropTool((prev) => ({
            ...prev,
            ...newPos,
            h: newH,
            w: newW,
            aspectRatio: newW / newH
          }));
        } else {
          const [ratioW, ratioH] = ratio.split(':').map(Number);
          const aspectRatio = ratioW / ratioH;
          let newW = w;
          let newH = h;
          if(w / ratioW < h / ratioH) {
            newH = w / aspectRatio;
          } else {
            newW = h * aspectRatio;
          }

          setCropTool((prev) => ({
            ...prev,
            ...newPos,
            h: newH,
            w: newW,
            aspectRatio
          }));
        }
      }

      return <Section class="crop-picker">
        <div class="ratio-row-text">
          {i18n('MediaEditor.Popup.AspectRaio')}
        </div>

        <div class="ratios-list ratios-top">
          {topRatios.map(ratio => (
            <RatioItem
              title={ratioTitles[ratio]}
              icon={ratioIcons[ratio]}
              active={currentAspectRatio() === ratio}
              onSelect={() => onSelectRatio(ratio)}
            />
          ))}
        </div>

        <div class="ratios-bottom">
          <div class="ratios-list">
            {bottomLeftRatios.map(ratio => (
              <RatioItem
                title={ratioTitles[ratio]}
                icon={ratioIcons[ratio]}
                active={currentAspectRatio() === ratio}
                onSelect={() => onSelectRatio(ratio)}
              />
            ))}
          </div>
          <div class="ratios-list">
            {bottomRightRatios.map(ratio => (
              <RatioItem
                title={ratioTitles[ratio]}
                icon={ratioIcons[ratio]}
                active={currentAspectRatio() === ratio}
                onSelect={() => onSelectRatio(ratio)}
              />
            ))}
          </div>
        </div>
      </Section>
    }, container);
  }
}
