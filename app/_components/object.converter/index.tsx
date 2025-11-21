"use client";

import React, { useState, useEffect, useCallback } from "react";
import JsonEditor from "../json.editor";
import { ArrowLeftRight, History, Save } from "lucide-react";
import { getLatestJsonEntry, handlePasteEvent } from "../../_utils/utils";
import { Button } from "@/components/ui/button";
import DownloadDropdown from "../download.dropdown";
import { useSwipeHandlers } from "../../_utils/mousefunctions";
import {
  validateContent,
  saveConverstionContent,
  handleConvertType,
  ConversionDirection,
  convertJsonToTsType,
} from "./utils";
import ErrorCallout from "@/components/ui/error-callout";

const ObjectConverter = ({ tab_id }: { tab_id?: string }) => {
  const [inputContent, setInputContent] = useState(
    '{\n  name: "Jason Derulo",\n  age: 30,\n  email: "jason@derulo.com"\n}',
  );
  const [outputContent, setOutputContent] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error: string | null;
  }>({
    valid: true,
    error: null,
  });
  const [currentView, setCurrentView] = useState<"input" | "output">("input");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const latestEntry = getLatestJsonEntry("object-convert", tab_id || "");
      if (latestEntry && latestEntry.content.trim()) {
        setInputContent(latestEntry.content);
      }
    }
  }, [tab_id]);

  useEffect(() => {
    if (tab_id) {
      handlePasteEvent(inputContent, "object-convert", tab_id, () => {});
    }
  }, [inputContent, tab_id]);

  const handleInputChange = (value: string) => {
    setInputContent(value);
    const validation = validateContent(value, "json-to-type");
    setValidationResult(validation);
  };

  const handleConvert = useCallback(() => {
    // const result = handleConvertType(inputContent, conversionDirection);
    const result = convertJsonToTsType(JSON.parse(inputContent));
    setOutputContent(result);
    setValidationResult({ valid: true, error: null });
  }, [inputContent]);

  const saveCurrentContent = useCallback(() => {
    saveConverstionContent(inputContent, "json-to-type", tab_id || "");
  }, [inputContent, tab_id]);

  return (
    <div className="space-y-4 flex flex-col h-full relative">
      <ErrorCallout validationResult={validationResult} />

      <div className="hidden lg:flex gap-4">
        <div className="flex-1 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">JSON</h3>
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={!validationResult.valid}>
              Convert
            </Button>
            <Button
              onClick={saveCurrentContent}
              variant="outline"
              className="flex items-center gap-2"
              disabled={!validationResult.valid}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
            <DownloadDropdown content={inputContent} filename="object-input" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Typescript Type
          </h3>
          {outputContent && (
            <DownloadDropdown
              content={outputContent}
              filename="converted-output"
            />
          )}
        </div>
      </div>

      <div className="hidden lg:flex gap-4 flex-1 min-h-0">
        <div className="flex-1">
          <JsonEditor
            value={inputContent}
            onChange={handleInputChange}
            height="86vh"
            language="json"
            onValidationStatusChange={(status: any) =>
              setValidationResult(status)
            }
          />
        </div>

        <div className="flex-1">
          {outputContent ? (
            <JsonEditor
              value={outputContent}
              readOnly={true}
              height="86vh"
              onChange={() => {}}
              language="xml"
            />
          ) : (
            <div className="h-full bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">
                Typescript type will appear here
              </span>
            </div>
          )}
        </div>
      </div>

      <MobileView
        currentView={currentView}
        setCurrentView={setCurrentView}
        handleConvert={handleConvert}
        saveCurrentContent={saveCurrentContent}
        validationResult={validationResult}
        setValidationResult={setValidationResult}
        inputContent={inputContent}
        outputContent={outputContent}
        handleInputChange={handleInputChange}
      />

      <div className="text-xs text-gray-500 text-center">
        💡 Tip: Press{" "}
        <kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd/Ctrl+V</kbd> to
        auto-save pasted content to history
      </div>
    </div>
  );
};

const MobileView = ({
  currentView,
  setCurrentView,
  handleConvert,
  saveCurrentContent,
  validationResult,
  setValidationResult,
  inputContent,
  outputContent,
  handleInputChange,
}: {
  currentView: "input" | "output";
  setCurrentView: (view: "input" | "output") => void;
  handleConvert: () => void;
  saveCurrentContent: () => void;
  validationResult: { valid: boolean; error: string | null };
  setValidationResult: (validation: {
    valid: boolean;
    error: string | null;
  }) => void;
  inputContent: string;
  outputContent: string;
  handleInputChange: (value: string) => void;
}) => {
  const swipeHandlers = useSwipeHandlers({
    currentView,
    setCurrentView,
    leftView: "input",
    rightView: "output",
  });
  return (
    <>
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
            JSON
          </button>
          <button
            onClick={() => setCurrentView("output")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === "output"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Type
          </button>
        </div>
      </div>

      <div className="lg:hidden text-center text-sm text-gray-500 mb-4">
        👆 Tap to switch or swipe left/right to navigate between editors
      </div>

      <div className="lg:hidden relative overflow-hidden" {...swipeHandlers}>
        <div
          className={`transition-transform duration-300 ease-in-out ${
            currentView === "input" ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">JSON</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleConvert}
                disabled={!validationResult.valid}
                size="sm"
              >
                Convert
              </Button>
              <Button
                onClick={saveCurrentContent}
                variant="outline"
                size="sm"
                disabled={!validationResult.valid}
              >
                <Save className="w-4 h-4" />
              </Button>
              <DownloadDropdown
                content={inputContent}
                filename="object-input"
              />
            </div>
          </div>
          <JsonEditor
            value={inputContent}
            onChange={handleInputChange}
            height="75vh"
            onValidationStatusChange={(status: any) =>
              setValidationResult(status)
            }
          />
        </div>

        <div
          className={`absolute top-0 left-0 w-full transition-transform duration-300 ease-in-out ${
            currentView === "output" ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Typescript type
            </h3>
          </div>
          {outputContent ? (
            <JsonEditor
              value={outputContent}
              readOnly={true}
              height="75vh"
              onChange={() => {}}
              language="json"
            />
          ) : (
            <div className="h-[75vh] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">
                Typescript type will appear here
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ObjectConverter;
