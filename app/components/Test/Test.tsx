import React, {useState} from 'react';
import Configstore from 'configstore';
import InstallProcess from '../../backend/proccess-manager/install.process';
import ReinstallProcess from '../../backend/proccess-manager/reinstall.process';
import UninstallProcess from '../../backend/proccess-manager/uninstall.process';
import AccountRemoveProcess from '../../backend/proccess-manager/account-remove.process';
import { Observer } from '../../backend/proccess-manager/observer.interface';
import { Subject } from '../../backend/proccess-manager/subject.interface';
import AccountCreateProcess from '../../backend/proccess-manager/account-create.process';

class Listener implements Observer {
  private logFunc: any;
  constructor(func: any) {
    this.logFunc = func;
  }

  public update(subject: Subject, payload: any) {
    this.logFunc(`${subject.state}/${subject.actions.length} > ${payload.msg}`);
    console.log(`${subject.state}/${subject.actions.length}`, payload.msg);
  }
}

const setClientStorageParams = (storeName: string, params: any) => {
  const conf = new Configstore(storeName);
  Object.keys(params).forEach((key) => {
    conf.set(key, params[key]);
  });
};

let configIsSet = false;

const Test = () => {
  let [accessKeyId, setAccessKeyId] = useState('');
  let [secretAccessKey, setSecretAccessKey] = useState('');
  let [processStatus, setProcessStatus] = useState('');
  let [otp, setOtp] = useState('');
  if (!configIsSet) {
    configIsSet = true;
    const generalConf = new Configstore('blox');
    if (generalConf.get('otp')) setOtp(generalConf.get('otp'));
    if (generalConf.get('credentials')) setAccessKeyId(generalConf.get('credentials').accessKeyId);
    if (generalConf.get('credentials')) setSecretAccessKey(generalConf.get('credentials').secretAccessKey);
  }
  return (
    <div>
      <h1>CLI commands</h1>
      <button
        onClick={async () => {
          const storeName = 'blox';
          const conf = new Configstore(storeName);
          console.log(conf.get('seed'));
          const accountCreateProcess = new AccountCreateProcess(storeName);
          const listener = new Listener(setProcessStatus);
          accountCreateProcess.subscribe(listener);
          try {
            await accountCreateProcess.run();
          } catch (e) {
            setProcessStatus(e);
          }
          console.log('+ Congratulations. Private Key Created');
        }}
      >
        Account Create
      </button>
      <button
        onClick={async () => {
          const mainStoreName = `blox`;
          const tmpStoreName = `blox-tmp`;
          const confMain = new Configstore(mainStoreName);

          setClientStorageParams(tmpStoreName, {
            credentials: confMain.get('credentials'),
            otp: confMain.get('otp'),
            keyPair: confMain.get('keyPair'),
            securityGroupId: confMain.get('securityGroupId'),
          });

          const listener = new Listener(setProcessStatus);
          const reinstallProcess = new ReinstallProcess(tmpStoreName);
          reinstallProcess.subscribe(listener);
          try {
            await reinstallProcess.run();
          } catch (e) {
            setProcessStatus(e);
          }
          const confTmpStore = new Configstore(tmpStoreName);
          setClientStorageParams(confMain, {
            addressId: confTmpStore.get('addressId'),
            publicIp: confTmpStore.get('publicIp'),
            instanceId: confTmpStore.get('instanceId'),
            vaultRootToken: confTmpStore.get('vaultRootToken'),
            keyVaultVersion: confTmpStore.get('keyVaultVersion'),
          });
          confTmpStore.clear();

          console.log('+ Congratulations. Reinstallation is done!');
        }}
      >
        Reinstall
      </button>
      <button
        onClick={async () => {
          const storeName = 'blox';
          const uninstallProcess = new UninstallProcess(storeName);
          const accountRemoveProcess = new AccountRemoveProcess(storeName);
          const listener = new Listener(setProcessStatus);
          uninstallProcess.subscribe(listener);
          accountRemoveProcess.subscribe(listener);
          try {
            await accountRemoveProcess.run();
            await uninstallProcess.run();
          } catch (e) {
            setProcessStatus(e);
          }
          console.log('+ Uninstallation is done!');
        }}
      >
        Uninstall
      </button>
      <button onClick={() => console.log('test')}>Reboot</button>
      <p/>
      <input type={'text'} value={otp} onChange={(event) => { console.log(event.target.value); setOtp(event.target.value); } } placeholder="Otp" />
      <br/>
      <input type={'text'} value={accessKeyId} onChange={(event) => setAccessKeyId(event.target.value)} placeholder="Access Key" />
      <br/>
      <input type={'text'} value={secretAccessKey} onChange={(event) => setSecretAccessKey(event.target.value)} placeholder="Access Key Secret" />
      <br/>
      <button
        onClick={async () => {
          const storeName = 'blox';
          const conf = new Configstore(storeName);
          conf.set('otp', otp);
          conf.set('credentials', {
            accessKeyId,
            secretAccessKey,
          });
          const installProcess = new InstallProcess(storeName);
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
      <button
        onClick={async () => {
          const storeName = 'blox';
          const conf = new Configstore(storeName);
          conf.clear();
          otp = '';
          accessKeyId = '';
          secretAccessKey = '';
          setAccessKeyId('');
          setSecretAccessKey('');
          setOtp('');
        }}
      >
        Clean config
      </button>
      <p/>
      <textarea value={processStatus} cols={100} rows={10}></textarea>
    </div>
  );
};

export default Test;
