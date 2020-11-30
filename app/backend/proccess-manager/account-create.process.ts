import KeyVaultService from '../services/key-vault/key-vault.service';
import ProcessClass from './process.class';
import AccountService from '../services/account/account.service';
import Connection from '../common/store-manager/connection';

export default class AccountCreateProcess extends ProcessClass {
  private readonly accountService: AccountService;
  private readonly keyVaultService: KeyVaultService;
  public readonly actions: Array<any>;
  public readonly fallbackActions: Array<any>;

  constructor(network: string) {
    super();
    Connection.db().set('network', network);
    this.keyVaultService = new KeyVaultService();
    this.accountService = new AccountService();
    this.actions = [
      { instance: this.accountService, method: 'createAccount', params: { network }},
      { instance: this.keyVaultService, method: 'updateVaultStorage' },
      { instance: this.accountService, method: 'createBloxAccount' }
    ];

    this.fallbackActions = [
      {
        method: 'createBloxAccount',
        actions: [
          { instance: this.accountService, method: 'deleteLastIndexedAccount' },
          { instance: this.keyVaultService, method: 'updateVaultStorage' }
        ]
      }
    ];
  }
}
