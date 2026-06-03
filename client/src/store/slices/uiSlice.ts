// uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'dark' | 'light';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  theme: Theme;
}

// Read persisted theme (falls back to OS preference, then dark).
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    sidebarCollapsed: false,
    activeModal: null,
    theme: getInitialTheme(),
  } as UIState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
    toggleSidebarCollapse: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    openModal: (state, action: PayloadAction<string>) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') window.localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') window.localStorage.setItem('theme', state.theme);
    },
  }
});

export const {
  toggleSidebar, setSidebarOpen, toggleSidebarCollapse,
  openModal, closeModal, setTheme, toggleTheme,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectTheme = (s: { ui: UIState }) => s.ui.theme;
