// JSON formatting utilities
"use client";

import { toast } from "sonner";

interface FormatJsonParams {
  jsonString: string;
  indent?: number;
}

interface MinifyJsonParams {
  jsonString: string;
}

interface ValidateJsonParams {
  jsonString: string;
}

export const formatJson = ({ jsonString, indent = 2 }: FormatJsonParams): string => {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed, null, indent);
};

export const minifyJson = ({ jsonString }: MinifyJsonParams): string => {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed);
};

export const validateJson = ({ jsonString }: ValidateJsonParams): { valid: boolean; error: string | null } => {
  try {
    if (!jsonString.trim()) {
      return { valid: false, error: 'JSON cannot be empty' };
    }
    JSON.parse(jsonString);
    return { valid: true, error: null };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
};

export const parseJsonSafely = ({jsonString}:{jsonString: string}) => {
    try {
      return JSON.parse(jsonString);
    } catch (error: any) {
      return null;
    }
  };
  
  export const deepEqual = ({obj1, obj2}:{obj1: any, obj2: any}) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

// JSON Storage utilities
export interface JsonEntry {
  id: string;
  content: string;
  timestamp: number;
  type: 'format' | 'diff-left' | 'diff-right' | 'minify';
  title?: string;
}

const STORAGE_KEY = 'json-formatter-history';
const TABS_KEY = 'json-formatter-tabs';
const MAX_ENTRIES = 100; // Limit to prevent storage bloat

export const saveJsonEntry = (content: string, type: JsonEntry['type'], id: string, title?: string): void => {
  try {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }
    const entries = getJsonHistory(type, id);
    const newEntry: JsonEntry = {
      id: id,
      content,
      timestamp: Date.now(),
      type,
      title,
    };

    // Add new entry to the beginning
    entries.unshift(newEntry);

    // Keep only the latest MAX_ENTRIES
    const trimmedEntries = entries.slice(0, MAX_ENTRIES);

    localStorage.setItem(`${STORAGE_KEY}-${type}-${id}`, JSON.stringify(trimmedEntries));
  } catch (error) {
    toast.error('Failed to save JSON entry:');
    console.error('Failed to save JSON entry:', error);
  }
};

export const getJsonHistory = (type: JsonEntry['type'], id: string): JsonEntry[] => {
  try {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return [];
    }
    const stored = localStorage.getItem(`${STORAGE_KEY}-${type}-${id}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    toast.error('Failed to load JSON history:');
    console.error('Failed to load JSON history:', error);
    return [];
  }
};

export const getLatestJsonEntry = (type: JsonEntry['type'], id: string): JsonEntry | null => {
  try {
    const entries = getJsonHistory(type, id);
    if (type) {
      return entries.find(entry => entry.type === type) || null;
    }
    return entries[0] || null;
  } catch (error) {
    console.error('Failed to get latest JSON entry:', error);
    return null;
  }
};

export const deleteJsonEntry = (type: JsonEntry['type'], id: string): void => {
  try {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }
    const entries = getJsonHistory(type, id);
    const filteredEntries = entries.filter(entry => entry.id !== id);
    localStorage.setItem(`${STORAGE_KEY}-${type}-${id}`, JSON.stringify(filteredEntries));
  } catch (error) {
    console.error('Failed to delete JSON entry:', error);
  }
};

export const clearJsonHistory = (type: JsonEntry['type'], id: string): void => {
  try {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(`${STORAGE_KEY}-${type}-${id}`);
  } catch (error) {
    console.error('Failed to clear JSON history:', error);
  }
};

// Keyboard event utilities
export const isCtrlOrCmd = (event: KeyboardEvent): boolean => {
  return event.ctrlKey || event.metaKey;
};

export const handlePasteEvent = (

  currentContent: string,
  type: JsonEntry['type'],
  id: string,
  callback?: () => void
): void => {
 
    // Small delay to allow paste to complete
    setTimeout(() => {
      try {
        // Validate the JSON before saving
        const validation = validateJson({ jsonString: currentContent });
        if (validation.valid && currentContent.trim()) {
          // Generate a title from the JSON content
          const parsed = JSON.parse(currentContent);
          const title = generateJsonTitle(parsed);
          saveJsonEntry(currentContent, type, id, title);
          callback?.();
        }
      } catch (error) {
        // Silent fail - don't save invalid JSON
        console.log('Paste content was not valid JSON, not saving to history');
      }
    }, 100);

};

// Helper to generate a meaningful title for JSON entries
const generateJsonTitle = (jsonObj: any): string => {
  try {
    // Try to find a meaningful identifier
    if (typeof jsonObj === 'object' && jsonObj !== null) {
      const keys = Object.keys(jsonObj);
      
      // Look for common identifying fields
      const identifierFields = ['name', 'title', 'id', 'firstName', 'lastName', 'email', 'username'];
      for (const field of identifierFields) {
        if (jsonObj[field] && typeof jsonObj[field] === 'string') {
          return jsonObj[field];
        }
      }
      
      // If no identifier found, use the first few keys
      if (keys.length > 0) {
        const firstKeys = keys.slice(0, 3).join(', ');
        return `Object with ${firstKeys}${keys.length > 3 ? '...' : ''}`;
      }
    }
    
    return 'JSON Object';
  } catch (error) {
    return 'JSON Object';
  }
};


export const getTabs = () =>{
  // Check if we're in the browser environment
  if (typeof window === 'undefined') {
    return [{ id: '1', label: 'Tab 1' }];
  }
  const tabs = localStorage.getItem(TABS_KEY);
  return tabs ? JSON.parse(tabs) : [{ id: '1', label: 'Tab 1' }];
}

export const saveTabs = (tabs: { id: string; label: string; }[]) =>{
  // Check if we're in the browser environment
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
}