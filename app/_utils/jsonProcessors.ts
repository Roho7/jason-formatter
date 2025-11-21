import { validateJson, validateObject } from "./validators";

export interface FormatJsonParams {
  jsonString: string;
  indent?: number;
}

export const formatJson = ({ jsonString, indent = 2 }: FormatJsonParams): string => {
  const validation = validateJson(jsonString);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid JSON");
  }
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed, null, indent);
};

export const minifyJson = (jsonString: string): string => {
  const validation = validateJson(jsonString);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid JSON");
  }
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed);
};

export const convertObjectToJson = (objectString: string): string => {
  const validation = validateObject(objectString);
  if (!validation.valid) {
    throw new Error(validation.error || "Failed to convert object to JSON");
  }
  if (!validation.formattedJson) {
    throw new Error("Failed to convert object to JSON");
  }
  return validation.formattedJson;
};

export const convertJsonToObject = (jsonString: string): string => {
  const validation = validateJson(jsonString);
  if (!validation.valid) {
    throw new Error(validation.error || "Failed to convert JSON to object");
  }

  const parsed = JSON.parse(jsonString);

  const isValidIdentifier = (key: string): boolean => {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
  };

  const formatValue = (value: any, indent: number = 0): string => {
    const spaces = "  ".repeat(indent);

    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
    if (typeof value === "number" || typeof value === "boolean") return String(value);

    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      const items = value.map((item) => `${spaces}  ${formatValue(item, indent + 1)}`).join(",\n");
      return `[\n${items}\n${spaces}]`;
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length === 0) return "{}";
      const items = keys
        .map((key) => {
          const formattedValue = formatValue(value[key], indent + 1);
          const formattedKey = isValidIdentifier(key) ? key : `"${key}"`;
          return `${spaces}  ${formattedKey}: ${formattedValue}`;
        })
        .join(",\n");
      return `{\n${items}\n${spaces}}`;
    }

    return String(value);
  };

  return formatValue(parsed);
};

export const parseJsonSafely = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error: any) {
    return null;
  }
};

export const deepEqual = (obj1: any, obj2: any) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};


