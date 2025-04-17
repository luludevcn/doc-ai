import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  // exportAsPDF,
  exportAsWord,
  // exportAsPPT,
  exportAsTXT,
  exportAsEPUB,
} from '../utils/exportUtils';
import { updateDocument } from '../stores/docSlice';
import { AppDispatch, RootState } from '../stores/store';

const DocEditor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentDocument } = useSelector((state: RootState) => state.documents);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content);
      setTitle(currentDocument.title);
    }
  }, [currentDocument]);

  const handleSave = () => {
    if (currentDocument) {
      dispatch(
        updateDocument({
          ...currentDocument,
          content,
          title,
          updatedAt: new Date().toISOString(),
        })
      );
    }
  };

  const handleExport = (format: string) => {
    if (!currentDocument) return;

    switch (format) {
      case 'pdf':
        // exportAsPDF(content, title);
        break;
      case 'word':
        exportAsWord(content, title);
        break;
      case 'ppt':
        // exportAsPPT(content, title);
        break;
      case 'txt':
        exportAsTXT(content, title);
        break;
      case 'epub':
        exportAsEPUB(content, title);
        break;
      default:
        break;
    }
  };

  if (!currentDocument) {
    return <div className="p-4">No document selected</div>;
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold p-2 border rounded w-full"
        />
        <div className="flex space-x-2 ml-4">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <select
            onChange={(e) => handleExport(e.target.value)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            <option value="">Export as...</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="ppt">PowerPoint</option>
            <option value="txt">Text</option>
            <option value="epub">EPUB</option>
          </select>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-grow p-4 border rounded resize-none"
        placeholder="Start typing your document here..."
      />
    </div>
  );
};

export default DocEditor;