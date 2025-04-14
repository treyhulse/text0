"use client";

import { useCompletion } from "@ai-sdk/react";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UploadDropzone } from "@/lib/uploadthing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { ModelSelector } from "./model-selector";
import { useModel } from "@/hooks/use-model";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function WritingPage() {
  const [model] = useModel();
  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [isEnabled, setIsEnabled] = React.useState(true);
  const { state, toggleSidebar } = useSidebar();
  const { completion, input, setInput, handleSubmit, stop, setCompletion } =
    useCompletion({
      api: `/api/completion?model=${model}`,
    });

  const router = useRouter();

  React.useEffect(() => {
    if (!isEnabled) {
      setCompletion("");
    }
  }, [isEnabled, setCompletion]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isEnabled) {
        handleSubmit();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [handleSubmit, isEnabled]);

  React.useEffect(() => {
    if (editorRef.current && cursorPosition === -1) {
      editorRef.current.selectionStart = editorRef.current.selectionEnd =
        input.length;
      setCursorPosition(input.length);
    }
  }, [input, cursorPosition]);

  // Handle zen mode toggle with keyboard shortcut
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toggleSidebar]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" && completion) {
      e.preventDefault();
      const completionText = parseCompletion(completion, input);
      stop();
      setCompletion("");
      const newText = input + completionText;
      setInput(newText);
      setCursorPosition(-1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      stop();
      setCompletion("");
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    stop();
    setInput(newText);
    setCursorPosition(e.target.selectionStart);
  };

  const displayedCompletion = parseCompletion(completion, input);

  return (
    <div className="relative w-full h-full bg-background">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-center z-10">
        <div className="flex items-center space-x-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2">
            <Switch
              id="autocompletion"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <Label htmlFor="autocompletion">Enable AI</Label>
          </div>
          <ModelSelector />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={toggleSidebar}
          >
            <Maximize2 className="h-4 w-4" />
            <span>Zen Mode</span>
            <kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-mono text-[0.625rem] font-medium ml-2">
              ⌘Z
            </kbd>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent title="Upload Files" className="sm:max-w-md">
              <DialogHeader>
                <h3 className="text-lg font-semibold">Upload Files</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your files using drag & drop or file selection
                </p>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 grid gap-1.5">
                    <div className="text-sm font-medium">Supported formats</div>
                    <div className="text-xs text-muted-foreground">
                      CSV, TXT, PDF, DOCX, XLSX, PPTX (Max 16MB)
                    </div>
                  </div>
                </div>
                <Separator />
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <UploadDropzone
                    endpoint="documentUploader"
                    onClientUploadComplete={() => {
                      toast.success("File uploaded successfully");
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(`ERROR! ${error.message}`);
                    }}
                    className="ut-upload-dropzone:bg-muted ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:transition-colors ut-allowed-content:text-muted-foreground/80 ut-label:text-foreground/80 ut-upload-icon:text-muted-foreground/50"
                    appearance={{
                      container:
                        "flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 transition-colors hover:border-muted-foreground/50",
                      label:
                        "flex flex-col items-center justify-center gap-2 text-sm font-medium",
                      allowedContent: "text-xs mt-4",
                      button: ({ ready }) => ({
                        backgroundColor: ready
                          ? "var(--primary)"
                          : "var(--muted)",
                        color: ready
                          ? "var(--primary-foreground)"
                          : "var(--muted-foreground)",
                        transition: "background-color 150ms ease",
                      }),
                    }}
                    content={{
                      label: ({ ready, isUploading }) => (
                        <>
                          <Upload
                            className={cn(
                              "h-10 w-10",
                              isUploading ? "animate-pulse" : "animate-bounce"
                            )}
                          />
                          <span className="text-base">
                            {isUploading
                              ? "Uploading..."
                              : ready
                              ? "Drop your files here or click to browse"
                              : "Getting ready..."}
                          </span>
                        </>
                      ),
                      allowedContent: ({ ready, fileTypes }) =>
                        ready ? (
                          <span>Supported formats: {fileTypes.join(", ")}</span>
                        ) : null,
                      button: ({ ready }) => (
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          {ready ? "Select Files" : "Preparing..."}
                        </span>
                      ),
                    }}
                  />
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex h-full justify-center py-4">
        <div
          className={cn(
            "w-full max-w-4xl h-full pt-18 px-8",
            state === "collapsed" && "px-16"
          )}
        >
          <textarea
            ref={editorRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Start writing..."
            className="w-full h-full outline-none whitespace-pre-wrap font-serif text-lg bg-transparent resize-none placeholder:text-muted-foreground/50"
            style={{
              caretColor: "var(--primary)",
            }}
          />
          {isEnabled && displayedCompletion && (
            <div
              aria-hidden="true"
              className="absolute font-serif text-lg pointer-events-none whitespace-pre-wrap px-8 top-22 left-1/2 -translate-x-1/2 w-full max-w-4xl"
            >
              <span className="invisible">{input}</span>
              <span className="text-muted-foreground/50">
                {displayedCompletion}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function parseCompletion(completion: string | undefined, input: string) {
  if (!completion) return "";
  const startTag = "<completion>";
  const endTag = "</completion>";
  if (completion.startsWith(startTag) && completion.includes(endTag)) {
    const startIndex = startTag.length;
    const endIndex = completion.indexOf(endTag);
    let result = completion.substring(startIndex, endIndex);
    if (input.endsWith(" ") && result.startsWith(" ")) {
      result = result.trimStart();
    }
    return result;
  }
  return "";
}
