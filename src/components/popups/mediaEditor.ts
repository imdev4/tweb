import PopupElement from '.';
import {MediaEditor} from '../mediaEditor';
import Scrollable from '../scrollable';
import safeAssign from '../../helpers/object/safeAssign';

export const mediaEditorClassName = 'popup-media-editor';

type MediaEditorPopupOptions = {
  image: HTMLImageElement;
  onDone(newData: HTMLCanvasElement): void;
}

export class MediaEditorPopup extends PopupElement {
  private editor: MediaEditor;
  private main: HTMLElement;
  private mainWrapper: HTMLElement;
  private tabsContainer: HTMLElement;
  private tabsHeader: HTMLElement;
  private tabsContent: HTMLElement;
  private onDone: (newData: HTMLCanvasElement | Blob) => void;

  constructor(options: MediaEditorPopupOptions) {
    super(mediaEditorClassName, {
      closable: false,
      overlayClosable: false,
      body: true,
      scrollable: false,
      footer: false
    });
    safeAssign(this, options);

    this.construct();

    this.editor = new MediaEditor({
      mainContainerWrapper: this.mainWrapper,
      mainContainer: this.main,
      tabsHeader: this.tabsHeader,
      tabsContent: this.scrollable.container,
      tabsContainer: this.tabsContainer,
      originalImage: options.image,
      managers: this.managers,
      onClose: () => this.forceHide(),
      onDone: (newData) => {
        this.hide();
        this.onDone(newData);
      }
    });
  }

  private construct() {
    this.header.remove();

    this.mainWrapper = document.createElement('div');
    this.mainWrapper.classList.add(mediaEditorClassName + '-main-wrapper');

    this.main = document.createElement('div');
    this.main.classList.add(mediaEditorClassName + '-main');
    this.mainWrapper.append(this.main);

    this.tabsContainer = document.createElement('aside');
    this.tabsContainer.classList.add(mediaEditorClassName + '-sidebar');

    this.tabsHeader = document.createElement('header');
    this.tabsHeader.classList.add(mediaEditorClassName + '-tabs-header');
    this.tabsContainer.append(this.tabsHeader);

    this.tabsContent = document.createElement('div');
    this.tabsContent.classList.add(mediaEditorClassName + '-tabs-content');
    this.tabsContainer.append(this.tabsContent);

    this.scrollable = new Scrollable(this.tabsContent);
    this.attachScrollableListeners();
    this.tabsContent.append(this.scrollable.container);

    this.body.append(this.mainWrapper);
    this.body.append(this.tabsContainer);

    // Open Popup
    this.show();
  }
}
