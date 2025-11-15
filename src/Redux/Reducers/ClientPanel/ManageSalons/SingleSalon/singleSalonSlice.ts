import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SingleSalonState {
  activeTab: string;
}

const getInitialState = (): SingleSalonState => {
  if (typeof window !== "undefined") {
    const savedTab = localStorage.getItem("singleSalonActiveTab");
    return {
      activeTab: savedTab || "dashboard",
    };
  }
  return {
    activeTab: "dashboard",
  };
};

const initialState: SingleSalonState = getInitialState();

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
  },
});

export const { setActiveTab } = singleSalonSlice.actions;
export default singleSalonSlice.reducer;
