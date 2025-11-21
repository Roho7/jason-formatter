import React from "react";

type Props = {
  validationResult: {
    valid: boolean;
    error: string | null;
  };
};

const ErrorCallout = ({ validationResult }: Props) => {
  return validationResult.valid ? null : (
    <div className="flex items-center gap-2 p-3 bg-red-700/50 backdrop-blur-xl rounded-lg absolute bottom-10 right-1/2 translate-x-1/2 z-[999] mix-blend-hard-light">
      <span className="text-red-200 font-medium text-sm">{validationResult.error || "Invalid JSON"}</span>
    </div>
  );
};

export default ErrorCallout;
