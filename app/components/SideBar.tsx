import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../stores/store';
import { setCurrentDocument } from '../stores/docSlice';
import { setActiveTab, toggleSidebar } from '../stores/uiSlice';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSidebarOpen, activeTab } = useSelector((state: RootState) => state.ui);
  const { documents } = useSelector((state: RootState) => state.documents);

  const handleTabChange = (tab: 'ebook' | 'ppt' | 'word' | 'pdf' | 'resume') => {
    dispatch(setActiveTab(tab));
    dispatch(setCurrentDocument(null));
  };

  const handleDocumentClick = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      dispatch(setCurrentDocument(doc));
    }
  };

  if (!isSidebarOpen) return null;

  return (
    <div className="w-64 bg-gray-100 h-full border-r p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Documents</h2>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Create New</h3>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => handleTabChange('ebook')}
            className={`text-left p-2 rounded ${activeTab === 'ebook' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
          >
            Ebook
          </button>
          <button
            onClick={() => handleTabChange('ppt')}
            className={`text-left p-2 rounded ${activeTab === 'ppt' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
          >
            PowerPoint
          </button>
          <button
            onClick={() => handleTabChange('word')}
            className={`text-left p-2 rounded ${activeTab === 'word' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
          >
            Word Document
          </button>
          <button
            onClick={() => handleTabChange('pdf')}
            className={`text-left p-2 rounded ${activeTab === 'pdf' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
          >
            PDF
          </button>
          <button
            onClick={() => handleTabChange('resume')}
            className={`text-left p-2 rounded ${activeTab === 'resume' ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
          >
            Resume
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Recent Documents</h3>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents yet</p>
        ) : (
          <ul className="space-y-1">
            {documents.map(doc => (
              <li key={doc.id}>
                <button
                  onClick={() => handleDocumentClick(doc.id)}
                  className="text-left p-2 rounded hover:bg-gray-200 w-full truncate"
                >
                  {doc.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;