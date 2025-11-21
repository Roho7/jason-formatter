export interface DiffResult {
  key: string;
  type: "added" | "removed" | "modified";
  value?: any;
  oldValue?: any;
  newValue?: any;
  line?: number;
  leftLine?: number;
  rightLine?: number;
  side?: "left" | "right";
  leftLineContent?: string;
  rightLineContent?: string;
}

export const exportDifferencesToCSV = (diffResults: DiffResult[]) => {
  if (!diffResults || diffResults.length === 0) {
    alert("No differences to export");
    return;
  }

  const headers = [
    "line_number",
    "left_key",
    "right_key",
    "left_value",
    "right_value",
  ];

  const rows = diffResults.map((diff) => {
    let lineNumber = "";
    let leftKey = "";
    let rightKey = "";
    let leftValue = "";
    let rightValue = "";

    if (diff.type === "modified") {
      lineNumber =
        diff.leftLine?.toString() || diff.rightLine?.toString() || "";
      leftKey = diff.key;
      rightKey = diff.key;
      leftValue = JSON.stringify(diff.oldValue);
      rightValue = JSON.stringify(diff.newValue);
    } else if (diff.type === "removed") {
      lineNumber = diff.line?.toString() || "";
      leftKey = diff.key;
      rightKey = "";
      leftValue = JSON.stringify(diff.value);
      rightValue = "";
    } else if (diff.type === "added") {
      lineNumber = diff.line?.toString() || "";
      leftKey = "";
      rightKey = diff.key;
      leftValue = "";
      rightValue = JSON.stringify(diff.value);
    }

    const escapeCsvValue = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    return [
      lineNumber,
      escapeCsvValue(leftKey),
      escapeCsvValue(rightKey),
      escapeCsvValue(leftValue),
      escapeCsvValue(rightValue),
    ].join(",");
  }); // Combine headers and
  const csvContent = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `json-diff-${new Date().toISOString().slice(0, 10)}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
