import type {LangPackKey} from '../../lib/langPack';
import ButtonIcon from '../buttonIcon';
import {i18n} from '../../lib/langPack';
import safeAssign from '../../helpers/object/safeAssign';
import {type CanvasWorker} from './CanvasWorker';
import {type State} from './State';
import {type ProxiedManagers} from '../../lib/appManagers/getProxiedManagers';

export enum EditorTab {
  Enhance = 'Enhance',
  Crop = 'Crop',
  Text = 'Text',
  Draw = 'Draw',
  Stickers = 'Stickers',
}

export type MediaEditorTabOptions = {
  tab: EditorTab;
  tabsSelectorContainer: HTMLElement;
  tabsContentContainer: HTMLElement;
  canvasWorker: CanvasWorker;
  state: State;
  managers: ProxiedManagers;
  onChangeTab(tab: EditorTab): void;
  redrawImage(): void;
}

export class MediaEditorTab {
  public state: State;
  public canvasWorker: CanvasWorker;
  public tab: EditorTab;
  public langKey: LangPackKey;
  public icon: string;
  public button: HTMLElement;
  public tabsSelectorContainer: HTMLElement;
  public tabsContentContainer: HTMLElement;
  public container: HTMLElement;
  public onChangeTab: (tab: EditorTab) => void;
  public construct: (container: HTMLElement) => Promise<void>;
  public redrawImage: () => void;
  public managers: ProxiedManagers;

  constructor(options: MediaEditorTabOptions) {
    safeAssign(this, options);
  }

  public build() {
    this.button = ButtonIcon(this.icon, {
      noRipple: true
    });
    this.button.setAttribute('title', i18n(this.langKey).textContent);
    this.button.addEventListener('click', () => {
      this.onChangeTab(this.tab);
    });
    this.tabsSelectorContainer.append(this.button);

    this.container = document.createElement('div');
    this.container.classList.add('tab-content', `tab-content-${this.tab}`);
    this.tabsContentContainer.append(this.container);
  }

  public async activate() {
    this.button.classList.add('active');
    this.container.classList.add('active');
    await this.renderTabContent();
  }

  public deactivate() {
    this.button.classList.remove('active');
    this.container.classList.remove('active');
  }

  private async renderTabContent() {
    this.container.innerHTML = '';
    const tabContainer = document.createElement('div');
    tabContainer.classList.add('tab', `tab-${this.tab}`);
    await this.construct(tabContainer);
    this.container.append(tabContainer);
  }
}
