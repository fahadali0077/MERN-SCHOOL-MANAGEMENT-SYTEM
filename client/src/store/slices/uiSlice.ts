// uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  theme: 'dark' | 'light';
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    activeModal: null,
    theme: 'dark'
  } as UIState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
    toggleSidebarCollapse: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    openModal: (state, action: PayloadAction<string>) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => { state.theme = action.payload; },
  }
});

export const { toggleSidebar, setSidebarOpen, toggleSidebarCollapse, openModal, closeModal, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
