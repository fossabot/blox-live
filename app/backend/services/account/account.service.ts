import Store from '../../common/store-manager/store';
import BloxApi from '../../common/communication-manager/blox-api';
import { METHOD } from '../../common/communication-manager/constants';
import { Catch, CatchClass, Step } from '../../decorators';
import KeyVaultService from '../key-vault/key-vault.service';
import KeyManagerService from '../key-manager/key-manager.service';
import Web3 from 'web3';
import WalletService from '../wallet/wallet.service';
import config from '../../common/config';
import { hexDecode } from '../../../utils/service';

@CatchClass<AccountService>()
export default class AccountService {
  private readonly store: Store;
  private readonly walletService: WalletService;
  private readonly keyVaultService: KeyVaultService;
  private readonly keyManagerService: KeyManagerService;

  constructor(storePrefix: string = '') {
    this.store = Store.getStore(storePrefix);
    this.walletService = new WalletService();
    this.keyVaultService = new KeyVaultService();
    this.keyManagerService = new KeyManagerService();
  }

  async get() {
    return await BloxApi.request(METHOD.GET, 'accounts');
  }

  async create(payload: any) {
    return await BloxApi.request(METHOD.POST, 'accounts', payload);
  }

  async delete() {
    return await BloxApi.request(METHOD.DELETE, 'accounts');
  }

  async getHighestAttestation(payload: any) {
    if (payload.public_keys.length === 0) return {};
    return await BloxApi.request(METHOD.POST, 'ethereum2/highest-attestation', payload);
  }

  async updateStatus(route: string, payload: any) {
    if (!route) {
      throw new Error('route');
    }
    return await BloxApi.request(METHOD.PATCH, `accounts/${route}`, payload);
  }

  @Step({
    name: 'Create Blox Account',
    requiredConfig: ['seed', 'authToken', 'network']
  })
  @Catch({
    displayMessage: 'Create Blox Account failed'
  })
  async createBloxAccount(): Promise<any> {
    const network = this.store.get('network');
    const index: number = +this.store.get(`index.${network}`) + 1;
    const lastIndexedAccount = await this.keyManagerService.getAccount(this.store.get('seed'), index);
    lastIndexedAccount['network'] = network;
    const account = await this.create(lastIndexedAccount);
    if (account.error && account.error instanceof Error) return;
    return { data: account };
  }

  @Step({
    name: 'Create Account',
    requiredConfig: ['seed', 'network']
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async createAccount(getNextIndex = true, indexToRestore = 0): Promise<void> {
    const network = this.store.get('network');
    const index: number = getNextIndex ? await this.getNextIndex(network) : indexToRestore;

    // 1. get public-keys to create
    const accounts = await this.keyManagerService.getAccount(this.store.get('seed'), index, true);
    const accountsHash = Object.assign({}, ...accounts.map(account => ({ [account.validationPubKey]: account })));
    const publicKeysToGetHighestAttestation = [];

    // 2. get slashing data if exists
    let slashingData = {};
    if (this.store.exists(`slashingData.${network}`)) {
      slashingData = this.store.get(`slashingData.${network}`);
      this.store.delete('slashingData');
    }

    // 3. update accounts-hash from exist slashing storage
    for (const key of Object.keys(accountsHash)) {
      if (slashingData && slashingData.hasOwnProperty(key)) {
        const decodedValue = hexDecode(slashingData[key]);
        const decodedValueJson = JSON.parse(decodedValue);
        const highestAttestation = {
          'highest_source_epoch': decodedValueJson?.HighestAttestation?.source?.epoch,
          'highest_target_epoch': decodedValueJson?.HighestAttestation?.target?.epoch
        };
        accountsHash[key] = { ...accountsHash[key], ...highestAttestation };
      } else {
        publicKeysToGetHighestAttestation.push(key);
      }
    }

    // 4. get highest attestation from slasher to missing public-keys
    const highestAttestationsMap = await this.getHighestAttestation({
      'public_keys': publicKeysToGetHighestAttestation,
      network
    });

    // 5. update accounts-hash from slasher
    for (const [key, value] of Object.entries(highestAttestationsMap)) {
      accountsHash[key] = { ...accountsHash[key], ...value };
    }

    let highestSource = '';
    let highestTarget = '';
    const accountsArray = Object.values(accountsHash);
    for (let i = index; i >= 0; i -= 1) {
      highestSource += `${accountsArray[i]['highest_source_epoch']}${i === 0 ? '' : ','}`;
      highestTarget += `${accountsArray[i]['highest_target_epoch']}${i === 0 ? '' : ','}`;
    }

    // 6. create accounts
    const storage = await this.keyManagerService.createAccount(this.store.get('seed'), index, highestSource, highestTarget);
    this.store.set(`keyVaultStorage.${network}`, storage);
  }

  @Step({
    name: 'Restore Accounts'
  })
  @Catch({
    displayMessage: 'CLI Create Account failed'
  })
  async restoreAccounts(): Promise<void> {
    const indices = this.store.get('index');
    if (indices) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [network, lastIndex] of Object.entries(indices)) {
        const index = +lastIndex;
        if (index > -1) {
          this.store.set('network', network);
          await this.createAccount(false, index);
        }
      }
    }
  }

  async getNextIndex(network: string): Promise<number> {
    let index = 0;
    const accounts = await this.keyVaultService.listAccounts();
    if (accounts.length) {
      index = +accounts[0].name.replace('account-', '') + 1;
    }
    this.store.set(`index.${network}`, (index - 1).toString());
    return index;
  }

  async getDepositData(pubKey: string, index: number, network: string): Promise<any> {
    if (!network) { // TODO: validate networks
      throw new Error('netwrok is missing');
    }
    if (!pubKey) {
      throw new Error('publicKey is empty');
    }
    const publicKeyWithoutPrefix = pubKey.replace(/^(0x)/, '');
    const depositData = await this.keyManagerService.getDepositData(this.store.get('seed'), index, publicKeyWithoutPrefix, network);
    const {
      publicKey,
      withdrawalCredentials,
      signature,
      depositDataRoot,
      depositContractAddress
    } = depositData;

    const depositContractABI = require('./deposit_abi.json');
    const coin = network === config.env.MAINNET_NETWORK ? 'ETH' : 'GoETH';

    const web3 = new Web3(
      'https://goerli.infura.io/v3/d03b92aa81864faeb158166231b7f895'
    );
    const depositContract = new web3.eth.Contract(depositContractABI, depositContractAddress);
    const depositMethod = depositContract.methods.deposit(
      `0x${publicKey}`,
      `0x${withdrawalCredentials}`,
      `0x${signature}`,
      `0x${depositDataRoot}`
    );

    const data = depositMethod.encodeABI();
    return {
      txHash: data,
      network,
      accountIndex: index,
      publicKey,
      depositTo: depositContractAddress,
      coin
    };
  }

  async deleteLastIndexedAccount(): Promise<void> {
    const network = this.store.get('network');
    if (!network) {
      throw new Error('Configuration settings network not found');
    }
    const index: number = +this.store.get(`index.${network}`);
    if (index < 0) {
      await this.walletService.createWallet();
    } else {
      await this.createAccount(false, index);
    }
  }

  // TODO delete per network, blocked by web-api
  async deleteAllAccounts(): Promise<void> {
    const supportedNetworks = [config.env.PYRMONT_NETWORK, config.env.MAINNET_NETWORK];
    for (const network of supportedNetworks) {
      this.store.set('network', network);
      // eslint-disable-next-line no-await-in-loop
      await this.walletService.createWallet();
      // eslint-disable-next-line no-await-in-loop
      await this.keyVaultService.updateVaultStorage();
    }
    await this.delete();
  }

  @Step({
    name: 'Recover accounts'
  })
  @Catch({
    showErrorMessage: true
  })
  async recoverAccounts(): Promise<void> {
    const accounts = await this.get();
    const uniqueNetworks = [...new Set(accounts.map(acc => acc.network))];
    // eslint-disable-next-line no-restricted-syntax
    for (const network of uniqueNetworks) {
      if (network === 'test') continue;
      this.store.set('network', network);
      const networkAccounts = accounts
        .filter(acc => acc.network === network)
        .sort((a, b) => a.name.localeCompare(b.name));

      const lastIndex = networkAccounts[networkAccounts.length - 1].name.split('-')[1];
      await this.createAccount(false, +lastIndex);
    }
  }

  @Catch({
    showErrorMessage: true
  })
  async recovery({ mnemonic, password }: Record<string, any>): Promise<void> {
    const seed = await this.keyManagerService.seedFromMnemonicGenerate(mnemonic);
    const accounts = await this.get();
    if (accounts.length === 0) {
      throw new Error('Validators not found');
    }
    const accountToCompareWith = accounts[0];
    const index = accountToCompareWith.name.split('-')[1];
    const account = await this.keyManagerService.getAccount(seed, index);

    if (account.validationPubKey !== accountToCompareWith.publicKey.replace(/^(0x)/, '')) {
      throw new Error('Passphrase not linked to your account.');
    }
    this.store.clear();
    await this.store.setNewPassword(password, false);
    this.store.set('seed', seed);
  }
}
