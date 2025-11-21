"use client";

import React, { useState, useEffect, useCallback } from "react";
import JsonEditor from "../json.editor";
import JsonDiff from "../json-diff";
import ObjectConverter from "../object.converter";
import DownloadDropdown from "../download.dropdown";
import { Copy, Check, AlertCircle, History, Upload, Code } from "lucide-react";
import {
  getLatestJsonEntry,
  handlePasteEvent,
  JsonEntry,
} from "../../_utils/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { validateJson } from "../../_utils/validators";
import { useSwipeHandlers } from "../../_utils/mousefunctions";
import { BiLogoTypescript } from "react-icons/bi";

import {
  processJsonByTab,
  saveJson,
  handleFileUpload as handleFileUploadUtil,
  handleCopy as handleCopyUtil,
} from "./utils";
import ErrorCallout from "@/components/ui/error-callout";

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

  const tabs = [
    {
      id: "format",
      label: "Prettify",
      icon: "🎨",
      shortcut: ["alt", "⇧", "p"],
    },
    { id: "minify", label: "Minify", icon: "📦", shortcut: ["alt", "⇧", "m"] },
    { id: "diff", label: "Compare", icon: "🔍", shortcut: ["alt", "⇧", "c"] },
    {
      id: "object-convert",
      label: "JSON to Type",
      icon: <BiLogoTypescript className="text-[#007acc] w-6 h-6" />,
      shortcut: ["alt", "⇧", "o"],
    },
  ];

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
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
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

          <div className="hidden lg:flex gap-4">
            <div className="flex-1 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Input JSON
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={processJson}
                  disabled={!validationResult.valid}
                >
                  {activeTab === "format" && "Format JSON"}
                  {activeTab === "minify" && "Minify JSON"}
                </Button>
                <Button
                  onClick={saveCurrentJson}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!validationResult.valid}
                >
                  <History className="w-4 h-4" />
                  Save
                </Button>
                <label className="flex items-center text-sm gap-2 px-3 py-2 h-9 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="w-3 h-3" />
                  Upload File
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

            <div className="flex-1 flex items-center justify-between">
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
          </div>

          <div className="hidden lg:flex gap-4 flex-1 min-h-0">
            <div className="flex-1">
              <JsonEditor
                value={inputJson}
                onChange={handleInputChange}
                height="75vh"
                onValidationStatusChange={setValidationResult}
              />
            </div>

            <div className="flex-1">
              {outputJson ? (
                <JsonEditor
                  value={outputJson}
                  readOnly={true}
                  height="75vh"
                  onChange={() => {}}
                />
              ) : (
                <div className="h-full bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">
                    {activeTab === "format"
                      ? "Formatted JSON will appear here"
                      : "Minified JSON will appear here"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            className="lg:hidden relative overflow-hidden"
            {...swipeHandlers}
          >
            <div
              className={`transition-transform duration-300 ease-in-out ${
                currentView === "input" ? "translate-x-0" : "-translate-x-full"
              }`}
            >
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
                    <History className="w-4 h-4" />
                  </Button>
                  <label className="flex items-center text-sm gap-2 px-2 py-1 h-9 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-3 h-3" />
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
