#!/usr/bin/env node
import { Command } from 'commander';
import Configstore from 'configstore';
import chalk from 'chalk';

import AWSLib from './lib/aws';
import KeyVaultLib from './lib/key-vault';
import InquirerLib from './lib/inquirer';

const clear = require('clear');
const figlet = require('figlet');

const run = async () => {
  clear();
  console.log(
    chalk.yellow(
      figlet.textSync('Blox Staking', { horizontalLayout: 'full' })
    )
  );
  const conf = new Configstore('blox-infra');
  const { version } = require('../package.json');
  console.log(chalk.blue.underline.bold(`version ${version}`));

  const aws = new AWSLib();
  const keyVault = new KeyVaultLib();
  const inquirer = new InquirerLib();
  const program = new Command();
  program
    .version(version)
    .name('blox-live');

  program
    .command('install')
    .description('run install process')
    .option("--otp [otp]", "generated OTP for installation")
    .action(async(options) => {
      if (!conf.get('otp')) {
        if (options.otp) {
          conf.set('otp', options.otp);
        } else {
          const { otp } = await inquirer.askOtp();
          conf.set('otp', otp);  
        }  
      }
      try {
        console.log(chalk.blue('+ Setup server'));
        !conf.get('installed.aws') && await aws.install();
  
        console.log(chalk.blue('+ Install Key Vault'));
        !conf.get('installed.keyVault') && await keyVault.install();
  
        console.log(chalk.green('+ Congratulations. Setup is done!'));
        console.log(chalk.blue(`> Open in your browser http://${conf.get('publicIp')}:8200 and setup Vault.`));
      } catch(err) {
        console.log(chalk.red(err.message));
      }      
    });

  program
    .command('uninstall')
    .description('run uninstall process')
    .action(async() => {
      try {
        console.log(chalk.blue('- Account organization'));
        !conf.get('uninstalled.keyVault') && await keyVault.uninstall();
  
        console.log(chalk.blue('- Environment'));
        !conf.get('uninstalled.aws') && await aws.uninstall();
  
        console.log(chalk.blue('- Clean local storage'));
        conf.all = {};
  
        console.log(chalk.blue('- Uninstallation done!'));
      } catch(err) {
        console.log(chalk.red(err.message));
      }
    });

  program
    .command('reboot')
    .description('reboot instance')
    .action(async() => {
      try {
        await aws.reboot();
        console.log(chalk.blue('Server reboot requested!'));
      } catch(err) {
        console.log(chalk.red(err.message));
      }
    });

  program.parse(process.argv);
  return;

  console.log(chalk.blue.underline.bold(`version ${version}`));
  const argv = require('minimist')(process.argv.slice(2));
  const uninstall = argv._.includes('uninstall');
  if (uninstall) {
    try {
      console.log(chalk.blue('- Account organization'));
      !conf.get('uninstalled.keyVault') && await keyVault.uninstall();

      console.log(chalk.blue('- Environment'));
      !conf.get('uninstalled.aws') && await aws.uninstall();

      console.log(chalk.blue('- Clean local storage'));
      conf.all = {};

      console.log(chalk.blue('- Uninstallation done!'));
    } catch(err) {
      console.log(chalk.red(err.message));
    }
  } else {
    if (!conf.get('otp')) {
      if (argv.otp) {
        conf.set('otp', argv.otp);
      } else {
        const { otp } = await inquirer.askOtp();
        conf.set('otp', otp);  
      }  
    }

    try {
      console.log(chalk.blue('+ Setup server'));
      !conf.get('installed.aws') && await aws.install();

      console.log(chalk.blue('+ Install Key Vault'));
      !conf.get('installed.keyVault') && await keyVault.install();

      console.log(chalk.green('+ Congratulations. Setup is done!'));
      console.log(chalk.blue(`> Open in your browser http://${conf.get('publicIp')}:8200 and setup Vault.`));
    } catch(err) {
      console.log(chalk.red(err.message));
    }
  }
  process.exit();
};

run();