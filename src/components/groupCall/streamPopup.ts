import {IS_MOBILE, IS_APPLE_MOBILE} from '../../environment/userAgent';
import IS_TOUCH_SUPPORTED from '../../environment/touchSupport';
import safeAssign from '../../helpers/object/safeAssign';
import {AppManagers} from '../../lib/appManagers/managers';
import {LiveStreamPlayer} from '../../lib/calls/liveStreamPlayer';
import {MEDIA_VIEWER_CLASSNAME} from '../appMediaViewerBase';
import GroupCallInstance from '../../lib/calls/groupCallInstance';
import groupCallsController from '../../lib/calls/groupCallsController';
import rootScope from '../../lib/rootScope';
import ListenerSetter, {Listener} from '../../helpers/listenerSetter';
import ButtonIcon from '../buttonIcon';
import Icon from '../icon';
import GROUP_CALL_STATE from '../../lib/calls/groupCallState';
import {attachClickEvent} from '../../helpers/dom/clickEvent';
import I18n from '../../lib/langPack';
import VolumeSelector from '../volumeSelector';
import {GroupCall, Chat as MTChat} from '../../layer';
import debounce from '../../helpers/schedulers/debounce';
import {addFullScreenListener, isFullScreen, requestFullScreen, cancelFullScreen} from '../../helpers/dom/fullScreen';
import appMediaPlaybackController, {AppMediaPlaybackController} from '../appMediaPlaybackController';
import PopupElement from '../popups';
import PopupPeer from '../popups/peer';
import PeerTitle from '../peerTitle';
import getPeerId from '../../lib/appManagers/utils/peers/getPeerId';
import {AvatarNew} from '../avatarNew';
import ButtonMenuToggle from '../buttonMenuToggle';
import hasRights from '../../lib/appManagers/utils/chats/hasRights';
import apiManagerProxy from '../../lib/mtproto/mtprotoworker';
import {chooseAudioOutput} from './streamAudioOutput';
import {toastNew} from '../toast';
import {PopupStreamWith} from './streamCreatePopup';
import {logger} from '../../lib/logger';
import {PopupStreamRecord} from './streamRecordPopup';
import PopupPickUser from '../popups/pickUser';

type StreamerElements = {
  container: HTMLElement;
  title: PeerTitle;
  avatar: ReturnType<typeof AvatarNew>;
}

type StreamButtonsType = 'mobile-close' | 'forward' | 'close';
type StreamButtons = Record<StreamButtonsType, HTMLElement>;

type ContentElements = {
  main: HTMLElement;
  container: HTMLElement;
  media: HTMLElement;
  videoContainer: HTMLElement;
  previewContainer: HTMLElement;
  previewImage: HTMLImageElement;
}

type FooterElements = {
  container: HTMLElement;
  left: HTMLElement;
  right: HTMLElement;
  status: I18n.IntlElement;
  volume: HTMLElement;
  counter: I18n.IntlElement;
  pipButton: HTMLElement;
  fullScreenButton: HTMLElement;
}

export default class StreamPopup {
  private log = logger('StreamPopup');
  public instance: GroupCallInstance;
  private managers: AppManagers;
  private pageEl = document.getElementById('page-chats') as HTMLDivElement;
  private listenerSetter: ListenerSetter;
  private wholeDiv: HTMLDivElement;
  private overlaysDiv: HTMLDivElement;
  private topbar: HTMLDivElement;
  private videoElement: HTMLVideoElement;
  private streamer: StreamerElements = {} as StreamerElements;
  private streamButtons: StreamButtons = {} as StreamButtons;
  private content: ContentElements = {} as ContentElements;
  private footer: FooterElements = {} as FooterElements;
  private player: LiveStreamPlayer;
  private volumeSelector: VolumeSelector;
  private isPip = false;
  private adminWaitingAlert: PopupStreamWith | null = null;
  private recordStartDate: number = 0;

  constructor(options: {managers: AppManagers}) {
    safeAssign(this, options);

    this.instance = groupCallsController.groupCall;
    this.videoElement = LiveStreamPlayer.createVideoElement(MEDIA_VIEWER_CLASSNAME + '-stream');
    this.listenerSetter = new ListenerSetter();
  }

  public async construct() {
    const connection = this.instance.connections.rtmp.connectionRTMP;
    this.player = new LiveStreamPlayer({
      videoElement: this.videoElement,
      connection
    });

    this.wholeDiv = document.createElement('div');
    this.wholeDiv.classList.add(MEDIA_VIEWER_CLASSNAME + '-whole');

    this.overlaysDiv = document.createElement('div');
    this.overlaysDiv.classList.add('overlays');

    const mainDiv = document.createElement('div');
    mainDiv.classList.add(MEDIA_VIEWER_CLASSNAME);

    this.topbar = document.createElement('div');
    this.topbar.classList.add(MEDIA_VIEWER_CLASSNAME + '-topbar', MEDIA_VIEWER_CLASSNAME + '-appear', MEDIA_VIEWER_CLASSNAME + '-stream-header');

    const topbarLeft = document.createElement('div');
    topbarLeft.classList.add(MEDIA_VIEWER_CLASSNAME + '-topbar-left');

    this.streamButtons['mobile-close'] = ButtonIcon('close', {onlyMobile: true});

    this.streamer.container = document.createElement('div');
    this.streamer.container.classList.add(MEDIA_VIEWER_CLASSNAME + '-author', 'no-select');
    this.streamer.container.style.pointerEvents = 'none';

    const peerId = getPeerId({chat_id: this.instance.chatId})
    this.streamer.title = new PeerTitle({peerId});
    this.streamer.avatar = AvatarNew({
      isDialog: true,
      size: 44,
      peerId: peerId
    });
    this.streamer.avatar.node.classList.add(MEDIA_VIEWER_CLASSNAME + '-userpic')

    const chatContainer = document.createElement('div');

    const title = document.createElement('div');
    title.classList.add(MEDIA_VIEWER_CLASSNAME + '-name');
    title.append(this.streamer.title.element);

    const description = document.createElement('div');
    description.classList.add(MEDIA_VIEWER_CLASSNAME + '-date');

    const descriptionStatus = new I18n.IntlElement({
      key: 'VoiceChat.Chat.Livestream.Streaming'
    });
    description.append(descriptionStatus.element);

    chatContainer.append(title, description);

    this.streamer.container.append(this.streamer.avatar.node, chatContainer);

    // Buttons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add(MEDIA_VIEWER_CLASSNAME + '-buttons');

    const streamButtons: StreamButtonsType[] = ['forward', 'close'];
    streamButtons.forEach((name) => {
      const button = ButtonIcon(name as Icon, {noRipple: true});
      this.streamButtons[name] = button;
      buttonsDiv.append(button);
    });

    // Content
    this.content.main = document.createElement('div');
    this.content.main.classList.add(MEDIA_VIEWER_CLASSNAME + '-content');

    this.content.container = document.createElement('div');
    this.content.container.classList.add(MEDIA_VIEWER_CLASSNAME + '-container');

    this.content.media = document.createElement('div');
    this.content.media.classList.add(MEDIA_VIEWER_CLASSNAME + '-media');

    // Video container
    this.content.videoContainer = document.createElement('div');
    this.content.videoContainer.classList.add(MEDIA_VIEWER_CLASSNAME + '-stream-container');
    this.content.videoContainer.append(this.videoElement);

    // Preview background
    const previewImageUrl = await connection.getPreviewImage().catch(e => {
      this.log.error(e);
      return null;
    });

    this.content.previewContainer = document.createElement('div');
    this.content.previewContainer.classList.add(MEDIA_VIEWER_CLASSNAME + '-stream-preview');
    if(previewImageUrl) {
      this.content.previewImage = document.createElement('img');
      this.content.previewImage.src = previewImageUrl;
      this.content.previewContainer.append(this.content.previewImage);
    } else {
      this.content.previewContainer.append(this.streamer.avatar.node.cloneNode());
    }
    this.content.videoContainer.append(this.content.previewContainer);

    // Footer
    this.footer.container = document.createElement('div');
    this.footer.container.classList.add(MEDIA_VIEWER_CLASSNAME + '-stream-footer');

    this.footer.left = document.createElement('div');
    this.footer.left.classList.add(MEDIA_VIEWER_CLASSNAME + '-stream-footer-left');

    this.footer.right = document.createElement('div');
    this.footer.right.classList.add(MEDIA_VIEWER_CLASSNAME + '-stream-footer-right');

    // Live status
    this.footer.status = new I18n.IntlElement({
      key: 'VoiceChat.Chat.Livestream.Live'
    });
    this.footer.status.element.classList.add('live-label');
    this.footer.left.append(this.footer.status.element);
    this.renderLiveStatus();

    // Volume button
    this.volumeSelector = new VolumeSelector(this.listenerSetter, true);
    const volumeProgressLineContainer = document.createElement('div');
    volumeProgressLineContainer.classList.add('progress-line-container');
    volumeProgressLineContainer.append(this.volumeSelector.container);
    this.volumeSelector.btn.classList.add('pinned-audio-volume', 'active');
    this.volumeSelector.btn.append(volumeProgressLineContainer);

    this.footer.volume = document.createElement('div');
    this.footer.volume.append(this.volumeSelector.btn);
    this.footer.left.append(this.footer.volume);

    // Watchers counter
    this.footer.counter = new I18n.IntlElement({
      key: 'VoiceChat.Chat.Livestream.Watching',
      args: [(this.instance.groupCall as GroupCall.groupCall).participants_count]
    });
    this.footer.left.append(this.footer.counter.element);
    this.renderCounter();

    // Admin menu
    if(await this.verifyBroadcastAdmin()) {
      this.recordStartDate = await this.getRecordStartDate();

      const adminMenu = ButtonMenuToggle({
        listenerSetter: this.listenerSetter,
        direction: 'top-left',
        buttons: [
          {
            icon: 'volume_up',
            text: 'VoiceChat.Chat.Livestream.OutputDevice',
            onClick: async() => {
              const result = await chooseAudioOutput(this.player.getAudioOutput());
              if(!result) {
                return toastNew({
                  langPackKey: 'VoiceChat.Chat.Livestream.OutputDevice.CannotGetSource'
                });
              }

              try {
                this.player.setAudioOutput(result);
              } catch(e) {
                this.log.error(e);
                toastNew({
                  langPackKey: 'VoiceChat.Chat.Livestream.OutputDevice.CannotSetSource'
                });
              }
            }
          },
          {
            icon: 'radioon',
            text: this.recordStartDate ? 'VideoChat.StreamRecord.StopTitle' : 'VoiceChat.Chat.Livestream.StartRecording',
            onClick: () => {
              PopupElement.createPopup(PopupStreamRecord, {
                groupCallId: this.instance.groupCall.id,
                managers: this.managers
              });
            }
          },
          {
            icon: 'settings',
            text: 'VoiceChat.Chat.Livestream.StreamSettings',
            onClick: () => {
              const chatId = this.instance.chatId;
              const peerId = getPeerId({chat_id: chatId});

              PopupElement.createPopup(PopupStreamWith, {
                peerId,
                managers: this.managers,
                onStart: () => { },
                onStop: () => {
                  this.endLiveStream();
                },
                waitingMode: false,
                isStreaming: true
              });
            }
          },
          {
            icon: 'crossround',
            text: 'VoiceChat.Chat.Livestream.EndLiveStream',
            danger: true,
            onClick: () => {
              this.endLiveStream();
            }
          }
        ]
      });

      this.footer.right.append(adminMenu);
    }

    // PiP
    if(!IS_MOBILE && document.pictureInPictureEnabled) {
      this.footer.pipButton = ButtonIcon(`pip default__button`, {noRipple: true});
    }

    // Fullscreen
    this.footer.fullScreenButton = ButtonIcon(`fullscreen default__button`, {noRipple: true});;
    this.footer.right.append(...[this.footer.pipButton, this.footer.fullScreenButton].filter(Boolean));

    this.footer.container.append(this.footer.left, this.footer.right);

    this.content.videoContainer.append(this.footer.container);
    this.content.media.append(this.content.videoContainer);
    this.content.container.append(this.content.media);

    this.content.main.append(this.content.container);
    mainDiv.append(this.content.main);
    this.overlaysDiv.append(mainDiv);

    topbarLeft.append(this.streamButtons['mobile-close'], this.streamer.container);
    this.topbar.append(topbarLeft, buttonsDiv);
    this.wholeDiv.append(this.overlaysDiv, this.topbar);
    this.pageEl.insertBefore(this.wholeDiv, document.getElementById('main-columns'));

    // Listeners
    this.setListeners();
  }

  private renderLiveStatus() {
    if(this.footer.left) {
      const liveLabel = this.footer.left.querySelector('.live-label');
      liveLabel.classList.toggle('is-live', this.instance.connections.rtmp.connectionRTMP.state === GROUP_CALL_STATE.UNMUTED);
    }
  }

  private renderCounter() {
    this.footer.counter.compareAndUpdate({
      key: 'VoiceChat.Chat.Livestream.Watching',
      args: [(this.instance.groupCall as GroupCall.groupCall).participants_count]
    });
  }

  private setListeners() {
    this.listenerSetter.add(this.instance)('state', () => {
      this.updateInstance();
    });

    this.listenerSetter.add(this.instance.connections.rtmp.connectionRTMP)('statechange', () => {
      this.updateInstance();
    });

    this.listenerSetter.add(rootScope)('group_call_update', (groupCall) => {
      if(this.instance?.id === groupCall.id) {
        this.updateInstance();
      }
    });

    [this.streamButtons.close, this.streamButtons['mobile-close']].forEach((el) => {
      attachClickEvent(el, this.onLeaveClick.bind(this));
    });

    attachClickEvent(this.streamButtons.forward, this.onForward.bind(this));

    if(this.footer.pipButton) {
      attachClickEvent(this.footer.pipButton, () => {
        this.togglePiP();
      }, {listenerSetter: this.listenerSetter});

      const onPip = (pip: boolean) => {
        this.isPip = pip;
        this.wholeDiv.classList.toggle('active', !pip)
      };

      const debounceTime = 20;
      const debouncedPip = debounce(onPip, debounceTime, false, true);

      this.listenerSetter.add(this.videoElement)('enterpictureinpicture', () => {
        debouncedPip(true);

        this.listenerSetter.add(this.videoElement)('leavepictureinpicture', () => {
          const onPause = () => {
            clearTimeout(timeout);
          };
          const listener = this.listenerSetter.add(this.videoElement)('pause', onPause, {once: true}) as any as Listener;
          const timeout = setTimeout(() => {
            this.listenerSetter.remove(listener);
          }, debounceTime);
        }, {once: true});
      });

      this.listenerSetter.add(this.videoElement)('leavepictureinpicture', () => {
        debouncedPip(false);
      });

      this.listenerSetter.add(this.videoElement)('dblclick', () => {
        if(!IS_TOUCH_SUPPORTED) {
          this.toggleFullScreen();
        }
      });

      attachClickEvent(this.footer.fullScreenButton, () => {
        this.toggleFullScreen();
      }, {listenerSetter: this.listenerSetter});

      addFullScreenListener(this.content.videoContainer, this.onFullScreen.bind(this, this.footer.fullScreenButton), this.listenerSetter);
      this.onFullScreen(this.footer.fullScreenButton);

      this.listenerSetter.add(appMediaPlaybackController)('playbackParams', this.updateVolume.bind(this));
      this.updateVolume(appMediaPlaybackController.getPlaybackParams());

      this.listenerSetter.add(this.player)('isStarted', this.onPlayStateChange.bind(this));
    }
  }

  private onPlayStateChange(isStarted: boolean) {
    this.videoElement.classList.toggle('is-started', isStarted)
  }

  private updateVolume(playbackParams: ReturnType<AppMediaPlaybackController['getPlaybackParams']>) {
    this.videoElement.volume = playbackParams.volume;
    this.videoElement.muted = playbackParams.muted;
  }

  private toggleFullScreen() {
    const player = this.content.videoContainer;

    if(IS_APPLE_MOBILE) {
      const video = this.videoElement as any;
      video.webkitEnterFullscreen();
      video.enterFullscreen();
      return;
    }

    if(!isFullScreen()) {
      requestFullScreen(player);
    } else {
      cancelFullScreen();
    }
  }

  protected onFullScreen(fullScreenButton: HTMLElement) {
    const isFull = isFullScreen();
    if(!isFull) {
      fullScreenButton.replaceChildren(Icon('fullscreen'));
      fullScreenButton.setAttribute('title', 'Full Screen');
    } else {
      fullScreenButton.replaceChildren(Icon('smallscreen'));
      fullScreenButton.setAttribute('title', 'Exit Full Screen');
    }
  }

  private togglePiP() {
    this.videoElement.requestPictureInPicture();
  }

  public show() {
    if(this.isPip) {
      this.togglePiP();
    }

    this.wholeDiv.classList.add('active');
    this.updateInstance();
  }

  public hide() {
    this.wholeDiv.classList.remove('active');
    this.instance.connections.rtmp.connectionRTMP.stop();
    this.player.stop();
  }

  private async onForward() {
    let url = 'https://t.me/';
    const username = await this.managers.appPeersManager.getPeerUsername(this.instance.chatId.toPeerId());
    if(username) {
      url += `${username}?livestream`;
    } else {
      url += `c/${this.instance.chatId}?livestream`;
    }

    PopupElement.createPopup(PopupPickUser, {
      peerType: ['contacts'],
      placeholder: 'Search',
      onSelect: async(peerId) => {
        try {
          await this.managers.appMessagesManager.sendText({
            text: url,
            peerId
          });

          toastNew({
            langPackKey: 'Story.Tooltip.MessageSent'
          });
        } catch(e) {
          this.log.error(e);
          toastNew({
            langPackKey: 'Error.AnError'
          });
        }
      }
    });
  }

  private async onLeaveClick() {
    const hangUp = (discard: boolean) => {
      this.instance.hangUp(discard);
      this.hide();
    };

    if(await this.managers.appChatsManager.hasRights(this.instance.chatId, 'manage_call')) {
      PopupElement.createPopup(PopupPeer, 'popup-end-video-chat', {
        titleLangKey: 'VoiceChat.End.Title',
        descriptionLangKey: 'VoiceChat.End.Text',
        checkboxes: [{
          text: 'VoiceChat.End.Third'
        }],
        buttons: [{
          langKey: 'VoiceChat.End.OK',
          callback: (e, checkboxes) => {
            hangUp(!!checkboxes.size);
          },
          isDanger: true
        }]
      }).show();
    } else {
      hangUp(false);
    }
  }

  private updateInstance() {
    this.renderLiveStatus();
    this.renderCounter();

    const connection = this.instance.connections.rtmp.connectionRTMP;
    if(connection.state === GROUP_CALL_STATE.CONNECTING) {
      this.player.stop();
      this.updateAdminWaitingAlert(true);
    } else if(connection.state === GROUP_CALL_STATE.CLOSED) {
      this.hide();
    } else {
      this.updateAdminWaitingAlert(false);
      if(!connection.canPlay) {
        connection.start();
        this.player.start();
      }
    }
  }

  private async verifyBroadcastAdmin() {
    const chatId = this.instance.chatId;
    const peerId = getPeerId({chat_id: chatId});

    if(await this.managers.appPeersManager.isAnyGroup(peerId)) {
      return false;
    }

    const chat = apiManagerProxy.getChat(chatId);
    return (chat as MTChat.chat).pFlags?.call_active && hasRights(chat, 'manage_call');
  }

  private async updateAdminWaitingAlert(isVisible: boolean) {
    if(await this.verifyBroadcastAdmin()) {
      if(isVisible) {
        if(this.adminWaitingAlert) {
          return;
        }

        const chatId = this.instance.chatId;
        const peerId = getPeerId({chat_id: chatId});

        this.adminWaitingAlert = PopupElement.createPopup(PopupStreamWith, {
          peerId,
          managers: this.managers,
          onStart: () => {},
          waitingMode: true,
          waitingContainer: this.content.container as HTMLDivElement,
          isStreaming: false
        });
      } else {
        this.adminWaitingAlert?.hide();
      }
    }
  }

  private async endLiveStream() {
    if(await this.verifyBroadcastAdmin()) {
      this.instance.hangUp(true);
      this.hide();
    }
  }

  private async getRecordStartDate() {
    const groupCall = await this.managers.appGroupCallsManager.getGroupCallFull(this.instance.groupCall.id);
    return groupCall._ === 'groupCall' ? groupCall.record_start_date || 0 : 0;
  }
}
