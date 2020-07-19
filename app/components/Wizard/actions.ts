import * as actionTypes from './actionTypes';

export const createOneTimePass = () => ({
  type: actionTypes.CREATE_ONE_TIME_PASS,
});

export const createOneTimePassSuccess = (payload: Record<string, any>) => ({
  type: actionTypes.CREATE_ONE_TIME_PASS_SUCCESS,
  payload,
});

export const createOneTimePassFailure = (error: Record<string, any>) => ({
  type: actionTypes.CREATE_ONE_TIME_PASS_FAILURE,
  payload: error,
});

export const loadWallet = () => ({ type: actionTypes.LOAD_WALLET });

export const loadWalletSuccess = (payload: Record<string, any>) => ({
  type: actionTypes.LOAD_WALLET_SUCCESS,
  payload,
});

export const loadWalletFailure = (error: Record<string, any>) => ({
  type: actionTypes.LOAD_WALLET_FAILURE,
  payload: error,
});

export const setNetworkType = (networkType: string) => ({
  type: actionTypes.SET_NETWORK_TYPE,
  payload: networkType,
});

export const generateValidatorKey = () => ({
  type: actionTypes.GENERATE_VALIDATOR_KEY,
});

export const generateValidatorKeySuccess = (payload: Record<string, any>) => ({
  type: actionTypes.GENERATE_VALIDATOR_KEY_SUCCESS,
  payload,
});

export const generateValidatorKeyFailure = (error: Record<string, any>) => ({
  type: actionTypes.GENERATE_VALIDATOR_KEY_FAILURE,
  payload: error,
});

export const loadDepositData = () => ({ type: actionTypes.LOAD_DEPOSIT_DATA });

export const loadDepositDataSuccess = (payload: Record<string, any>) => ({
  type: actionTypes.LOAD_DEPOSIT_DATA_SUCCESS,
  payload,
});

export const loadDepositDataFailure = (error: Record<string, any>) => ({
  type: actionTypes.LOAD_DEPOSIT_DATA_FAILURE,
  payload: error,
});

export const setFinishedWizard = (isFinished: boolean) => ({
  type: actionTypes.SET_FINISHED_WIZARD,
  payload: isFinished,
});