import React, { useState, useMemo, useEffect } from "react";

import { ArrowLeftRight, Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { DiffResult, exportDifferencesToCSV } from "./diff.utils";
import { formatJson, getLatestJsonEntry, handlePasteEvent } from "@/app/_utils/utils";
import { validateJson } from "@/app/_utils/validators";
import { useSwipeHandlers } from "@/app/_utils/mousefunctions";
import DownloadDropdown from "../download.dropdown";
import JsonEditor from "../json.editor";
import { handleCopy } from "../json.formatter/utils";

interface DiffHighlight {
  lineNumber: number;
  type: "added" | "removed" | "modified";
  isOldLine?: boolean;
}


const JsonDiff = ({ tab_id }: { tab_id: string }) => {
  const [leftJson, setLeftJson] = useState("");
  const [rightJson, setRightJson] = useState("");
  const [leftValid, setLeftValid] = useState(true);
  const [rightValid, setRightValid] = useState(true);
  const [currentView, setCurrentView] = useState<'left' | 'right'>('left');

  useEffect(() => {
    const latestLeftEntry = getLatestJsonEntry("diff-left", tab_id);
    const latestRightEntry = getLatestJsonEntry("diff-right", tab_id);

    if (latestLeftEntry && latestLeftEntry.content.trim()) {
      setLeftJson(latestLeftEntry.content);
    } else {
      // Default left JSON if no history exists
      setLeftJson('{\n  "firstName": "Jason",\n  "lastName": "Derulo"\n}');
    }

    if (latestRightEntry && latestRightEntry.content.trim()) {
      setRightJson(latestRightEntry.content);
    } else {
      // Default right JSON if no history exists
      setRightJson('{\n  "firstName": "Jason",\n  "lastName": "Statham"\n}');
    }
  }, [tab_id]);

  useEffect(() => {
    const handleSave = () => {
      // Check if the focused element is in the left or right editor
      const activeElement = document.activeElement;
      const leftEditor = document.querySelector('[data-testid="left-editor"]');
      const rightEditor = document.querySelector(
        '[data-testid="right-editor"]',
      );

      if (leftEditor && leftEditor.contains(activeElement)) {
        handlePasteEvent(leftJson, "diff-left", tab_id, () => {});
      } else if (rightEditor && rightEditor.contains(activeElement)) {
        handlePasteEvent(rightJson, "diff-right", tab_id, () => {});
      }
    };

    handleSave();
  }, [leftJson, rightJson]);

  const getLineContent = (jsonString: string, lineNumber: number): string => {
    const lines = jsonString.split("\n");
    return lines[lineNumber - 1] || "";
  };

  const findNestedLineNumber = (jsonString: string, path: string[]): number => {
    const lines = jsonString.split("\n");

    if (path.length === 1) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes(`"${path[0]}"`)) {
          return i + 1;
        }
      }
    }

    let foundPath: string[] = [];
    let currentLevel = 0;
    let targetLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Count braces to track nesting level
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      currentLevel += openBraces - closeBraces;

      // Look for each part of the path in order
      for (let j: number = foundPath.length; j < path.length; j++) {
        const searchKey = `"${path[j]}"`;
        if (trimmedLine.includes(searchKey)) {
          foundPath.push(path[j]);
          if (foundPath.length === path.length) {
            return i + 1;
          }
          targetLevel = currentLevel;
          break;
        }
      }

      // Reset if we've gone back to a previous level and haven't found the complete path
      if (currentLevel < targetLevel && foundPath.length < path.length) {
        foundPath = [];
        targetLevel = 0;
      }
    }

    return 1; // Default fallback
  };

  const { leftHighlights, rightHighlights, diffResults } = useMemo(() => {
    if (!leftValid || !rightValid) {
      return { leftHighlights: [], rightHighlights: [], diffResults: null };
    }

    try {
      const leftObj = JSON.parse(leftJson);
      const rightObj = JSON.parse(rightJson);

      const leftHighlights: DiffHighlight[] = [];
      const rightHighlights: DiffHighlight[] = [];
      const differences: DiffResult[] = [];

      const compareObjects = (left: any, right: any, path: string[] = []) => {
        const leftKeys =
          left && typeof left === "object" && !Array.isArray(left)
            ? Object.keys(left)
            : [];
        const rightKeys =
          right && typeof right === "object" && !Array.isArray(right)
            ? Object.keys(right)
            : [];
        const allKeys = new Set([...leftKeys, ...rightKeys]);

        allKeys.forEach((key) => {
          const currentPath = [...path, key];
          const pathString = currentPath.join(".");

          if (!(key in left)) {
            const lineNum = findNestedLineNumber(rightJson, currentPath);
            if (lineNum > 0) {
              rightHighlights.push({
                lineNumber: lineNum,
                type: "added",
              });
              differences.push({
                key: pathString,
                type: "added",
                value: right[key],
                line: lineNum,
                side: "right",
                rightLineContent: getLineContent(rightJson, lineNum),
              });
            }
          } else if (!(key in right)) {
            const lineNum = findNestedLineNumber(leftJson, currentPath);
            if (lineNum > 0) {
              leftHighlights.push({
                lineNumber: lineNum,
                type: "removed",
              });
              differences.push({
                key: pathString,
                type: "removed",
                value: left[key],
                line: lineNum,
                side: "left",
                leftLineContent: getLineContent(leftJson, lineNum),
              });
            }
          } else if (
            typeof left[key] === "object" &&
            typeof right[key] === "object" &&
            left[key] !== null &&
            right[key] !== null &&
            !Array.isArray(left[key]) &&
            !Array.isArray(right[key])
          ) {
            compareObjects(left[key], right[key], currentPath);
          } else if (JSON.stringify(left[key]) !== JSON.stringify(right[key])) {
            const leftLineNum = findNestedLineNumber(leftJson, currentPath);
            const rightLineNum = findNestedLineNumber(rightJson, currentPath);

            if (leftLineNum > 0) {
              leftHighlights.push({
                lineNumber: leftLineNum,
                type: "modified",
                isOldLine: true,
              });
            }

            if (rightLineNum > 0) {
              rightHighlights.push({
                lineNumber: rightLineNum,
                type: "modified",
                isOldLine: false,
              });
            }

            differences.push({
              key: pathString,
              type: "modified",
              oldValue: left[key],
              newValue: right[key],
              leftLine: leftLineNum,
              rightLine: rightLineNum,
              leftLineContent: getLineContent(leftJson, leftLineNum),
              rightLineContent: getLineContent(rightJson, rightLineNum),
            });
          }
        });
      };

      compareObjects(leftObj, rightObj);

      return {
        leftHighlights,
        rightHighlights,
        diffResults: differences,
      };
    } catch (error) {
      return { leftHighlights: [], rightHighlights: [], diffResults: null };
    }
  }, [leftJson, rightJson, leftValid, rightValid]);

  // ------------------------------------------------------------//
  //                      SWIPE FUNCTIONS                        // 
  // ------------------------------------------------------------//
  const swipeHandlers = useSwipeHandlers({
    currentView,
    setCurrentView,
    leftView: "left",
    rightView: "right",
  });

  const swapJsons = () => {
    const temp = leftJson;
    setLeftJson(rightJson);
    setRightJson(temp);
  };
; 

  const handleLeftChange = (value: string) => {
    setLeftJson(value);
    
    setTimeout(() => {
      try {
        const validation = validateJson(value);
        if (validation.valid && value.trim()) {
          const formatted = formatJson({ jsonString: value, indent: 2 });
          if (formatted !== value) {
            setLeftJson(formatted);
          }
        }
      } catch (error) {
      }
    }, 100);
  };

  const handleRightChange = (value: string) => {
    setRightJson(value);
    
    setTimeout(() => {
      try {
        const validation = validateJson(value);
        if (validation.valid && value.trim()) {
          const formatted = formatJson({ jsonString: value, indent: 2 });
          if (formatted !== value) {
            setRightJson(formatted);
          }
        }
      } catch (error) {
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Mobile View Selector */}
      <div className="lg:hidden flex justify-center mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setCurrentView('left')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'left'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Left JSON
          </button>
          <button
            onClick={() => setCurrentView('right')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'right'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Right JSON
          </button>
        </div>
      </div>

      {/* Swipe Instructions for Mobile */}
      <div className="lg:hidden text-center text-xs text-gray-500 mb-4">
        👆 Tap to switch or swipe left/right to navigate
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">JSON Diff</h3>
        <div className="flex items-center gap-4">
          {diffResults && diffResults.length > 0 && (
            <div className="text-sm text-gray-600">
              {diffResults.length} difference
              {diffResults.length !== 1 ? "s" : ""} found
            </div>
          )}
          <Button variant="default" className="flex items-center gap-2" onClick={swapJsons}>
            <ArrowLeftRight className="w-4 h-4" />
            Swap
          </Button>
        </div>
      </div>

      

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <div data-testid="left-editor">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Left JSON
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  leftValid
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {leftValid ? "Valid" : "Invalid"}
              </span>
              {leftHighlights.length > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {leftHighlights.length} line
                  {leftHighlights.length !== 1 ? "s" : ""} highlighted
                </span>
              )}
              <Button onClick={() => handleCopy(leftJson)} size='sm' variant='outline'>
                <Copy className="w-4 h-4" />
              </Button>
              <DownloadDropdown content={leftJson} filename="json-diff-left" />
            </div>
          </div>
          <JsonEditor
            value={leftJson}
            onChange={handleLeftChange}
            height="65vh"
            onValidationStatusChange={({ valid }) => setLeftValid(valid)}
            diffHighlights={leftHighlights}
          />
        </div>

        <div data-testid="right-editor">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Right JSON
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  rightValid
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {rightValid ? "Valid" : "Invalid"}
              </span>
              {rightHighlights.length > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {rightHighlights.length} line
                  {rightHighlights.length !== 1 ? "s" : ""} highlighted
                </span>
              )}
              <Button onClick={() => handleCopy(rightJson)} size='sm' variant='outline'>
                <Copy className="w-4 h-4" />
              </Button>
              <DownloadDropdown content={rightJson} filename="json-diff-right" />
            </div>
          </div>
          <JsonEditor
            value={rightJson}
            onChange={handleRightChange}
            height="65vh"
            onValidationStatusChange={({ valid }) => setRightValid(valid)}
            diffHighlights={rightHighlights}
          />
        </div>
      </div>

      {/* Mobile Layout with Swipe */}
      <div 
        className="lg:hidden relative overflow-hidden"
        {...swipeHandlers}
      >
        <div 
          className={`transition-transform duration-300 ease-in-out ${
            currentView === 'left' ? 'translate-x-0' : '-translate-x-full'
          }`}
          data-testid="left-editor-mobile"
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Left JSON
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  leftValid
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {leftValid ? "Valid" : "Invalid"}
              </span>
              {leftHighlights.length > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {leftHighlights.length} line
                  {leftHighlights.length !== 1 ? "s" : ""} highlighted
                </span>
              )}
              <DownloadDropdown content={leftJson} filename="json-diff-left" />
            </div>
          </div>
          <JsonEditor
            value={leftJson}
            onChange={handleLeftChange}
            height="65vh"
            onValidationStatusChange={({ valid }) => setLeftValid(valid)}
            diffHighlights={leftHighlights}
          />
        </div>

        <div 
          className={`absolute top-0 left-0 w-full transition-transform duration-300 ease-in-out ${
            currentView === 'right' ? 'translate-x-0' : 'translate-x-full'
          }`}
          data-testid="right-editor-mobile"
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Right JSON
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  rightValid
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {rightValid ? "Valid" : "Invalid"}
              </span>
              {rightHighlights.length > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {rightHighlights.length} line
                  {rightHighlights.length !== 1 ? "s" : ""} highlighted
                </span>
              )}
              <DownloadDropdown content={rightJson} filename="json-diff-right" />
            </div>
          </div>
          <JsonEditor
            value={rightJson}
            onChange={handleRightChange}
            height="65vh"
            onValidationStatusChange={({ valid }) => setRightValid(valid)}
            diffHighlights={rightHighlights}
          />
        </div>
      </div>

      {/* Auto-save notice */}
      <div className="text-xs text-gray-500 text-center">
        💡 Tip: Press{" "}
        <kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd/Ctrl+V</kbd> to
        auto-save pasted JSON to history
      </div>

      {/* Detailed Differences Summary */}
      {diffResults && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">
              Differences Found:
            </h4>
            <Button variant="default" className="flex items-center gap-2" onClick={() => exportDifferencesToCSV(diffResults)}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
          {diffResults.length === 0 ? (
            <p className="text-green-600">
              No differences found - JSONs are identical!
            </p>
          ) : (
            <div className="space-y-4">
              {diffResults.map((diff, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        diff.type === "added"
                          ? "bg-green-100 text-green-800"
                          : diff.type === "removed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {diff.type}
                    </span>
                    <span className="font-mono text-gray-700 font-medium">
                      {diff.key}
                    </span>
                  </div>

                  {/* Diff Lines */}
                  <div className="font-mono text-sm">
                    {diff.type === "modified" && (
                      <>
                        {/* Removed line (red) */}
                        <div className="flex bg-red-50 border-l-4 border-red-400">
                          <div className="px-3 py-2 text-red-600 bg-red-100 border-r border-red-200 min-w-[4rem] text-center">
                            -{diff.leftLine}
                          </div>
                          <div className="flex-1 px-3 py-2 text-red-800">
                            <span className="text-red-600">-</span>{" "}
                            {diff.leftLineContent}
                          </div>
                        </div>
                        {/* Added line (green) */}
                        <div className="flex bg-green-50 border-l-4 border-green-400">
                          <div className="px-3 py-2 text-green-600 bg-green-100 border-r border-green-200 min-w-[4rem] text-center">
                            +{diff.rightLine}
                          </div>
                          <div className="flex-1 px-3 py-2 text-green-800">
                            <span className="text-green-600">+</span>{" "}
                            {diff.rightLineContent}
                          </div>
                        </div>
                      </>
                    )}

                    {diff.type === "added" && (
                      <div className="flex bg-green-50 border-l-4 border-green-400">
                        <div className="px-3 py-2 text-green-600 bg-green-100 border-r border-green-200 min-w-[4rem] text-center">
                          +{diff.line}
                        </div>
                        <div className="flex-1 px-3 py-2 text-green-800">
                          <span className="text-green-600">+</span>{" "}
                          {diff.rightLineContent}
                        </div>
                      </div>
                    )}

                    {diff.type === "removed" && (
                      <div className="flex bg-red-50 border-l-4 border-red-400">
                        <div className="px-3 py-2 text-red-600 bg-red-100 border-r border-red-200 min-w-[4rem] text-center">
                          -{diff.line}
                        </div>
                        <div className="flex-1 px-3 py-2 text-red-800">
                          <span className="text-red-600">-</span>{" "}
                          {diff.leftLineContent}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JsonDiff;
