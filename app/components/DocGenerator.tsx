import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { generateDocument, setCurrentDocument } from '../stores/docSlice';
import { AppDispatch, RootState } from '../stores/store';

const DocGenerator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeTab } = useSelector((state: RootState) => state.ui);
  const { isLoading } = useSelector((state: RootState) => state.documents);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    dispatch(generateDocument(activeTab, prompt));
  };

  const handleNewDocument = () => {
    dispatch(setCurrentDocument(null));
    setPrompt('');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Generate New {activeTab.toUpperCase()}</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 border rounded h-32"
          placeholder={`Describe the ${activeTab} you want to generate...`}
        />
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
        <button
          onClick={handleNewDocument}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DocGenerator;