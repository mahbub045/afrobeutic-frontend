import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SingleSalonState {
  activeTab: string;
}

const initialState: SingleSalonState = {
  activeTab: "dashboard",
};

const singleSalonSlice = createSlice({
  name: "singleSalon",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = singleSalonSlice.actions;
export default singleSalonSlice.reducer;
