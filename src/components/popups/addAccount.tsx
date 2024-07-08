import PopupElement from '.';
import {render} from 'solid-js/web';
import {onMount} from 'solid-js';
import {appAccountsManager} from '../../lib/appManagers/appAccountsManager';

export class AddAccountPopup extends PopupElement {
  constructor() {
    super('add-account-popup', {
      closable: true,
      overlayClosable: true,
      body: true,
      scrollable: false,
      footer: false
    });

    this.construct();
  }

  private async construct() {
    render(() => {
      onMount(() => {
        appAccountsManager.onAccountAdded(async(accounts) => {
          if(!accounts?.length) {
            throw new Error('Cannot add new account');
          }

          await appAccountsManager.syncAccounts(accounts);
          await appAccountsManager.changeAccount(accounts[0].id);
          this.hide();
          window.location.href = '/';
        })
      });

      return (
        <iframe
          src="/"
          credentialless
          allowtransparency={true}
          onload={(e) => {
            e.target.classList.add('active');
          }}
          style={{
            'background-color': 'var(--surface-color)'
          }}
        />
      );
    }, this.body);
  }
}
