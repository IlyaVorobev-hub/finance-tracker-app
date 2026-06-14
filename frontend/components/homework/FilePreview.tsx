"use client";

import {
  FileText,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HomeworkFile } from "@/types/homework";

interface FilePreviewProps {
  file: HomeworkFile;
  className?: string;
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return FileText;
  if (type.includes("image") || type.includes("jpg") || type.includes("jpeg") || type.includes("png"))
    return FileImage;
  if (type.includes("sheet") || type.includes("csv") || type.includes("excel"))
    return FileSpreadsheet;
  return FileIcon;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function FilePreview({ file, className }: FilePreviewProps) {
  const Icon = getFileIcon(file.file_type);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent/50",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file_size)}
        </p>
      </div>
      <Button variant="ghost" size="icon" asChild>
        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
          <Download className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
