'use client'; // 客户端组件

import { useSelector, useDispatch } from 'react-redux';
import DocumentEditor from './components/DocEditor';
import Sidebar from './components/SideBar';
import { AppDispatch, RootState } from './stores/store';
import { toggleSidebar, toggleTheme } from './stores/uiSlice';
import DocGenerator from './components/DocGenerator';
import WatermarkTool from './components/WaterMarkTool';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { isSidebarOpen, theme } = useSelector((state: RootState) => state.ui);
  const { currentDocument } = useSelector((state: RootState) => state.documents);

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* <Sidebar /> */}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded hover:bg-blue-700"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold">AI Document</h1>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded hover:bg-blue-700"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4">
          {/* {currentDocument ? <DocumentEditor /> : <DocGenerator />} */}
          <section className="mt-8 p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">PDF/图片水印工具</h2>
            <WatermarkTool />
          </section>
        </main>
      </div>
    </div>
  );
}