import {render} from 'solid-js/web';
import {For, createSignal} from 'solid-js';
import PopupElement from '../popups';
import {AppManagers} from '../../lib/appManagers/managers';
import safeAssign from '../../helpers/object/safeAssign';
import {i18n} from '../../lib/langPack';
import Section from '../section';
import {Peer} from '../../layer';
import PeerTitle from '../peerTitle';
import Row from '../row';
import {AvatarNew} from '../avatarNew';
import getPeerId from '../../lib/appManagers/utils/peers/getPeerId';
import CheckboxField from '../checkboxField';
import appImManager from '../../lib/appManagers/appImManager';
import PopupSchedule from '../popups/schedule';
import {formatFullSentTime} from '../../helpers/date';
import ButtonIcon from '../buttonIcon';
import {LangPackKey} from '../../lib/langPack';
import {copyTextToClipboard} from '../../helpers/clipboard';
import {toastNew} from '../toast';
import {attachClickEvent} from '../../helpers/dom/clickEvent';
import ProgressivePreloader from '../preloader';

type PopupCreateStreamOptions = {
  managers: AppManagers;
  peerId: PeerId;
}

const streamCreateClassName = 'popup-stream-create';

export class PopupStreamCreate extends PopupElement {
  private peerId: PeerId;
  private scheduleTimestamp: number = Date.now() / 1000;
  private isScheduled = false;

  constructor(options: PopupCreateStreamOptions) {
    super(streamCreateClassName, {
      closable: true,
      overlayClosable: true,
      body: true,
      scrollable: true,
      footer: true,
      title: 'VideoChat.CreatePopup.New.Title',
      buttons: [
        {
          langKey: 'VideoChat.CreatePopup.New.Start',
          callback: () => {
            this.start();
          }
        },
        {
          langKey: 'VideoChat.CreatePopup.New.StartWith',
          callback: () => {
            this.streamWith();
          }
        }
      ]
    });

    safeAssign(this, options);

    this.construct();
  }

  private async construct() {
    const peers = await this.getGroupCallJoinAs();
    await this.managers.appGroupCallsManager.saveDefaultGroupCallJoinAs(this.peerId, this.peerId)

    const div = document.createElement('div');
    this.scrollable.append(div);
    const dispose = render(() => this.constructNewVideoChat(peers), div);
    this.addEventListener('closeAfterTimeout', dispose);

    // Open Popup
    this.show();
  }

  private constructNewVideoChat(_peers: Peer[]) {
    const [peers, updatePeers] = createSignal(_peers.map(peer => {
      const peerId = getPeerId(peer);
      return {
        peerId,
        isSelected: this.peerId === peerId
      }
    }));
    const [isScheduled, setIsScheduled] = createSignal(this.isScheduled);
    const [scheduleDate, setScheduleDate] = createSignal(this.scheduleTimestamp);

    return (
      <>
        <Section noDelimiter={true}>
          <div class={streamCreateClassName + '-subtitle'}>{i18n('VideoChat.CreatePopup.New.Description')}</div>
        </Section>

        <Section noDelimiter={true}>
          <For each={peers()}>{(currentPeer) => {
            const {peerId, isSelected} = currentPeer;
            const peerTitle = new PeerTitle();
            peerTitle.update({peerId});
            peerTitle.element.classList.add('text-bold');

            const row = new Row({
              title: peerTitle.element,
              noRipple: true,
              clickable: async() => {
                await this.managers.appGroupCallsManager.saveDefaultGroupCallJoinAs(this.peerId, currentPeer.peerId);

                updatePeers(prev => {
                  const newPeers = [];
                  for(const peer of prev) {
                    newPeers.push({
                      peerId: peer.peerId,
                      isSelected: peer.peerId === currentPeer.peerId
                    })
                  }

                  return newPeers;
                })
              }
            });
            row.container.classList.add(streamCreateClassName + '-peer');
            row.container.classList.toggle('selected', isSelected)
            row.createMedia('abitbigger').append(AvatarNew({peerId, size: 42}).node);

            return row.container;
          }}</For>
        </Section>
        <Section noDelimiter={true}>
          {new Row({
            titleLangKey: 'VideoChat.CreatePopup.New.Scheduled',
            clickable: () => {
              setIsScheduled((value) => {
                const newValue = !value;
                this.isScheduled = newValue;
                return newValue;
              })
            },
            checkboxField: new CheckboxField({
              checked: isScheduled(),
              name: 'scheduled',
              withRipple: false
            })
          }).container}

          {isScheduled() ? new Row({
            title: formatFullSentTime(scheduleDate()),
            clickable: () => {
              const today = new Date();
              const maxDate = new Date();
              maxDate.setDate(maxDate.getDate() + 7);

              PopupElement.createPopup(PopupSchedule, {
                initDate: today,
                onPick: (timestamp) => {
                  setScheduleDate(timestamp);
                  this.scheduleTimestamp = timestamp;
                },
                minDate: today,
                maxDate,
                btnConfirmLangKey: 'VideoChat.CreatePopup.New.PickDate'
              }).show();
            }
          }).container : null}
        </Section>
      </>
    );
  }

  private async getGroupCallJoinAs() {
    const result = await this.managers.appGroupCallsManager.getGroupCallJoinAs(this.peerId);
    return result.peers;
  }

  private async streamWith() {
    PopupElement.createPopup(PopupStreamWith, {
      peerId: this.peerId,
      managers: this.managers,
      onStart: () => {
        this.start(true);
        this.hide();
      },
      waitingMode: false,
      isStreaming: false
    });
  }

  private async start(isRTMP?: boolean) {
    this.hide();
    await appImManager.joinGroupCall(this.peerId, undefined, this.isScheduled ? this.scheduleTimestamp : undefined, isRTMP);
  }
}

type PopupStreamWithOptions = PopupCreateStreamOptions & {
  waitingMode?: boolean;
  waitingContainer?: HTMLDivElement;
  isStreaming?: boolean;
  onStart: () => void;
  onStop?: () => void;
}

const streamStreamWithClassName = 'popup-stream-with';

export class PopupStreamWith extends PopupElement {
  private peerId: PeerId;
  private onStart: () => void;
  private onStop?: () => void;
  private waitingMode = false;
  private isStreaming = false;

  constructor(options: PopupStreamWithOptions) {
    super(streamStreamWithClassName, {
      appendPopupTo: options.waitingMode && options.waitingContainer ? options.waitingContainer : undefined,
      closable: true,
      overlayClosable: options.waitingMode ? false : true,
      withoutOverlay: options.waitingMode,
      body: true,
      scrollable: false,
      footer: options.waitingMode ? false : true,
      title: options.waitingMode ? 'VoiceChat.Chat.Livestream.Oops' : 'VideoChat.CreatePopup.StreamWith.Title',
      buttons: options.waitingMode ? [] : [
        {
          isDanger: options.isStreaming,
          langKey: options.isStreaming ? 'VideoChat.CreatePopup.StreamWith.End' : 'VideoChat.CreatePopup.StreamWith.Start',
          callback: () => {
            if(options.isStreaming) {
              this.stop();
            } else {
              this.start();
            }
          }
        }
      ]
    });

    this.container.classList.toggle('waiting-mode', options.waitingMode);

    if(this.buttons.length) {
      this.buttons[0].element.className = '';
      this.buttons[0].element.classList.add('btn-primary', 'btn-color-primary', 'text-uppercase');
      if(options.isStreaming) {
        this.buttons[0].element.classList.add('danger');
      }
    }

    if(options.waitingMode) {
      const crossContainer = this.container.querySelector('.popup-close');
      if(crossContainer) {
        crossContainer.classList.remove('popup-close');
        crossContainer.classList.add('spinner');
        crossContainer.innerHTML = '';
        const preloader = new ProgressivePreloader({
          cancelable: false
        });
        preloader.attach(crossContainer, false);
      }
    }

    safeAssign(this, options);

    this.construct();
  }

  private async construct() {
    const rtmpUrl = await this.getRTMPUrl();

    const div = document.createElement('div');
    this.body.prepend(div);
    const dispose = render(() => this.constructStreamWith(rtmpUrl.url, rtmpUrl.key), div);
    this.addEventListener('closeAfterTimeout', dispose);

    this.show();
  }

  private constructStreamWith(url: string, key: string) {
    return (
      <>
        <Section noDelimiter={true} class={streamStreamWithClassName + '-description'}>
          <div class={streamCreateClassName + '-subtitle left'}>{i18n(this.waitingMode ? 'VideoChat.CreatePopup.StreamWith.WaitingDescription' : 'VideoChat.CreatePopup.StreamWith.Description')}</div>
        </Section>
        {this.getDataRow({
          value: url,
          icon: 'link',
          title: 'VideoChat.CreatePopup.StreamWith.ServerUrl'
        })}
        {this.getDataRow({
          value: key,
          icon: 'lock',
          title: 'VideoChat.CreatePopup.StreamWith.StreamKey',
          isHidden: true
        })}
        {this.waitingMode || this.isStreaming ? null : <Section noDelimiter={true}>
          <div class={streamCreateClassName + '-subtitle left'}>{i18n('VideoChat.CreatePopup.StreamWith.DescriptionBelow')}</div>
        </Section>}
        {this.isStreaming ? this.getRevokeRow() : null}
      </>
    );
  }

  private getRevokeRow() {
    const result = new Row({
      icon: 'rotate_left',
      title: i18n('VideoChat.CreatePopup.StreamWith.Revoke'),
      clickable: async() => {
        await this.revokeRTMPUrl();
        this.stop();
      }
    }).container;

    result.classList.add(streamStreamWithClassName + '-stream-info', 'revoke-info')

    return result;
  }

  private async getRTMPUrl() {
    return this.managers.appGroupCallsManager.getGroupCallStreamRtmpUrl(this.peerId);
  }

  private async revokeRTMPUrl() {
    return this.managers.appGroupCallsManager.getGroupCallStreamRtmpUrl(this.peerId, true);
  }

  private start() {
    this.hide();
    this.onStart();
  }

  private stop() {
    this.hide();
    if(typeof this.onStop === 'function') {
      this.onStop();
    }
  }

  private getDataRow(options: { value: string; icon: Icon; title: LangPackKey; isHidden?: boolean }) {
    const onClick = () => {
      copyTextToClipboard(options.value);
      toastNew({langPackKey: 'VideoChat.CreatePopup.StreamWith.Copied'});
    };


    const titleContainer = document.createElement('div');
    const updateValueText = (isHidden: boolean) => {
      if(!options.isHidden) {
        titleContainer.innerHTML = options.value;
        return;
      }
      titleContainer.innerHTML = isHidden ? '····················' : options.value;
      titleContainer.classList.toggle('is-hidden', isHidden);
    }
    updateValueText(options.isHidden);
    const subtitleContainer = document.createElement('div');
    const rightContainer = document.createElement('div');

    const subtitle = () => {
      const [canShowValue, setCanShowValue] = createSignal(!options.isHidden);

      const hiddenIcon = options.isHidden ? ButtonIcon(canShowValue() ? 'eye2' : 'eye1', {noRipple: true, asDiv: true}) : null;
      if(hiddenIcon) {
        hiddenIcon.classList.add(streamStreamWithClassName + '-eye-icon');
        attachClickEvent(hiddenIcon, (e) => {
          e.preventDefault();
          setCanShowValue(value => {
            const newValue = !value;
            updateValueText(newValue);
            return newValue
          });
        });
      }

      return (<>{i18n(options.title)} {hiddenIcon}</>)
    }
    render(() => subtitle(), subtitleContainer);

    const copyIcon = ButtonIcon('copy');
    const rightContent = (
      <>{copyIcon}</>
    );
    render(() => rightContent, rightContainer);

    const result = new Row({
      icon: options.icon,
      title: titleContainer,
      subtitle: subtitleContainer,
      rightContent: rightContainer,
      clickable: onClick
    }).container;

    result.classList.add(streamStreamWithClassName + '-stream-info')

    return result;
  }
}
