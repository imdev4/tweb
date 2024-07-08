import {type UserAuth} from '../mtproto/mtproto_config';
import sessionStorage from '../sessionStorage';
import {type UserProfilePhoto} from '../../layer';
import rootScope from '../rootScope';
import {backgroundConnections} from '../backgroundConnections';

export const credentialKeys = ['user_auth', 'dc', 'dc1_auth_key', 'dc2_auth_key', 'dc3_auth_key', 'dc4_auth_key', 'dc5_auth_key', 'dc1_server_salt', 'dc2_server_salt', 'dc3_server_salt', 'dc4_server_salt', 'dc5_server_salt', 'auth_key_fingerprint'] as const;

export type CredentialKeys = typeof credentialKeys[number];

export type Credentials = Record<CredentialKeys, string>;

export type AccountsItem = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo?: UserProfilePhoto;
  credentials: Credentials;
}

class AppAccountsManager {
  private eventName = 'onAccountAdded';

  public async init() {
    const accounts = await this.getAccounts();
    for(const account of accounts) {
      if(account.id !== rootScope.myId) {
        await backgroundConnections.createConnection(account);
      }
    }
  }

  public async cacheCurrent() {
    let userAuth: UserAuth;

    const credentials = {} as Credentials;
    for(const key of credentialKeys) {
      const value = await sessionStorage.get(key);
      if(key === 'user_auth') {
        userAuth = value as UserAuth;
      }
      credentials[key] = JSON.stringify(value);
    }

    if(userAuth) {
      const newItem: AccountsItem = {
        id: userAuth.id,
        credentials
      };

      const users = await rootScope.managers.appUsersManager.getApiUsers([newItem.id.toUserId()]);
      const user = users[0];
      if(user._ === 'user') {
        newItem.photo = user.photo;
        newItem.first_name = user.first_name;
        newItem.last_name = user.last_name;
        newItem.username = user.usernames?.filter(username => username.pFlags.active)?.[0]?.username || user.username;
      }

      const accounts = await this.getAccounts();
      if(accounts.some(acc => acc.id === newItem.id)) {
        await sessionStorage.set({
          accounts: accounts.sort((a) => a.id === newItem.id ? -1 : 1)
        });
        return;
      }

      await sessionStorage.set({
        accounts: [newItem, ...accounts]
      });
    }
  }

  public async removeAccount(id: number) {
    const accounts = await this.getAccounts();
    const accIndex = accounts.findIndex(acc => acc.id === id);
    if(accIndex < 0) {
      console.error('Cannot get account');
      return;
    }

    accounts.splice(accIndex, 1);
    await sessionStorage.set({
      accounts
    });
  }

  public async changeAccount(id: number) {
    const accounts = await this.getAccounts();
    const account = accounts.find(acc => acc.id === id);
    if(!account) {
      console.error('Cannot get account');
      return;
    }

    const credentials = Object.entries(account.credentials);
    for(const [key, value] of credentials) {
      localStorage.setItem(key, value);
    }

    indexedDB.deleteDatabase('tweb');

    return true;
  }

  public async getAccounts(): Promise<AccountsItem[]> {
    try {
      const accounts = await sessionStorage.get('accounts');
      return accounts || [];
    } catch{
      return [];
    }
  }

  public async updateCurrentValue(key: CredentialKeys, value: string) {
    if(!credentialKeys.includes(key)) {
      return false
    }

    const accounts = await this.getAccounts();
    if(!accounts.length) {
      console.error('Cannot get current account')
      return;
    }

    accounts[0].credentials[key] = value;

    await sessionStorage.set({
      accounts
    });
  }

  public isAddingAccountMode() {
    try {
      return window.self !== window.top;
    } catch{
      return true;
    }
  }

  public async onAccountAdded(callback: (accounts: AccountsItem[]) => void) {
    window.addEventListener('message', (e) => {
      if('type' in e.data && e.data.type === this.eventName) {
        callback(e.data.accounts);
      }
    });
  }

  public async exitAddingAccountMode() {
    window.parent.postMessage({
      type: this.eventName,
      accounts: await this.getAccounts()
    });
  }

  public async syncAccounts(newAccounts: AccountsItem[]) {
    const currentAccounts = await this.getAccounts();
    const result = [...newAccounts, ...currentAccounts];

    await sessionStorage.set({
      accounts: result
    });
  }

  public currentAccount(): number {
    return (JSON.parse(localStorage.get('accounts')) || [])?.[0].id
  }
}

export const appAccountsManager = new AppAccountsManager();
