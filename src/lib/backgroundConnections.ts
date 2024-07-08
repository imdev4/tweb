import {AccountsItem, Credentials} from './appManagers/appAccountsManager';
import rootScope from './rootScope';
import bytesFromHex from '../helpers/bytes/bytesFromHex';
import CryptoWorker from './crypto/cryptoMessagePort';
import EventListenerBase from '../helpers/eventListenerBase';
import {type NotificationBuildTaskPayload} from './mtproto/mtprotoworker';

type UnreadCountUpdate = {
  accountId: number;
  unreadCount: number
}

class BackgroundConnections extends EventListenerBase<{
  newMessage(options: NotificationBuildTaskPayload): void;
  unreadCountUpdate(options: UnreadCountUpdate): void;
}> {
  notificationsCount = new Map<number, number>();

  public async createConnection(account: AccountsItem) {
    const dcId = await rootScope.managers.apiManager.getBaseDcId();

    const ak = `dc${dcId}_auth_key` as keyof Credentials;
    const ss = `dc${dcId}_server_salt` as keyof Credentials;

    const authKeyHex = account.credentials[ak]?.slice(1, -1);
    let serverSaltHex = account.credentials[ss]?.slice(1, -1);

    if(authKeyHex?.length === 512) {
      if(serverSaltHex?.length !== 16) {
        serverSaltHex = 'AAAAAAAAAAAAAAAA';
      }

      const authKey = bytesFromHex(authKeyHex);
      const authKeyId = (await CryptoWorker.invokeCrypto('sha1', authKey)).slice(-8);
      const serverSalt = bytesFromHex(serverSaltHex);
      rootScope.addEventListener('background_account_update', async(e) => {
        if(e.accountId !== account.id) {
          return;
        }

        this.dispatchEvent('unreadCountUpdate', {
          accountId: account.id,
          unreadCount: e.unread_count
        });

        for(const message of e.messages) {
          const peer = message.peer_id;
          if(peer) {
            if(message._ !== 'message') {
              continue;
            }
            const peerId = peer._ === 'peerChannel' ? peer.channel_id : peer._ === 'peerChat' ? peer.chat_id : peer.user_id;
            try {
              const {peerTypeNotifySettings} = await rootScope.managers.appMessagesManager.getNotifyPeerSettings(peerId.toPeerId());

              this.dispatchEvent('newMessage', {
                message,
                peerTypeNotifySettings
              });
            } catch(err) {
            }
          }
        }
      })
      await rootScope.managers.apiManager.getBackgroundNetworker(account.id, dcId, authKey, authKeyId, serverSalt, {
        ignoreErrors: true
      });
    } else {
      throw new Error('Cannot create background connection');
    }
  }
}

export const backgroundConnections = new BackgroundConnections();
