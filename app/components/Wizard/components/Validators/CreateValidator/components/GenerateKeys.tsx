import React from 'react';
import { shell } from 'electron';
import styled from 'styled-components';
import { Spinner } from 'common/components';
import { Title, Paragraph, BigButton, Link } from '../../../common';

const Wrapper = styled.div``;

const ButtonWrapper = styled.div`
  margin-bottom: 12px;
`;

const LoaderWrapper = styled.div`
  max-width:500px;
  display:flex;
`;

const LoaderText = styled.span`
  margin-left: 11px;
  font-size: 12px;
  color: ${({ theme }) => theme.primary900};
`;

const GenerateKeys = (props: Props) => {
  const { isLoading, onClick } = props;
  return (
    <Wrapper>
      <Title>Create TestNet Validator</Title>
      <Paragraph>
        Now we must generate your secure validator keys to begin creating your{' '}
        <br />
        Testnet validator. These keys will be generated securely using KeyVault.{' '}
        <br />
        <Link onClick={() => shell.openExternal(`${process.env.WEBSITE_URL}/guides/what-is-a-validator-key/`)}>
          What is a validator key?
        </Link>
      </Paragraph>
      <ButtonWrapper>
        <BigButton isDisabled={isLoading} onClick={onClick}>
          Generate Validator Keys
        </BigButton>
      </ButtonWrapper>
      {isLoading && (
        <LoaderWrapper>
          <Spinner width="17px" />
          <LoaderText>Generating Validator Keys...</LoaderText>
        </LoaderWrapper>
      )}
    </Wrapper>
  );
};

type Props = {
  isLoading: boolean;
  onClick: () => void;
};

export default GenerateKeys;
