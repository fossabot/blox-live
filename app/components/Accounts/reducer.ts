import produce from 'immer';
import * as actionTypes from './actionTypes';

const initialState = {
  isLoading: false,
  error: null,
  data: null
};

const accountsReducer = (state = initialState, action: Action) =>
  produce(state, (draft) => {
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
    }
  });

type Action = {
  type: string;
  payload: any;
};

export default accountsReducer;
