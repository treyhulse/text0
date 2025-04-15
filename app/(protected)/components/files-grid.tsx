"use client";

import type { Document, Reference } from "@/lib/redis";
import { useState } from "react";
import { FileCard } from "./file-card";

interface FilesGridProps {
  files: (Document | Reference)[];
  type: "document" | "reference";
}

export function FilesGrid({ files, type }: FilesGridProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const toggleFile = (id: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFiles(newSelected);
  };

  return (
    <div className="grid gap-2">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          type={type}
          isSelected={selectedFiles.has(file.id)}
          onSelect={(selected) => toggleFile(file.id)}
        />
      ))}
    </div>
  );
}
