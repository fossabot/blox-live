import React from 'react';
import { ModalTemplate, Button } from 'common/components';
import { Title, Description } from 'common/components/ModalTemplate/components';
import { MODAL_TYPES } from '../../Dashboard/constants';

import image from 'assets/images/img-recovery.svg';

const WelcomeModal = ({onClick, onClose, type}: Props) => {
  return (
    <ModalTemplate onClose={type !== MODAL_TYPES.DEVICE_SWITCH && onClose} image={image}>
      {type === MODAL_TYPES.DEVICE_SWITCH && (
        <>
          <Title>Switch To This Device?</Title>
          <Description>
            You can easily recover your account data and get full access on this device,
            but doing so will de-activate your old device from performing actions in Blox.
          </Description>
          <Button onClick={onClick}>Import</Button>
        </>
      )}
      {type === MODAL_TYPES.FORGOT_PASSWORD && (
        <>
          <Title>Account Recovery</Title>
          <Description>
            Your account will be recovered and all of your information will be imported to this device.
          </Description>
          <Button onClick={onClick}>Continue</Button>
        </>
      )}

    </ModalTemplate>
  );
};

type Props = {
  onClick: () => void;
  onClose: () => void;
  type: string;
};

export default WelcomeModal;
