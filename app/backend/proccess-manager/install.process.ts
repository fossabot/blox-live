import { v4 as uuidv4 } from 'uuid';
import AwsService from '../services/aws/aws.service';
import WalletService from '../services/wallet/wallet.service';
import KeyVaultService from '../services/key-vault/key-vault.service';
import ProcessClass from './process.class';
import Store from '../common/store-manager/store';
import UsersService from '../services/users/users.service';

export default class InstallProcess extends ProcessClass {
  private readonly awsService: AwsService;
  private readonly keyVaultService: KeyVaultService;
  private readonly walletService: WalletService;
  private readonly userService: UsersService;
  public readonly actions: Array<any>;

  constructor({ accessKeyId, secretAccessKey, isNew = true }) {
    super();
    this.userService = new UsersService();

    const store: Store = Store.getStore();
    if (!store.exists('uuid')) {
      const uuid = uuidv4();
      this.userService.update({ uuid });
      store.set('uuid', uuid);
    }
    store.set('credentials', { accessKeyId, secretAccessKey });

    this.keyVaultService = new KeyVaultService();
    this.awsService = new AwsService();
    this.walletService = new WalletService();

    this.actions = [
      { instance: this.awsService, method: 'setAWSCredentials' },
      { instance: this.awsService, method: 'validateAWSPermissions' },
      { instance: this.awsService, method: 'createEc2KeyPair' },
      { instance: this.awsService, method: 'createElasticIp' },
      { instance: this.awsService, method: 'createSecurityGroup' },
      { instance: this.awsService, method: 'createInstance' },
      { instance: this.keyVaultService, method: 'installDockerScope' },
      { instance: this.keyVaultService, method: 'runDockerContainer' },
      { instance: this.keyVaultService, method: 'getKeyVaultRootToken' },
      { instance: this.walletService, method: 'syncVaultWithBlox', params: { isNew } },
      { instance: this.keyVaultService, method: 'getKeyVaultStatus' }
    ];
  }
}
