import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';

import { InfoWithTooltip } from 'common/components';
import { KeyVaultReactivation } from '../../..';
import { useInjectSaga } from '../../../../utils/injectSaga';
import * as wizardActions from '../../actions';
import * as selectors from '../../selectors';
import saga from '../../saga';
import { getAccounts } from '../../../Accounts/selectors';
import { allAccountsDeposited } from '../../../Accounts/service';
import ButtonWithIcon from './ButtonWithIcon';

import SeedService from 'backend/key-vault/seed.service';

import bgImage from 'assets/images/bg_staking.jpg';
import keyVaultImg from 'components/Wizard/assets/img-key-vault.svg';
import mainNetImg from 'components/Wizard/assets/img-validator-main-net.svg';

const seedService = new SeedService();

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const Left = styled.div`
  width: 45vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${bgImage});
  background-size: cover;
  color: ${({ theme }) => theme.gray50};
  font-size: 54px;
  font-weight: 500;
  text-align: center;
`;

const Right = styled.div`
  width: 55vw;
  height: 100%;
  padding: 100px 11vw 0px 11vw;
`;

const IntroText = styled.div`
  color: ${({ theme }) => theme.gray600};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
`;

let toolTipText = "Blox KeyVault is responsible for securing your private keys and signing the validators'";
toolTipText += 'activity on the beaconChain. Blox will communicate with your secured KeyVault everyime a validator';
toolTipText += 'is requested to attest/propose, and to do so, the KeyVault must be online 24/7.';

const key = 'wizard';

const WelcomePage = (props: Props) => {
  const { setPage, setStep, step, actions, wallet, accounts, isLoading } = props;
  const { loadWallet } = actions;

  useInjectSaga({ key, saga, mode: '' });
  const [showStep2, setStep2Status] = useState(false);
  const [showReactivationModal, setReactivationModalDisplay] = useState(false);

  useEffect(() => {
    if (!isLoading && !wallet) {
      loadWallet();
    }
    const hasWallet = wallet && (wallet.status === 'active' || wallet.status === 'offline');
    const hasSeed = !!seedService.getSeed();

    if (hasWallet) {
      if (hasSeed) {
        if (!allAccountsDeposited(accounts)) { jumpToDepositPage(); }
        else { setStep2Status(true); }
      }
      else {
        jumpToPassPhrasePage();
      }
    }
  }, [isLoading]);

  const onStep1Click = () => !showStep2 && setPage(1);

  const onStep2Click = () => {
    if (wallet.status === 'offline') {
      setReactivationModalDisplay(true);
    }
    else if (wallet.status === 'active') {
      jumpToCreateWallet();
    }
  };

  const jumpToPassPhrasePage = () => setPage(3);

  const jumpToCreateWallet = () => {
    setStep(step + 1);
    setPage(5);
  };

  const jumpToDepositPage = () => {
    setStep(step + 1);
    setPage(7);
  };

  return (
    <Wrapper>
      <Left>Start Staking With Blox!</Left>
      <Right>
        <IntroText>
          Never surrender your private keys with non-custodial staking. <br />
          This one-time wizard will guide you through creating your <br />
          KeyVault
          <InfoWithTooltip title={toolTipText} placement="bottom" />
          and validator client. <br /> <br />
          Your KeyVault securely manages private keys and must <br />
          maintain online connectivity.
        </IntroText>
        <ButtonWithIcon title="Step 1" subTitle="KeyVault Setup" image={keyVaultImg}
          isDisabled={showStep2} onClick={onStep1Click} isLoading={isLoading}
        />
        <ButtonWithIcon title="Step 2" subTitle="Create A Validator" image={mainNetImg}
          isDisabled={!showStep2} onClick={onStep2Click}
        />
      </Right>
      {showReactivationModal && <KeyVaultReactivation onClose={() => setReactivationModalDisplay(false)} />}
    </Wrapper>
  );
};

const mapStateToProps = (state: State) => ({
  isLoading: selectors.getIsLoading(state),
  wallet: selectors.getWallet(state),
  accounts: getAccounts(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  actions: bindActionCreators(wizardActions, dispatch),
});

type Props = {
  setPage: (page: number) => void;
  setStep: (step: number) => void;
  step: number;
  actions: Record<string, any>;
  wallet: Record<string, any>;
  accounts: [];
  isLoading: boolean;
};

type State = Record<string, any>;
type Dispatch = (arg0: { type: string }) => any;

export default connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
