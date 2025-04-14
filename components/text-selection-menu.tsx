import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  MessageSquare,
  Sparkles,
  Check,
  ArrowRight,
  Minimize2,
  Maximize2,
  Languages,
  Volume2,
} from "lucide-react";
import { useCompletion } from "@ai-sdk/react";

interface TextSelectionMenuProps {
  selectedText: string;
  model: string;
  onPendingUpdate: (update: string | null) => void;
  onOpenChange?: (open: boolean) => void;
}

export function TextSelectionMenu({
  selectedText,
  model,
  onPendingUpdate,
  onOpenChange,
}: Readonly<TextSelectionMenuProps>) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Get scroll position
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Position the menu above the selection
        setPosition({
          top: rect.top + scrollY - 10, // 10px above selection
          left: rect.left + scrollX + rect.width / 2, // Centered horizontally
        });
      }
    };

    updatePosition();

    // Update position when window is resized
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  const { complete, isLoading } = useCompletion({
    api: "/api/text-modification",
    body: {
      model: model,
    },
    onResponse: (response) => {
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(response.statusText);
      }
    },
    onFinish: (prompt, completion) => {
      // Only update when we have the complete response
      onPendingUpdate(completion.trim());
    },
    onError: (error) => {
      console.error("Error modifying text:", error);
      onPendingUpdate(null);
    },
  });

  const handleModification = async (instruction: string) => {
    try {
      // Reset any previous completion
      onPendingUpdate(null);
      // Send the instruction and text as the prompt
      await complete(`${instruction}:\n\n${selectedText}`);
    } catch (error) {
      console.error("Error in text modification:", error);
      onPendingUpdate(null);
    }
  };

  // Optional: Show loading state while processing
  useEffect(() => {
    if (isLoading) {
      // You could show a loading indicator here if needed
      console.log("Processing text modification...");
    }
  }, [isLoading]);

  return (
    <div
      className="fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -100%)", // Center horizontally and position above
      }}
    >
      <DropdownMenu modal={false} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white dark:bg-gray-900 shadow-lg rounded-lg flex items-center gap-2 h-9 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Wand2 className="w-4 h-4" />
            <span className="text-sm">Ask AI what to do next...</span>
            <ArrowRight className="w-4 h-4 ml-2 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="w-64 p-2 bg-white dark:bg-gray-900 shadow-xl rounded-xl border-gray-200"
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            EDIT OR REVIEW SELECTION
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              handleModification(
                "Enhance this text while preserving its core message. Focus on clarity, conciseness, and professional tone. Make it more engaging and impactful"
              )
            }
            className="gap-2 rounded-md cursor-pointer px-2 py-1.5 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Improve writing</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleModification(
                "Fix any grammatical errors, spelling mistakes, and punctuation issues. Ensure proper sentence structure and formatting while maintaining the original style"
              )
            }
            className="gap-2 rounded-md cursor-pointer px-2 py-1.5 text-sm"
          >
            <Check className="w-4 h-4" />
            <span>Fix spelling and grammar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleModification(
                "Make this text more concise while retaining all key information and main points. Remove redundancies and unnecessary words. Prioritize clarity and brevity"
              )
            }
            className="gap-2 rounded-md cursor-pointer px-2 py-1.5 text-sm"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Make shorter</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleModification(
                "Expand this text with relevant details, examples, and explanations. Maintain the same tone and style while adding depth and context. Ensure smooth flow between ideas"
              )
            }
            className="gap-2 rounded-md cursor-pointer px-2 py-1.5 text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Make longer</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleModification(
                "Simplify this text to make it more accessible. Use clearer language, shorter sentences, and simpler words where appropriate. Maintain technical accuracy while improving readability"
              )
            }
            className="gap-2 rounded-md cursor-pointer px-2 py-1.5 text-sm"
          >
            <Languages className="w-4 h-4" />
            <span>Simplify language</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handleModification(
                "Adjust the tone to be more professional and formal. Maintain the core message while using appropriate business language, improved structure, and professional vocabulary"
              )
            }
            className="gap-2 rounded-md cursor-pointer px-2 py-1.5 text-sm"
          >
            <Volume2 className="w-4 h-4" />
            <span>Change tone</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            GENERATE FROM SELECTION
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              handleModification(
                "Create a clear and concise summary of this text. Capture the main points and key ideas while maintaining accuracy. Focus on essential information and logical flow"
              )
            }
            className="gap-2 rounded-md cursor-pointer px-2 py-1.5 text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Summarize</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
