import {AppManagers} from '../../lib/appManagers/managers';
import ListenerSetter from '../../helpers/listenerSetter';
import Chat from './chat';
import {GroupCall} from '../../layer';
import rootScope from '../../lib/rootScope';
import I18n, {i18n} from '../../lib/langPack';
import ChatTopbar from './topbar';
import Button from '../button';
import {attachClickEvent} from '../../helpers/dom/clickEvent';

const streamBarClassname = 'chat-live-stream-bar'

export default class StreamBar {
  private listenerSetter: ListenerSetter;
  private topBarContainer: HTMLDivElement;
  private btnJoin: HTMLButtonElement;
  private container: HTMLDivElement;
  private groupCall: GroupCall.groupCall | null;
  private counter: I18n.IntlElement;

  constructor(private chat: Chat, private managers: AppManagers, private topbar: ChatTopbar) {
    this.listenerSetter = new ListenerSetter();

    this.listenerSetter.add(this.chat)('setPeer', async() => {
      this.groupCall = null;
      const newPeer = this.chat.peerId;
      await this.refreshGroupCall(newPeer.toChatId());
      this.updateInstance();
    });

    this.listenerSetter.add(rootScope)('chat_update', async(chatId) => {
      await this.refreshGroupCall(chatId);
      this.updateInstance();
    });

    this.listenerSetter.add(rootScope)('peer_full_update', async(chatId) => {
      await this.refreshGroupCall(chatId.toChatId());
      this.updateInstance();
    });

    this.listenerSetter.add(rootScope)('group_call_update', (groupCall) => {
      if(this.groupCall && groupCall._ === 'groupCall' && this.groupCall.id === groupCall.id) {
        this.groupCall = groupCall;
      }
      this.updateInstance();
    });
  }

  private async refreshGroupCall(chatId: string | number) {
    if(this.chat.peerId === chatId.toPeerId(true)) {
      const chatFull = await this.managers.appProfileManager.getChatFull(chatId);
      if(chatFull.call) {
        const groupCall = await this.managers.appGroupCallsManager.getGroupCallFull(chatFull.call.id);
        if(groupCall._ === 'groupCall') {
          this.groupCall = groupCall;
        }
      }
    }
  }

  private updateInstance() {
    if(this.groupCall) {
      this.counter.compareAndUpdate({
        key: 'VoiceChat.Chat.Livestream.Watching',
        args: [this.groupCall.participants_count]
      });

      const isRTMPCall = Boolean(this.groupCall.pFlags.rtmp_stream);
      this.container.classList.toggle('active', isRTMPCall);
    } else {
      this.container.classList.toggle('active', false);
    }
  }

  public construct() {
    this.topBarContainer = this.topbar.container;

    this.container = document.createElement('div');
    this.container.classList.add(streamBarClassname);

    const leftContainer = document.createElement('div')
    leftContainer.classList.add('left');

    this.counter = new I18n.IntlElement({
      key: 'VoiceChat.Chat.Livestream.Watching',
      args: [this.groupCall?.participants_count || 0]
    });
    const title = i18n('PeerInfo.Action.LiveStream')
    title.classList.add('title');

    leftContainer.append(title, this.counter.element);

    const rightContainer = document.createElement('div')
    rightContainer.classList.add('right');

    this.btnJoin = Button('btn-primary btn-color-primary', {text: 'ChannelJoin'});
    attachClickEvent(this.btnJoin, () => this.onJoin());
    rightContainer.append(this.btnJoin);

    const content = document.createElement('div');
    content.classList.add(streamBarClassname + '-content');
    content.append(leftContainer, rightContainer);

    this.container.append(content);
    this.topBarContainer.after(this.container);
    this.updateInstance();
  }

  private async onJoin() {
    if(!this.groupCall) {
      console.error('There is no active group call');
      return;
    }
    this.btnJoin.setAttribute('disabled', 'true');

    try {
      await this.chat.appImManager.joinGroupCall(this.chat.peerId);
    } catch(e) {
      console.error(e);
    } finally {
      this.btnJoin.removeAttribute('disabled');
    }
  }
}
