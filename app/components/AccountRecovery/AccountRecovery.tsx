import React, { useState } from 'react';
import * as Modals from './Modals';
import { FailureModal, SuccessModal, ThankYouModal } from '../KeyVaultModals';
import { MODAL_TYPES } from '../Dashboard/constants';

const { WelcomeModal, Step1Modal, Step2Modal, RecoveringModal } = Modals;

const successText = 'You\'re all set! This is now your primary device and you have full access to your Blox staking account.';

const AccountRecovery = ({onSuccess, onClose, type}: Props) => {
  const [step, setStep] = useState(0);
  const move1StepForward = () => setStep(step + 1);
  const move2StepsForward = () => setStep(step + 2);
  const onCloseClick = type !== MODAL_TYPES.DEVICE_SWITCH ? () => onClose() : null;
  switch (step) {
    case 0:
      return <WelcomeModal onClose={onCloseClick} onClick={move1StepForward} type={type} />;
    case 1:
      return <Step1Modal onClose={onCloseClick} onClick={move1StepForward} />;
    case 2:
      return <Step2Modal onClick={move1StepForward} type={type} />;
    case 3:
      return <RecoveringModal move1StepForward={move1StepForward} move2StepsForward={move2StepsForward} type={type} />;
    case 4:
      return <SuccessModal title={'Account Recovered'} text={successText} onSuccess={onSuccess} />;
    case 5:
      return <FailureModal title={'Failed To Recover'} onClick={move1StepForward} />;
    case 6:
      return <ThankYouModal type={type} />;
    default:
      return <WelcomeModal onClose={onCloseClick} onClick={move1StepForward} type={type} />;
  }
};

type Props = {
  onSuccess: () => void;
  onClose: () => void;
  type: string;
};

export default AccountRecovery;
