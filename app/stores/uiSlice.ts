import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  activeTab: 'ebook' | 'ppt' | 'word' | 'pdf' | 'resume';
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  isSidebarOpen: true,
  activeTab: 'ebook',
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setActiveTab(state, action: PayloadAction<'ebook' | 'ppt' | 'word' | 'pdf' | 'resume'>) {
      state.activeTab = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleSidebar, setActiveTab, toggleTheme } = uiSlice.actions;

export default uiSlice.reducer;