import React, { useState } from 'react';

import Store from '../../backend/common/store-manager/store';
import InstallProcess from '../../backend/proccess-manager/install.process';
import ReinstallProcess from '../../backend/proccess-manager/reinstall.process';
import UninstallProcess from '../../backend/proccess-manager/uninstall.process';
import RebootProcess from '../../backend/proccess-manager/reboot.process';
import { Observer } from '../../backend/proccess-manager/observer.interface';
import { Subject } from '../../backend/proccess-manager/subject.interface';
import AccountCreateProcess from '../../backend/proccess-manager/account-create.process';
import KeyManagerService from '../../backend/services/key-manager/key-manager.service';
import KeyVaultService from '../../backend/services/key-vault/key-vault.service';
import AccountService from '../../backend/services/account/account.service';
import WalletService from '../../backend/services/wallet/wallet.service';
import VersionService from '../../backend/services/version/version.service';
import OrganizationService from '../../backend/services/organization/organization.service';
import { Link } from 'react-router-dom/esm/react-router-dom';
import config from '../../backend/common/config';
import { reportCrash } from '../common/service';

class Listener implements Observer {
  private readonly logFunc: any;

  constructor(func: any) {
    this.logFunc = func;
  }

  public update(subject: Subject, payload: any) {
    this.logFunc(`${subject.state}/${subject.actions.length} > ${payload.step.name}`);
    console.log(`${subject.state}/${subject.actions.length}`, payload);
  }
}

let isRendered = null;

const Test = () => {
  const keyManagerService = new KeyManagerService();
  const accountService = new AccountService();
  const keyVaultService = new KeyVaultService();
  const walletService = new WalletService();
  const versionService = new VersionService();
  const store: Store = Store.getStore();
  const organizationService = new OrganizationService();
  let [env, setEnv] = useState('');
  let [cryptoKey, setCryptoKey] = useState('');
  let [network, setNetwork] = useState(config.env.TEST_NETWORK);
  let [accessKeyId, setAccessKeyId] = useState('');
  let [mnemonic, setMnemonic] = useState('');
  let [publicKey, setPublicKey] = useState('');
  let [index, setIndex] = useState(0);
  let [secretAccessKey, setSecretAccessKey] = useState('');
  let [processStatus, setProcessStatus] = useState('');
  if (!isRendered) {
    if (store.exists('env')) {
      setEnv(store.get('env'));
    } else {
      setEnv('production');
    }
    isRendered = true;
  }
  return (
    <div>
      <Link to={'/'} style={{ marginLeft: '16px' }}>Back</Link>
      <h1>Environment</h1>
      <select value={env} onChange={(event) => setEnv(event.target.value)}>
        <option value="">-</option>
        <option value="stage">stage</option>
        <option value="production">production</option>
      </select>
      <button
        onClick={async () => {
          console.log('set custom env', env);
          store.setEnv(env);
        }}
      >
        Set Custom Environment
      </button>
      <button
        onClick={async () => {
          console.log('delete custom env');
          store.deleteEnv();
        }}
      >
        Delete Custom Environment
      </button>

      <h1>CLI commands</h1>
      <div>
        <h3>Step 0. Set password and init storage</h3>
        <input type={'text'} value={cryptoKey} onChange={(event) => setCryptoKey(event.target.value)}
               placeholder="Password"/>
        <br/>
        <button
          onClick={async () => {
            store.setCryptoKey(cryptoKey);
            if (store.exists('credentials')) {
              const credentials: any = store.get('credentials');
              setAccessKeyId(credentials.accessKeyId);
              setSecretAccessKey(credentials.secretAccessKey);
            }
          }}
        >
          Set password for 15mins
        </button>

        <h3>Step 1. Clean storage</h3>
        <button
          onClick={async () => {
            Store.getStore().clear();
            cryptoKey = '';
            accessKeyId = '';
            secretAccessKey = '';
            mnemonic = '';
            setAccessKeyId('');
            setSecretAccessKey('');
            setMnemonic('');
          }}
        >
          Clean config
        </button>
        <h3>Step 2. Install server & key-vault</h3>
        <input type={'text'} value={accessKeyId} onChange={(event) => setAccessKeyId(event.target.value)}
               placeholder="Access Key"/>
        <br/>
        <input type={'text'} value={secretAccessKey} onChange={(event) => setSecretAccessKey(event.target.value)}
               placeholder="Access Key Secret"/>
        <br/>
        <button
          onClick={async () => { // TODO: check this func
            const installProcess = new InstallProcess({ accessKeyId, secretAccessKey });
            const listener = new Listener(setProcessStatus);
            installProcess.subscribe(listener);
            try {
              await installProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Installation is done!');
          }}
        >
          Install
        </button>
        <h3>Step 3. Save mnemonic phrase</h3>
        <input type={'text'} value={mnemonic} onChange={(event) => setMnemonic(event.target.value)}
               placeholder="Mnemonic phrase"/>
        <button onClick={async () => {
          const seed = await keyManagerService.seedFromMnemonicGenerate(mnemonic);
          console.log('seed', seed);
          store.set('seed', seed);
        }}>
          Set mnemonic phrase
        </button>
        <h2>Select Network</h2>
        <select value={network} onChange={(event) => {
          setNetwork(event.target.value);
          store.set('network', event.target.value);
          console.log('network:', event.target.value);
        }}>
          <option value={config.env.TEST_NETWORK}>Test Network</option>
          <option value={config.env.ZINKEN_NETWORK}>Zinken Network</option>
        </select>
        <h3>Step 4. Account create</h3>
        <button
          onClick={async () => {
            const accountCreateProcess = new AccountCreateProcess(network);
            const listener = new Listener(setProcessStatus);
            accountCreateProcess.subscribe(listener);
            try {
              await accountCreateProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Account Created');
          }}
        >
          Account Create
        </button>
      </div>
      <p/>
      <div>
        <h2>Other</h2>
        <button
          onClick={async () => {
            const listener = new Listener(setProcessStatus);
            const reinstallProcess = new ReinstallProcess();
            reinstallProcess.subscribe(listener);
            try {
              await reinstallProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Re-installation is done!');
          }}
        >
          Reinstall
        </button>
        <button
          onClick={async () => {
            const uninstallProcess = new UninstallProcess();
            const listener = new Listener(setProcessStatus);
            uninstallProcess.subscribe(listener);
            try {
              await uninstallProcess.run();
              accessKeyId = '';
              secretAccessKey = '';
              mnemonic = '';
              setAccessKeyId('');
              setSecretAccessKey('');
              setMnemonic('');
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Uninstallation is done!');
          }}
        >
          Uninstall
        </button>
        <button
          onClick={async () => {
            const rebootProcess = new RebootProcess();
            const listener = new Listener(setProcessStatus);
            rebootProcess.subscribe(listener);
            try {
              await rebootProcess.run();
            } catch (e) {
              setProcessStatus(e);
            }
            console.log('+ Congratulations. Reboot is done!');
          }}
        >
          Reboot
        </button>
        <button
          onClick={async () => {
            await accountService.deleteAllAccounts();
            console.log('+Clean Accounts from storage is done!');
          }}
        >
          Delete Accounts from local/blox/vault-plugin
        </button>
      </div>
      <p/>
      <h2>Local Storage Only</h2>
      <div>
        <button onClick={async () => {
          await keyManagerService.mnemonicGenerate();
        }}>
          Generate Mnemonic
        </button>
        <button onClick={async () => {
          await walletService.createWallet();
        }}>
          Create Wallet
        </button>
        <button onClick={async () => {
          await accountService.createAccount();
        }}>
          Create Account
        </button>
        <button onClick={async () => {
          console.log(await accountService.listAccounts());
        }}>
          List Accounts
        </button>
        <button onClick={async () => {
          await accountService.getLastIndexedAccount();
        }}>
          Get Last Indexed Account
        </button>
        <button onClick={async () => {
          await accountService.deleteLastIndexedAccount();
        }}>
          Delete Last Indexed Account
        </button>
        <br/>
        <button onClick={async () => {
          console.log(store.get('seed'));
        }}>
          Show seed in console
        </button>
        <br/>
        <input type={'text'} value={publicKey} onChange={(event) => setPublicKey(event.target.value)}
               placeholder="Public key"/>
        <input type={'number'} value={index} onChange={(event) => setIndex(+event.target.value)}
               placeholder="Index"/>
        <button onClick={async () => {
          await accountService.getDepositData(publicKey, index, network);
        }}>
          Get Account Deposit Data
        </button>
        <button onClick={async () => {
          await accountService.generatePublicKeys();
        }}>
          Generate Public Key
        </button>
      </div>
      <p/>
      <h2>Blox API</h2>
      <div>
        <button onClick={async () => {
          await reportCrash();
        }}>
          Report crash
        </button>
        <button onClick={async () => {
          console.log(await walletService.get());
        }}>
          Get wallet
        </button>
        <button onClick={async () => {
          console.log(await accountService.get());
        }}>
          Get Accounts
        </button>
        <button onClick={async () => {
          console.log(await versionService.getLatestKeyVaultVersion());
        }}>
          Get Latest KeyVault Version
        </button>
        <button onClick={async () => {
          console.log(await versionService.getLatestBloxLiveVersion());
        }}>
          Get Latest Blox-Live Version
        </button>
        <button onClick={async () => {
          console.log(await organizationService.get());
        }}>
          Get Organization Profile
        </button>
        <button onClick={async () => {
          console.log(await organizationService.getEventLogs());
        }}>
          Get Organization Event Logs
        </button>
      </div>
      <p/>
      <h2>Vault Plugin API</h2>
      <div>
        <button onClick={async () => {
          console.log(await keyVaultService.healthCheck());
        }}>
          Status
        </button>
        <button onClick={async () => {
          const response = await keyVaultService.listAccounts();
          console.log(response.data.accounts);
        }}>
          List Accounts
        </button>
        <button onClick={async () => {
          const response = await keyVaultService.getVersion();
          console.log(response.data.version);
        }}>
          Get Version
        </button>
        <button onClick={async () => {
          await keyVaultService.updateVaultMountsStorage();
        }}>
          Update Storage for both networks
        </button>
        <button onClick={async () => {
          await keyVaultService.exportSlashingData();
        }}>
          Export Slashing Data
        </button>
        <button onClick={async () => {
          await keyVaultService.importSlashingData();
        }}>
          Import Slashing Data
        </button>
      </div>
      <p/>
      <textarea value={processStatus} cols={100} rows={10} readOnly={true}></textarea>
    </div>
  );
};

export default Test;
