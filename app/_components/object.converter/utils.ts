import { convertObjectToJson, convertJsonToObject } from "../../_utils/jsonProcessors";
import { validateJson, validateObject } from "../../_utils/validators";
import { JsonEntry, saveJsonEntry } from "../../_utils/utils";
import { toast } from "sonner";

export type ConversionDirection = "type-to-json" | "json-to-type";

export const handleConvertType = (
  inputContent: string,
  direction: ConversionDirection
): { output: string; validation: { valid: boolean; error: string | null } } => {
  try {
    if (direction === "type-to-json") {
      const validation = validateObject(inputContent);
      if (!validation.valid) {
        return { output: "", validation };
      }
      const json = convertObjectToJson(inputContent);
      return { output: json, validation: { valid: true, error: null } };
    } else {
      const validation = validateJson(inputContent);
      if (!validation.valid) {
        return { output: "", validation };
      }
      const object = convertJsonToObject(inputContent);
      return { output: object, validation: { valid: true, error: null } };
    }
  } catch (error: any) {
    return { output: "", validation: { valid: false, error: error.message } };
  }
};

export function convertJsonToTsType(inputContent: any, indent = 0): string {
  const pad = (n: number) => "  ".repeat(n);

  if (inputContent === null) return "null";

  const typeOf = typeof inputContent;

  // Primitives
  if (typeOf === "string") return "string";
  if (typeOf === "number") return "number";
  if (typeOf === "boolean") return "boolean";

  // Arrays
  if (Array.isArray(inputContent)) {
    if (inputContent.length === 0) return "any[]";
    let typeArray = inputContent.map((item: any) => typeof item);

    if (typeArray.every((type: string) => type === "string")) return "string[]";
    if (typeArray.every((type: string) => type === "number")) return "number[]";
    if (typeArray.every((type: string) => type === "boolean")) return "boolean[]";
    // if (typeArray.every((type: string) => type === "object")) return "object[]";
    if (typeArray.every((type: string) => type === "array")) return "array[]";
    if (typeArray.every((type: string) => type === "null")) return "null[]";
    if (typeArray.every((type: string) => type === "undefined")) return "undefined[]";
    if (typeArray.every((type: string) => type === "function")) return "function[]";

    return "any[]";
  }

  if (typeOf === "object") {
    const entries = Object.entries(inputContent)
      .map(([key, val]) => `${pad(indent + 1)}${key}: ${convertJsonToTsType(val, indent + 1)};`)
      .join("\n");

    return `{\n${entries}\n${pad(indent)}}`;
  }

  return "any";
}



export const validateContent = (
  content: string,
  direction: ConversionDirection
): { valid: boolean; error: string | null } => {
  if (direction === "json-to-type") {
    const validation = validateJson(content);
    return { valid: validation.valid, error: validation.error };
  } else {
    const validation = validateObject(content);
    return { valid: validation.valid, error: validation.error };
  }
};

export const saveConverstionContent = (
  inputContent: string,
  direction: "type-to-json" | "json-to-type",
  tab_id: string
): void => {
  if (!inputContent.trim()) return;

  try {
    if (direction === "json-to-type") {
      const validation = validateJson(inputContent);
      if (!validation.valid) {
        toast.error("Cannot save invalid JSON");
        return;
      }
    } else {
      const validation = validateObject(inputContent);
      if (!validation.valid) {
        toast.error("Cannot save invalid object");
        return;
      }
    }

    saveJsonEntry(inputContent, "object-convert", tab_id);
    toast.success("Saved to history!");
  } catch (error) {
    toast.error("Cannot save invalid content");
  }
};







// export function convertTsTypeToJson(typeStr: string): any {
//   typeStr = typeStr.trim();

//   if (typeStr === "string") return "string";
//   if (typeStr === "number") return 0;
//   if (typeStr === "boolean") return false;
//   if (typeStr === "null") return null;
//   if (typeStr === "any") return null;


//   if (typeStr.endsWith("[]")) {
//     const inner = typeStr.slice(0, -2).trim();
//     return [convertTsTypeToJson(inner)];
//   }

//   // Objects { a: string; b: number }
//   if (typeStr.startsWith("{")) {
//     const obj: any = {};
//     const body = typeStr.slice(1, -1).trim();

//     // split by semicolons NOT inside nested braces
//     const parts = splitObjectParts(body);

//     for (let part of parts) {
//       if (!part.trim()) continue;

//       const [key, rawType] = part.split(":").map(x => x.trim());
//       obj[key] = convertTsTypeToJson(rawType?.replace(/;$/, "") || "");
//     }

//     return obj;
//   }

//   return null;
// }

// // Utility: split object fields but respect nested braces
// function splitObjectParts(str: string): string[] {
//   let depth = 0;
//   let start = 0;
//   const parts: string[] = [];

//   for (let i = 0; i < str.length; i++) {
//     const c = str[i];
//     if (c === "{") depth++;
//     if (c === "}") depth--;

//     if (c === ";" && depth === 0) {
//       parts.push(str.slice(start, i));
//       start = i + 1;
//     }
//   }

//   if (start < str.length) {
//     parts.push(str.slice(start));
//   }

//   return parts;
// }
