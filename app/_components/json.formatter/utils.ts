import { formatJson, minifyJson } from "../../_utils/jsonProcessors";
import { validateJson } from "../../_utils/validators";
import { JsonEntry, saveJsonEntry } from "../../_utils/utils";
import { toast } from "sonner";

export const processJsonByTab = (
  inputJson: string,
  activeTab: JsonEntry["type"]
): { output: string; validation: { valid: boolean; error: string | null } } => {
  const validation = validateJson(inputJson);
  
  if (!validation.valid) {
    return { output: "", validation };
  }

  try {
    let output = "";
    switch (activeTab) {
      case "format":
        output = formatJson({ jsonString: inputJson, indent: 2 });
        break;
      case "minify":
        output = minifyJson(inputJson);
        break;
      default:
        output = "";
    }
    return { output, validation: { valid: true, error: null } };
  } catch (error: any) {
    return { output: "", validation: { valid: false, error: error.message } };
  }
};

export const saveJson = (
  inputJson: string,
  activeTab: JsonEntry["type"],
  tab_id: string
): void => {
  if (!inputJson.trim()) return;

  const validation = validateJson(inputJson);
  if (!validation.valid) {
    toast.error("Cannot save invalid JSON");
    return;
  }

  try {
    saveJsonEntry(inputJson, activeTab, tab_id);
    toast.success("Saved to history!");
  } catch (error) {
    toast.error("Cannot save invalid JSON");
  }
};

export const handleFileUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  setInputJson: (value: string) => void,
  tab_id: string
): void => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const content = e.target?.result || "";
    setInputJson(content);
    if (content.trim()) {
      try {
        JSON.parse(content);
        saveJsonEntry(content, "format", tab_id, `Uploaded: ${file.name}`);
      } catch (error) {
        // Silent fail - don't save invalid JSON
      }
    }
  };
  reader.readAsText(file);
};

export const handleCopy = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
    return true;
  } catch (error: any) {
    console.error("Copy failed:", error);
    toast.error("Copy failed!");
    return false;
  }
};


