import produce from 'immer';
import * as actionTypes from './actionTypes';
import { LOGOUT } from '../CallbackPage/actionTypes';

const initialState = {
  isLoading: false,
  error: null,
  data: null,
  depositNeeded: false,
  addAnotherAccount: false,
};

/* eslint-disable default-case, no-param-reassign */
const accountsReducer = (state = initialState, action: Action) => produce(state, (draft) => {
    switch (action.type) {
      case actionTypes.LOAD_ACCOUNTS:
        draft.isLoading = true;
        break;
      case actionTypes.LOAD_ACCOUNTS_SUCCESS:
        draft.data = action.payload;
        draft.isLoading = false;
        break;
      case actionTypes.LOAD_ACCOUNTS_FAILURE:
        draft.error = action.payload;
        draft.isLoading = false;
        break;
      case actionTypes.SET_DEPOSIT_NEEDED:
        draft.depositNeeded = action.payload;
        break;
      case actionTypes.ADD_ANOTHER_ACCOUNT:
        draft.addAnotherAccount = true;
        break;
      case actionTypes.CLEAR_DATA:
      case LOGOUT:
        draft.isLoading = initialState.isLoading;
        draft.error = initialState.error;
        draft.data = initialState.data;
        draft.addAnotherAccount = initialState.addAnotherAccount;
        break;
    }
  });

type Action = {
  type: string;
  payload: any;
};

export default accountsReducer;
