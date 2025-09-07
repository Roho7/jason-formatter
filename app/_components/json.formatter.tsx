import React, { useState, useCallback, useEffect } from "react";
import JsonEditor from "./json.editor";
import JsonDiff from "./json.diff";
import {
  Copy,
  Download,
  Upload,
  Check,
  AlertCircle,
  History,
} from "lucide-react";
import {
  formatJson,
  minifyJson,
  validateJson,
  saveJsonEntry,
  getLatestJsonEntry,
  handlePasteEvent,
  JsonEntry,
} from "../_utils/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const JsonFormatter = ({
  id,
  label,
  activeTab,
  setActiveTab,
}: {
  id: string;
  label: string;
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
  const [copySuccess, setCopySuccess] = useState(false);

  const tabs = [
    { id: "format", label: "Format & Prettify", icon: "🎨" },
    { id: "minify", label: "Minify", icon: "📦" },
    { id: "diff", label: "Compare", icon: "🔍" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const latestEntry = getLatestJsonEntry("format", id);
      if (latestEntry && latestEntry.content.trim()) {
        setInputJson(latestEntry.content);
      } else {
        setInputJson(
          '{\n  "name": "Jason Derulo",\n  "age": 30,\n  "email": "jason@derulo.com",\n  "hobbies": ["😎", "rizz", "gooning"],\n  "address": {\n    "street": "Yo mama house",\n    "city": "New York",\n    "zipCode": "80085"\n  }\n}',
        );
      }
    }
  }, [id]);

  useEffect(() => {
    const handleKeyDown = () => {
      handlePasteEvent(inputJson, "format", id, () => {});
    };

    handleKeyDown();
  }, [inputJson]);

  const handleFormat = useCallback(() => {
    try {
      const formatted = formatJson({ jsonString: inputJson, indent: 2 });
      setOutputJson(formatted);
      setValidationResult({ valid: true, error: null });
    } catch (error: any) {
      setValidationResult({ valid: false, error: error.message });
      setOutputJson("");
    }
  }, [inputJson]);

  const handleMinify = useCallback(() => {
    try {
      const minified = minifyJson({ jsonString: inputJson });
      setOutputJson(minified);
      setValidationResult({ valid: true, error: null });
    } catch (error: any) {
      setValidationResult({ valid: false, error: error.message });
      setOutputJson("");
    }
  }, [inputJson]);

  const handleValidate = useCallback(() => {
    const result = validateJson({ jsonString: inputJson });
    setValidationResult(result);
    setOutputJson("");
  }, [inputJson]);

  const handleTabChange = (tabId: JsonEntry["type"]) => {
    setActiveTab(tabId as JsonEntry["type"]);
    setOutputJson("");
    setValidationResult({ valid: true, error: null });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputJson);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error: any) {
      console.error("Copy failed:", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target?.result || "";
        setInputJson(content);
        // Auto-save uploaded files to history
        if (content.trim()) {
          try {
            JSON.parse(content); // Validate before saving
            saveJsonEntry(content, "format", id, `Uploaded: ${file.name}`);
          } catch (error) {
            // Don't save invalid JSON
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleInputChange = (value: string) => {
    setInputJson(value);
  };

  const processJson = () => {
    switch (true) {
      case activeTab === "format":
        handleFormat();
        break;
      case activeTab === "minify":
        handleMinify();
        break;
      case activeTab.startsWith("diff"):
        handleValidate();
        break;
      default:
        break;
    }
  };

  const saveCurrentJson = () => {
    if (inputJson.trim()) {
      try {
        const validation = validateJson({ jsonString: inputJson });
        if (validation.valid) {
          const parsed = JSON.parse(inputJson);
          saveJsonEntry(inputJson, activeTab as JsonEntry["type"], id);
          toast.success("Saved to history!");
        }
      } catch (error) {
        toast.error("Cannot save invalid JSON");
        console.error("Cannot save invalid JSON");
      }
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 pb-8 border-b border-muted-foreground">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as JsonEntry["type"])}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-accent text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Error Message */}
      {!validationResult.valid && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-sm">{validationResult.error}</span>
        </div>
      )}

      {activeTab.startsWith("diff") ? (
        <JsonDiff pageTab={{ id, label }} />
      ) : (
        <>
          <div className="flex gap-4">
            <div className="flex-1 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Input JSON
              </h3>
              {/* Process Button */}
              <div className="flex gap-2">
                <Button
                  onClick={processJson}
                  disabled={!validationResult.valid}
                >
                  {activeTab === "format" && "Format JSON"}
                  {activeTab === "minify" && "Minify JSON"}
                  {activeTab.startsWith("diff") && "Diff JSON"}
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
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between">
              <>
                <h3 className="text-lg font-semibold text-gray-800">
                  {activeTab === "format" ? "Formatted JSON" : "Minified JSON"}
                </h3>
                {outputJson && (
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCopy}>
                      {copySuccess ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copySuccess ? "Copied!" : "Copy"}
                    </Button>
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                )}
              </>
            </div>
          </div>

          {/* Main Content - Side by Side */}
          <div className="flex gap-4 flex-1 min-h-0">
            {/* Input JSON Editor */}
            <div className="flex-1">
              <JsonEditor
                value={inputJson}
                onChange={handleInputChange}
                height="100vh"
                onValidationStatusChange={(status: any) =>
                  setValidationResult(status)
                }
              />
            </div>

            {/* Output Section */}
            <div className="flex-1">
              {outputJson ? (
                <JsonEditor
                  value={outputJson}
                  readOnly={true}
                  height="100vh"
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

          {/* Auto-save notice */}
          <div className="text-xs text-gray-500 text-center">
            💡 Tip: Press{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">Cmd/Ctrl+V</kbd> to
            auto-save pasted JSON to history
          </div>
        </>
      )}
    </div>
  );
};

export default JsonFormatter;
