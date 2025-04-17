import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocEditor from '../components/DocEditor';
import Sidebar from '../components/SideBar';
import { AppDispatch, RootState } from '../stores/store';
import { toggleSidebar, toggleTheme } from '../stores/uiSlice';
import DocGenerator from '../components/DocGenerator';

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSidebarOpen, theme } = useSelector((state: RootState) => state.ui);
  const { currentDocument } = useSelector((state: RootState) => state.documents);

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded hover:bg-blue-700"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">Document Generator</h1>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded hover:bg-blue-700"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>
        
        <main className="flex-1 overflow-auto p-4">
          {currentDocument ? <DocEditor /> : <DocGenerator />}
        </main>
      </div>
    </div>
  );
};

export default Home;