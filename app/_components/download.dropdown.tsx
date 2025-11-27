"use client";

import React from "react";
import { Braces, Download, File, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { convertJsonToCsv } from "../_utils/utils";

interface DownloadDropdownProps {
  content: string;
  filename?: string;
  disabled?: boolean;
}

const DownloadDropdown = ({
  content,
  filename = "file",
  disabled = false,
}: DownloadDropdownProps) => {
  const handleDownloadJson = () => {
    if (!content.trim()) return;

    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    if (!content.trim()) return;

    try {
      const csv = convertJsonToCsv(content);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to convert JSON to CSV:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={window.innerWidth < 768 ? "sm" : "xs"} variant="outline" disabled={disabled || !content.trim()}>
          <Download className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownloadJson}><Braces className="w-4 h-4 text-muted-foreground" /> Download as JSON</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadCsv}><Table className="w-4 h-4 text-muted-foreground" /> Download as CSV</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadDropdown;
