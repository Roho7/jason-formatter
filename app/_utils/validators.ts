export interface ValidationResult {
  valid: boolean;
  error: string | null;
  formattedJson?: string | null;
}

export const validateJson = (jsonString: string): ValidationResult => {
  try {
    if (!jsonString.trim()) {
      return { valid: false, error: "JSON cannot be empty", formattedJson: null };
    }
    const parsed = JSON.parse(jsonString);
    return { valid: true, error: null, formattedJson: JSON.stringify(parsed, null, 2) };
  } catch (error: any) {
    return { valid: false, error: error.message, formattedJson: null };
  }
};

export const validateObject = (objectString: string): ValidationResult => {
  try {
    const cleaned = objectString.trim();
    if (!cleaned) {
      return { valid: false, error: "Object cannot be empty", formattedJson: null };
    }

    const evaluated = eval(`(${cleaned})`);
    return { valid: true, error: null, formattedJson: JSON.stringify(evaluated, null, 2) };
  } catch (error: any) {
    return { valid: false, error: error.message, formattedJson: null };
  }
};
