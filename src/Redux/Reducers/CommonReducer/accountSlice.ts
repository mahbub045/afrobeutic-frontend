import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../Store";

interface AccountState {
  activeAccountId: string | null;
}

const initialState: AccountState = {
  activeAccountId: null,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setActiveAccount: (state, action: PayloadAction<string>) => {
      state.activeAccountId = action.payload;
    },
    clearActiveAccount: (state) => {
      state.activeAccountId = null;
    },
  },
});

export const { setActiveAccount, clearActiveAccount } = accountSlice.actions;

export const selectActiveAccountId = (state: RootState) =>
  state.account.activeAccountId;

export default accountSlice.reducer;
