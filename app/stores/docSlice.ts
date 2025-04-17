import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AppThunk } from './store';

interface Document {
  id: string;
  type: 'ebook' | 'ppt' | 'word' | 'pdf' | 'resume';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  currentDocument: Document | null;
}

const initialState: DocumentState = {
  documents: [],
  isLoading: false,
  error: null,
  currentDocument: null,
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    addDocument(state, action: PayloadAction<Document>) {
      state.documents.push(action.payload);
      state.currentDocument = action.payload;
    },
    updateDocument(state, action: PayloadAction<Document>) {
      const index = state.documents.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = action.payload;
        state.currentDocument = action.payload;
      }
    },
    setCurrentDocument(state, action: PayloadAction<Document | null>) {
      state.currentDocument = action.payload;
    },
    setDocuments(state, action: PayloadAction<Document[]>) {
      state.documents = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  addDocument,
  updateDocument,
  setCurrentDocument,
  setDocuments,
} = documentSlice.actions;

export const generateDocument = (
  type: 'ebook' | 'ppt' | 'word' | 'pdf' | 'resume',
  prompt: string,
  options?: any
): AppThunk => async dispatch => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    // Replace with your DeepSeek API endpoint and key
    // const response = await axios.post('https://api.deepseek.com/v1/generate', {
    //   type,
    //   prompt,
    //   options,
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    // });

    const newDocument: Document = {
      id: uuidv4(),
      type,
      title: `New ${type} - ${new Date().toLocaleDateString()}`,
      content: `the mock data of ai test`, // response.data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addDocument(newDocument));
  } catch (err:any) {
    dispatch(setError(err.message || 'Failed to generate document'));
  } finally {
    dispatch(setLoading(false));
  }
};

export default documentSlice.reducer;