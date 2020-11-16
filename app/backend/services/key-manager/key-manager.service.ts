import { CatchClass } from '../../decorators';
import util from 'util';
import { exec } from 'child_process';
import { execPath } from '../../../binaries';

@CatchClass<KeyManagerService>()
export default class KeyManagerService {
  private readonly executablePath: string;
  private readonly executor: (command: string) => Promise<any>;

  constructor() {
    this.executor = util.promisify(exec);
    this.executablePath = execPath;
  }

  async createWallet(): Promise<string> {
    const { stdout, stderr } = await this.executor(`${this.executablePath} wallet create`);
    if (stderr) {
      throw new Error(`Cli error: ${stderr}`);
    }
    return stdout.replace('\n', '');
  }

  async createAccount(seed: string, index: number): Promise<string> {
    const { stdout, stderr } = await this.executor(
      `${this.executablePath} wallet account create --seed=${seed} --index=${index} --accumulate=true`
    );
    if (stderr) {
      throw new Error('Create keyvault account was failed.');
    }
    return stdout.replace('\n', '');
  }

  async getAccount(seed: string, index: number): Promise<string> {
    const { stdout, stderr } = await this.executor(
      `${this.executablePath} wallet account create --seed=${seed} --index=${index} --response-type=object`
    );
    if (stderr) {
      throw new Error('Get keyvault account was failed.');
    }
    return stdout ? JSON.parse(stdout) : {};
  }

  async listAccounts(storage: string): Promise<any> {
    const { stdout, stderr } = await this.executor(
      `${this.executablePath} wallet account list --storage=${storage}`
    );
    if (stderr) {
      throw new Error('List keyvault accounts was failed.');
    }
    const accounts = stdout ? JSON.parse(stdout) : [];
    return accounts;
  }

  async getDepositData(seed: string, index: number, publicKey: string, network: string): Promise<any> {
    const { stdout, stderr } = await this.executor(
      `${this.executablePath} wallet account deposit-data --seed=${seed} --index=${index} --public-key=${publicKey} --network=${network}`
    );
    if (stderr) {
      throw new Error('Get deposit data was failed.');
    }
    return stdout ? JSON.parse(stdout) : {};
  }

  async generatePublicKey(seed: string, index: number): Promise<void> {
    const { stdout, stderr } = await this.executor(`${this.executablePath} wallet public-key generate --seed=${seed} --index=${index}`);
    if (stderr) {
      throw new Error('Generate public key failed.');
    }
    console.log(stdout);
  }

  async mnemonicGenerate(): Promise<string> {
    const { stdout, stderr } = await this.executor(`${this.executablePath} mnemonic generate`);
    if (stderr) {
      throw new Error('Generate mnemonic failed.');
    }
    console.log(stdout);
    return stdout.replace('\n', '');
  }

  async seedFromMnemonicGenerate(mnemonic: string): Promise<string> {
    const defaultMnemonicLengthPhrase = 24;
    if (!mnemonic || mnemonic.length === 0) {
      throw new Error('Mnemonic phrase is empty');
    }
    if (mnemonic.split(' ').length !== defaultMnemonicLengthPhrase) {
      throw new Error('Mnemonic phrase should have 24-word length');
    }
    const { stdout, stderr } = await this.executor(`${this.executablePath} seed generate --mnemonic="${mnemonic}"`);
    if (stderr) {
      throw new Error('Not possible to generate seed by mnemonic phrase');
    }
    return stdout.replace('\n', '');
  }
}
