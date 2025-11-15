import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SingleSalonState {
  activeTab: string;
  isHydrated: boolean;
}

const initialState: SingleSalonState = {
  activeTab: "dashboard",
  isHydrated: false,
};

const singleSalonSlice = createSlice({
  name: "singleSalon",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("singleSalonActiveTab", action.payload);
      }
    },
    hydrateFromLocalStorage: (state) => {
      if (typeof window !== "undefined") {
        const savedTab = localStorage.getItem("singleSalonActiveTab");
        state.activeTab = savedTab || "dashboard";
      }
      state.isHydrated = true;
    },
  },
});

export const { setActiveTab, hydrateFromLocalStorage } = singleSalonSlice.actions;
export default singleSalonSlice.reducer;
