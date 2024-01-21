/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import setInnerHTML from '../../helpers/dom/setInnerHTML';
import {GroupCall} from '../../layer';
import GroupCallInstance from '../../lib/calls/groupCallInstance';
import wrapEmojiText from '../../lib/richTextProcessor/wrapEmojiText';
import PeerTitle from '../peerTitle';
import I18n from '../../lib/langPack';

export default class GroupCallTitleElement {
  private peerTitle: PeerTitle;
  private descriptionIntl: I18n.IntlElement;

  constructor(private appendTo: HTMLElement) {
    this.peerTitle = new PeerTitle({peerId: 0});
    this.descriptionIntl = new I18n.IntlElement({
      key: 'VoiceChat.Chat.Livestream.Watching'
    });
  }

  public update(instance: GroupCallInstance) {
    const {peerTitle, appendTo, descriptionIntl} = this;
    const isRTMP = 'rtmp' in instance.connections;
    const groupCall = instance.groupCall as GroupCall.groupCall;
    const peerId = instance.chatId.toPeerId(true);
    if(groupCall.title) {
      setInnerHTML(appendTo, wrapEmojiText(groupCall.title));
    } else {
      if(peerTitle.options.peerId !== peerId) {
        peerTitle.options.peerId = peerId;
        peerTitle.update();
      }

      if(isRTMP) {
        const container = document.createElement('div');
        container.classList.add('call-stream-title');

        container.append(peerTitle.element);

        descriptionIntl.compareAndUpdate({
          key: 'VoiceChat.Chat.Livestream.Watching',
          args: [(instance.groupCall as GroupCall.groupCall).participants_count]
        });
        this.descriptionIntl.element.classList.add('stream-watchers');
        container.append(this.descriptionIntl.element);

        setInnerHTML(appendTo, container);
      } else {
        if(peerTitle.element.parentElement !== appendTo) {
          appendTo.append(peerTitle.element);
        }
      }
    }
  }
}
