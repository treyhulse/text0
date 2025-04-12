"use client";

import { useCompletion } from "@ai-sdk/react";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function EditorPage() {
  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = React.useState(0);
  const [isEnabled, setIsEnabled] = React.useState(true);
  const { completion, input, setInput, handleSubmit, stop, setCompletion } =
    useCompletion({
      api: "/api/completion",
    });

  React.useEffect(() => {
    if (!isEnabled) {
      setCompletion("");
    }
  }, [isEnabled, setCompletion]);

  // Debounce input to trigger streaming
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isEnabled) {
        handleSubmit();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [handleSubmit, isEnabled]);

  // Update cursor position when input changes
  React.useEffect(() => {
    if (editorRef.current && cursorPosition === -1) {
      editorRef.current.selectionStart = editorRef.current.selectionEnd = input.length;
      setCursorPosition(input.length);
    }
  }, [input, cursorPosition]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" && completion) {
      e.preventDefault();
      const completionText = parseCompletion(completion, input);
      stop();
      setCompletion(""); // Immediately clear the completion
      const newText = input + completionText;
      setInput(newText);
      setCursorPosition(-1); // Special value to indicate we should move to end
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
    <div className="container mx-auto max-w-4xl mt-16 pt-7 pb-32">
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="autocompletion"
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
        <Label htmlFor="autocompletion">Enable Autocompletion</Label>
      </div>

      <h1>Autocompletion PoC</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="relative w-full h-96 border-2 border-gray-300 rounded-md">
          <textarea
            ref={editorRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-2 outline-none whitespace-pre-wrap font-mono bg-transparent z-10 relative text-white resize-none"
            style={{
              caretColor: "red",
            }}
          />
          {isEnabled && displayedCompletion && (
            <div
              aria-hidden="true"
              className="absolute font-mono pointer-events-none whitespace-pre-wrap p-2 top-0 left-0 right-0 bottom-0 text-white"
            >
              <span className="invisible">{input}</span>
              <span className="text-gray-400">{displayedCompletion}</span>
            </div>
          )}
        </div>
      </form>
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
