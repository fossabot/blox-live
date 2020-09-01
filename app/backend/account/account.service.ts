import { StoreService, resolveStoreService } from '../store-manager/store.service';
import AccountKeyVaultService from './account-key-vault.service';
import BloxApiService from '../communication-manager/blox-api.service';
import { METHOD } from '../communication-manager/constants';
import { Catch, CatchClass, Step } from '../decorators';

@CatchClass<AccountService>()
export default class AccountService {
  private readonly storeService: StoreService;
  private readonly accountKeyVaultService: AccountKeyVaultService;

  constructor(storePrefix: string = '') {
    this.storeService = resolveStoreService(storePrefix);
    this.accountKeyVaultService = new AccountKeyVaultService();
  }

  async get() {
    return await BloxApiService.request(METHOD.GET, 'accounts');
  }

  async create(payload: any) {
    return await BloxApiService.request(METHOD.POST, 'accounts', payload);
  }

  async delete() {
    return await BloxApiService.request(METHOD.DELETE, 'accounts');
  }

  async updateStatus(route: string, payload: any) {
    if (!route) {
      throw new Error('route');
    }
    return await BloxApiService.request(METHOD.PATCH, `accounts/${route}`, payload);
  }

  @Step({
    name: 'Create Blox Account',
    requiredConfig: ['authToken']
  })
  @Catch({
    displayMessage: 'Create Blox Account failed'
  })
  async createBloxAccount(): Promise<any> {
    const lastIndexedAccount = await this.accountKeyVaultService.getLastIndexedAccount();
    if (!lastIndexedAccount) {
      throw new Error('No account to create');
    }
    const account = await this.create(lastIndexedAccount);
    return { data: account };
  }

  @Step({
    name: 'Remove Blox Accounts',
    requiredConfig: ['authToken']
  })
  async deleteBloxAccounts(): Promise<void> {
    await this.delete();
    this.storeService.delete('keyVaultStorage');
  }
}
