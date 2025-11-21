import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useHotkeys } from 'react-hotkeys-hook';

interface DiffHighlight {
  lineNumber: number;
  type: 'added' | 'removed' | 'modified';
  isOldLine?: boolean; // For modified lines, indicates if this is the old version
}

const JsonEditor = ({ 
  value, 
  onChange, 
  readOnly = false, 
  height = '400px',
  theme = 'vs-dark',
  onValidationStatusChange,
  diffHighlights = [],
  language = 'json'
}:{
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  theme?: string;
  onValidationStatusChange?: (status: { valid: boolean; error: string | null }) => void;
  diffHighlights?: DiffHighlight[];
  language?: string;
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const applyDiffHighlights = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    // Clear existing decorations first
    if (decorationIdsRef.current.length > 0) {
      decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
    }

    if (diffHighlights.length === 0) return;

    const totalLines = model.getLineCount();
    const validHighlights = diffHighlights.filter(highlight => 
      highlight.lineNumber > 0 && highlight.lineNumber <= totalLines
    );

    if (validHighlights.length === 0) return;

    const decorations = validHighlights.map(highlight => {
      let className = '';
      let backgroundColor = '';
      
      switch (highlight.type) {
        case 'added':
          className = 'diff-line-added';
          backgroundColor = 'rgba(34, 197, 94, 0.15)'; // Green background
          break;
        case 'removed':
          className = 'diff-line-removed';
          backgroundColor = 'rgba(239, 68, 68, 0.15)'; // Red background
          break;
        case 'modified':
          if (highlight.isOldLine) {
            className = 'diff-line-removed';
            backgroundColor = 'rgba(239, 68, 68, 0.15)'; // Red for old line
          } else {
            className = 'diff-line-added';
            backgroundColor = 'rgba(34, 197, 94, 0.15)'; // Green for new line
          }
          break;
      }

      return {
        range: new monaco.Range(highlight.lineNumber, 1, highlight.lineNumber, 1),
        options: {
          isWholeLine: true,
          className: className,
          linesDecorationsClassName: `diff-line-decoration-${highlight.type}${highlight.isOldLine ? '-old' : ''}`,
          backgroundColor: backgroundColor,
          overviewRuler: {
            color: highlight.type === 'added' ? 'rgba(34, 197, 94, 0.8)' : highlight.type === 'removed' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            position: 1
          }
        }
      };
    });

    // Apply new decorations and store the IDs
    decorationIdsRef.current = editor.deltaDecorations([], decorations);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Configure JSON language features
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: true
    });

    // Add custom CSS styles for diff highlighting
    const style = document.createElement('style');
    style.textContent = `
      .diff-line-added {
        background-color: rgba(34, 197, 94, 0.15) !important;
      }
      .diff-line-removed {
        background-color: rgba(239, 68, 68, 0.15) !important;
      }
      .diff-line-decoration-added:before {
        content: "+";
        color: rgba(34, 197, 94, 1);
        font-weight: bold;
        margin-right: 4px;
      }
      .diff-line-decoration-removed:before {
        content: "-";
        color: rgba(239, 68, 68, 1);
        font-weight: bold;
        margin-right: 4px;
      }
      .diff-line-decoration-modified:before {
        content: "~";
        color: rgba(34, 197, 94, 1);
        font-weight: bold;
        margin-right: 4px;
      }
      .diff-line-decoration-modified-old:before {
        content: "-";
        color: rgba(239, 68, 68, 1);
        font-weight: bold;
        margin-right: 4px;
      }
    `;
    document.head.appendChild(style);

    // Add custom validation
    const validateJson = () => {
      const model = editor.getModel();
      const value = model.getValue();
      
      try {
        if (value.trim()) {
          JSON.parse(value);
          onValidationStatusChange?.({ valid: true, error: null });
        }
      } catch (error: any) {
        onValidationStatusChange?.({ valid: false, error: error.message });
      }
    };

    // Validate on content change
    editor.onDidChangeModelContent(() => {
      validateJson();
      
      // Clear any pending timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      
      // Debounce the highlight reapplication to prevent rapid updates during typing
      highlightTimeoutRef.current = setTimeout(() => {
        applyDiffHighlights();
      }, 100);
    });
    
    validateJson(); // Initial validation
    applyDiffHighlights(); // Apply initial highlights
  };

  // Reapply highlights when diffHighlights prop changes
  useEffect(() => {
    // Clear any pending timeout when highlights change externally
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    applyDiffHighlights();
  }, [diffHighlights]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    onChange?.(value || '');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Editor
        height={height}
        width="100%"
        defaultLanguage={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          formatOnPaste: true,
          formatOnType: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          glyphMargin: true,
        }}
      />
    </div>
  );
};

export default JsonEditor;