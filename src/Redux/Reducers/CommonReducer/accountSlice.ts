import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../Store";

interface ActiveAccountPayload {
  id: string;
  role?: string | null;
}

interface AccountState {
  activeAccountId: string | null;
  activeAccountRole: string | null;
}

const initialState: AccountState = {
  activeAccountId: null,
  activeAccountRole: null,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setActiveAccount: (state, action: PayloadAction<ActiveAccountPayload>) => {
      state.activeAccountId = action.payload.id;
      state.activeAccountRole = action.payload.role ?? null;
    },
    clearActiveAccount: (state) => {
      state.activeAccountId = null;
      state.activeAccountRole = null;
    },
  },
});

export const { setActiveAccount, clearActiveAccount } = accountSlice.actions;

export const selectActiveAccountId = (state: RootState) =>
  state.account.activeAccountId;

export const selectActiveAccountRole = (state: RootState) =>
  state.account.activeAccountRole;

export default accountSlice.reducer;
