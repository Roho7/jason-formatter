"use client";

import React, { useState, useEffect, useCallback } from "react";
import JsonEditor from "../json.editor";
import JsonDiff from "../json-diff";
import ObjectConverter from "../object.converter";
import DownloadDropdown from "../download.dropdown";

import { 
  Copy, 
  Check, 
  AlertCircle, 
  History, 
  Upload, 
  Code, 
  Save, 
  Workflow, 
  PanelLeft, 
  PanelRight,
  Maximize2,
  Minimize2,
  Forward,
  ArrowRightFromLine
} from "lucide-react";
import {
  getLatestJsonEntry,
  handlePasteEvent,
  JsonEntry,
} from "../../_utils/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewSwitcher } from "@/components/view-switcher";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { validateJson } from "../../_utils/validators";
import { useSwipeHandlers } from "../../_utils/mousefunctions";
import { cn } from "@/lib/utils";

import {
  processJsonByTab,
  saveJson,
  handleFileUpload as handleFileUploadUtil,
  handleCopy as handleCopyUtil,
} from "./utils";
import ErrorCallout from "@/components/ui/error-callout";
import { editorTabs } from "@/app/_utils/nav";
import MobileEditorTabs from "@/components/ui/mobile-editor-tabs";
import JsonTreeView from "@/components/json-tree-view";

const tips = [
  {
    id: "auto-save",
    body: (
      <div className="text-xs text-gray-500 text-center">
        💡 Tip: Press <Kbd>Cmd/Ctrl</Kbd> + <Kbd>V</Kbd> to auto-save pasted
        JSON to history
      </div>
    ),
  },
  {
    id: "switch-tabs",
    body: (
      <div className="text-xs text-gray-500 text-center">
        💡 Tip: Press <Kbd>Alt/Option</Kbd> + <Kbd>⇧</Kbd> + <Kbd>→ / ←</Kbd> to
        switch tabs
      </div>
    ),
  },
];

const JsonFormatter = ({
  tab_id,
  activeTab,
  setActiveTab,
}: {
  tab_id?: string;
  activeTab: JsonEntry["type"];
  setActiveTab: (tab: JsonEntry["type"]) => void;
}) => {
  const [inputJson, setInputJson] = useState(
    '{\n  "name": "Jason Derulo",\n  "age": 30,\n  "email": "jason@derulo.com",\n  "hobbies": ["😎", "rizz", "gooning"],\n  "address": {\n    "street": "Yo mama house",\n    "city": "New York",\n    "zipCode": "80085"\n  }\n}',
  );
  const [outputJson, setOutputJson] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error: string | null;
  }>({
    valid: true,
    error: null,
  });
  const [currentView, setCurrentView] = useState<"input" | "output">("input");
  
  // View Modes
  const [inputViewMode, setInputViewMode] = useState<"code" | "tree">("code");
  const [outputViewMode, setOutputViewMode] = useState<"code" | "tree">("code");

  // Layout Expansion
  const [expandedSide, setExpandedSide] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const latestEntry = getLatestJsonEntry("format", tab_id || "");
      if (latestEntry && latestEntry.content.trim()) {
        setInputJson(latestEntry.content);
      } else {
        setInputJson(
          '{\n  "name": "Jason Derulo",\n  "age": 30,\n  "email": "jason@derulo.com",\n  "hobbies": ["😎", "🫡", "🫠"],\n  "address": {\n    "street": "Florida Keys",\n    "city": "Miami",\n    "zipCode": "33139"\n  }\n}',
        );
      }
    }
  }, [tab_id]);

  useEffect(() => {
    if (tab_id) {
      handlePasteEvent(inputJson, "format", tab_id, () => {});
    }
  }, [inputJson, tab_id]);

  const handleInputChange = (value: string) => {
    setInputJson(value);
    const validation = validateJson(value);
    setValidationResult(validation);
  };

  const processJson = useCallback(() => {
    if (activeTab.startsWith("diff")) {
      const validation = validateJson(inputJson);
      setValidationResult(validation);
      setOutputJson("");
      return;
    }
    const result = processJsonByTab(inputJson, activeTab);
    setOutputJson(result.output);
    setValidationResult(result.validation);
    setCurrentView("output");
  }, [inputJson, activeTab]);

  const saveCurrentJson = useCallback(() => {
    saveJson(inputJson, activeTab, tab_id || "");
  }, [inputJson, activeTab, tab_id]);

  const handleCopy = async () => await handleCopyUtil(outputJson);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUploadUtil(event, setInputJson, tab_id || "");
  };

  const handleTabChange = (tabId: JsonEntry["type"]) => {
    setActiveTab(tabId);
    setOutputJson("");
    setValidationResult({ valid: true, error: null });
  };

  const toggleExpand = (side: "left" | "right") => {
    setExpandedSide(current => current === side ? null : side);
  };

  const swipeHandlers = useSwipeHandlers({
    currentView,
    setCurrentView,
    leftView: "input",
    rightView: "output",
  });

  useHotkeys("alt+shift+p", () => handleTabChange("format"));
  useHotkeys("alt+shift+m", () => handleTabChange("minify"));
  useHotkeys("alt+shift+c", () => handleTabChange("diff" as JsonEntry["type"]));
  useHotkeys("alt+shift+o", () =>
    handleTabChange("object-convert" as JsonEntry["type"]),
  );
  useHotkeys("cmd+enter", () => processJson());

  const getTitle = () => {
    if (activeTab === "format") return "JASON THE BEAUTIFUL";
    if (activeTab === "minify") return "JASON SHORT";
    if (activeTab.startsWith("diff")) return "STATHAM VS DERULO";
    return "JASON TYPE SHI";
  };

  return (
    <div className="space-y-4 flex flex-col h-full relative">
      <div className="flex justify-between pb-4 border-b border-border items-center">
        <div className="hidden lg:flex flex-wrap gap-2">
          {editorTabs.map((tab) => (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleTabChange(tab.id as JsonEntry["type"])}
                  active={activeTab === tab.id}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <KbdGroup>
                  {tab.shortcut.map((shortcut, index) => (
                    <span key={index}>
                      <Kbd>{shortcut}</Kbd>
                      {index < tab.shortcut.length - 1 && <span>+</span>}
                    </span>
                  ))}
                </KbdGroup>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
          <MobileEditorTabs activeTab={activeTab} handleTabChange={handleTabChange} />
        <h1 className="hidden sm:block text-xl text-gray-200 shdow-inner whitespace-nowrap">
          {getTitle()}
        </h1>
      </div>

      {activeTab === "object-convert" ? (
        <ObjectConverter tab_id={tab_id} />
      ) : activeTab.startsWith("diff") ? (
        <JsonDiff tab_id={tab_id || ""} />
      ) : (
        <>
          <ErrorCallout validationResult={validationResult} />

          <div className="lg:hidden flex justify-center mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("input")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "input"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Input JSON
              </button>
              <button
                onClick={() => setCurrentView("output")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "output"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {activeTab === "format" ? "Formatted" : "Minified"}
              </button>
            </div>
          </div>

          <div className="lg:hidden text-center text-sm text-gray-500 mb-4">
            👆 Tap to switch or swipe left/right to navigate between editors
          </div>

          <div className="hidden lg:flex gap-4 flex-1 min-h-0">
            {/* Left Side (Input) */}
            <div className={cn(
              "flex flex-col transition-all duration-300 ease-in-out min-w-0",
              expandedSide === "left" ? "flex-[4]" : expandedSide === "right" ? "flex-[1]" : "flex-1"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  
                  <ViewSwitcher 
                    value={inputViewMode} 
                    onValueChange={setInputViewMode} 
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleExpand("left")}
                  >
                    {expandedSide === "left" ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={processJson}
                    disabled={!validationResult.valid}
                    size="xs"
                  >
                    <ArrowRightFromLine />
                  </Button>
                  <Button
                    onClick={saveCurrentJson}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={!validationResult.valid}
                    size="xs"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <label className="flex items-center text-sm h-7 px-1.5 py-0.5 gap-0.5 has-[>svg]:px-1.5 text-[0.8rem] border border-border bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="size-4" />
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <DownloadDropdown content={inputJson} filename="json-input" />
                </div>
              </div>

              <div className="flex-1 border rounded-md overflow-hidden">
                 {inputViewMode === "code" ? (
                    <JsonEditor
                      value={inputJson}
                      onChange={handleInputChange}
                      height="75vh"
                      onValidationStatusChange={setValidationResult}
                    />
                 ) : (
                   <JsonTreeView 
                      data={inputJson} 
                      onChange={handleInputChange}
                      className="w-full h-full min-h-[75vh]"
                   />
                 )}
              </div>
            </div>

            {/* Right Side (Output) */}
            <div className={cn(
              "flex flex-col transition-all duration-300 ease-in-out min-w-0",
              expandedSide === "right" ? "flex-[4]" : expandedSide === "left" ? "flex-[1]" : "flex-1"
            )}>
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center justify-between w-full">
                   <div className="flex items-center gap-2">
                   
                     <ViewSwitcher
                      value={outputViewMode}
                      onValueChange={setOutputViewMode}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleExpand("right")}
                    >
                      {expandedSide === "right" ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                   </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {activeTab === "format" ? "Formatted" : "Minified"}
                    </h3>
                 </div>
                {outputJson && (
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCopy} size="sm" variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <DownloadDropdown
                      content={outputJson}
                      filename="json-output"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 border rounded-md overflow-hidden">
                {outputJson ? (
                  outputViewMode === "code" ? (
                    <JsonEditor
                      value={outputJson}
                      readOnly={true}
                      height="75vh"
                      onChange={() => {}}
                    />
                  ) : (
                    <JsonTreeView 
                      data={outputJson} 
                      readOnly={true}
                      className="w-full h-full min-h-[75vh]"
                    />
                  )
                ) : (
                  <div className="h-full bg-gray-50 flex items-center justify-center">
                    <span className="text-gray-500">
                      {activeTab === "format"
                        ? "Formatted JSON will appear here"
                        : "Minified JSON will appear here"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile View (unchanged mostly, but could potentially support tree view if requested, plan didn't explicitly require mobile support for tree view but good to have simple fallback) */}
          <div
            className="lg:hidden relative overflow-hidden"
            {...swipeHandlers}
          >
            <div
              className={`transition-transform duration-300 ease-in-out ${
                currentView === "input" ? "translate-x-0" : "-translate-x-full"
              }`}
            >
               {/* Mobile Input Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Input JSON
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={processJson}
                    disabled={!validationResult.valid}
                    size="sm"
                  >
                    {activeTab === "format" ? "Format" : "Minify"}
                  </Button>
                  <Button
                    onClick={saveCurrentJson}
                    variant="outline"
                    size="sm"
                    disabled={!validationResult.valid}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <label className="flex items-center text-sm h-8 px-1.5 py-0.5 gap-0.5 has-[>svg]:px-2 text-[0.8rem] border border-border bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="size-4" />
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <DownloadDropdown content={inputJson} filename="json-input" />
                </div>
              </div>
              <JsonEditor
                value={inputJson}
                onChange={handleInputChange}
                height="75vh"
                onValidationStatusChange={setValidationResult}
              />
            </div>

            <div
              className={`absolute top-0 left-0 w-full transition-transform duration-300 ease-in-out ${
                currentView === "output" ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {activeTab === "format" ? "Formatted JSON" : "Minified JSON"}
                </h3>
                {outputJson && (
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCopy} size="sm" variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <DownloadDropdown
                      content={outputJson}
                      filename="json-output"
                    />
                  </div>
                )}
              </div>
              {outputJson ? (
                <JsonEditor
                  value={outputJson}
                  readOnly={true}
                  height="75vh"
                  onChange={() => {}}
                />
              ) : (
                <div className="h-[75vh] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">
                    {activeTab === "format"
                      ? "Formatted JSON will appear here"
                      : "Minified JSON will appear here"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {tips[Math.floor(Math.random() * tips.length)].body}
        </>
      )}
    </div>
  );
};

export default JsonFormatter;
