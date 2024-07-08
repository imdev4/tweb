import {MediaEditorTab, type MediaEditorTabOptions} from './EditorTab';
import {EmoticonsDropdown} from '../emoticonsDropdown';
import StickersTab from '../emoticonsDropdown/tabs/stickers';
import wrapSticker from '../wrappers/sticker';
import {EditorLayerType} from './types';
import RLottiePlayer from '../../lib/rlottie/rlottiePlayer';
import {doubleRaf} from '../../helpers/schedulers';
import pause from '../../helpers/schedulers/pause';
import {getMiddleware} from '../../helpers/middleware';

export class StickersMediaEditorTab extends MediaEditorTab {
  constructor(options: MediaEditorTabOptions) {
    super(options);

    this.langKey = 'MediaEditor.Popup.Tabs.Stickers';
    this.icon = 'smile_round';
    this.construct = this.render.bind(this);
    this.build();
  }

  private async render(container: HTMLElement) {
    const contentContainer = document.createElement('div');
    contentContainer.style.height = '100%';
    contentContainer.style.width = '100%';

    const emoticonsDropdown = new EmoticonsDropdown({
      tabsToRender: [new StickersTab(this.managers)],
      customParentElement: contentContainer,
      noEmoji: true,
      noClose: true,
      isStandalone: true,
      customStickerSelect: async(docId) => {
        const doc = await this.managers.appDocsManager.getDoc(docId);
        const tempContainer = document.createElement('div');
        tempContainer.style.opacity = '0';
        document.body.append(tempContainer);

        const middleware = getMiddleware();
        const sticker = await wrapSticker({
          doc,
          div: tempContainer,
          middleware: middleware.get(),
          play: true,
          loop: true,
          loopEffect: true,
          needFadeIn: false
        });

        const result = await sticker.render;
        const player = Array.isArray(result) ? result[0] : result;

        const firstFramePromise = player instanceof RLottiePlayer ?
          new Promise<void>((resolve) => player.addEventListener('firstFrame', resolve, {once: true})) :
          Promise.resolve();
        await Promise.all([firstFramePromise, doubleRaf()]);
        await pause(0); // ! need it because firstFrame will be called just from the loop
        if(player instanceof HTMLImageElement) {
          tempContainer.style.width = sticker.width + 'px';
          tempContainer.style.height = sticker.height + 'px';
          player.width = sticker.width;
          player.height = sticker.height;
          tempContainer.remove();
          this.state.addLayer({
            id: crypto.randomUUID(),
            type: EditorLayerType.StaticSticker,
            image: player,
            w: sticker.width,
            h: sticker.height,
            x: 100,
            y: 100,
            z: 0,
            angle: 0
          });
        } else if(player instanceof RLottiePlayer) {
          this.state.addLayer({
            id: crypto.randomUUID(),
            type: EditorLayerType.LottieSticker,
            player,
            w: sticker.width,
            h: sticker.height,
            x: 100,
            y: 100,
            z: 0,
            angle: 0
          });
        } else if(player instanceof HTMLVideoElement) {
          player.muted = true;
          player.loop = true;
          player.play();
          this.state.addLayer({
            id: crypto.randomUUID(),
            type: EditorLayerType.VideoSticker,
            video: player,
            w: sticker.width,
            h: sticker.height,
            x: 100,
            y: 100,
            z: 0,
            angle: 0
          });
        } else {
          throw new Error('Cannot use this sticker type');
        }
      }
    });

    emoticonsDropdown.onButtonClick();
    container.append(contentContainer);
  }
}
