"use client";

import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import type { Content, Editor } from "@tiptap/react";
import { useEditor, EditorContent } from "@tiptap/react";
import { defaultExtensions } from "./default-extensions";
import { Ai } from "./extensions/ai";
import { getSuggestion, SlashCommand } from "./extensions/slash-command";
import { CodeBlockLanguageMenu } from "./menus/codeblock-language-menu";
import { DefaultBubbleMenu } from "./menus/default-bubble-menu";
import { TableOptionsMenu } from "./menus/table-options-menu";
import { toast } from "sonner";
import { useCallback } from "react";
import type { SuggestionOptions } from "@tiptap/suggestion";

interface BlockEditorProps {
	content?: Content;
	placeholder?: string;
	onCreate?: (editor: Editor) => void;
	onUpdate?: (editor: Editor) => void;
}

const BlockEditor = ({
	content,
	placeholder,
	onCreate,
	onUpdate,
}: BlockEditorProps) => {
	const editor = useEditor({
		extensions: [
			...defaultExtensions,
			Placeholder.configure({
				placeholder: placeholder ?? "Type  /  for commands...",
				emptyEditorClass: cn("is-editor-empty text-gray-400"),
				emptyNodeClass: cn("is-empty text-gray-400"),
			}),
			Ai.configure({
				onError: (error) => {
					// console.log(error);
					toast.error(error.message);
				},
			}),
			SlashCommand.configure({
				suggestion: getSuggestion({ ai: true }) as SuggestionOptions,
			}),
		],
		content: content,
		immediatelyRender: false,
		shouldRerenderOnTransaction: false,
		editorProps: {
			attributes: {
				spellcheck: "false",
			},
		},
		onCreate: useCallback(
			({ editor }: { editor: Editor }) => {
				// Add a small delay to ensure component is mounted
				setTimeout(() => {
					onCreate?.(editor);
				}, 0);
			},
			[onCreate],
		),
		onUpdate: ({ editor }) => {
			onUpdate?.(editor);
		},
		onContentError: ({ error }) => {
			console.error(error);
		},
	});

	return (
		<>
			<EditorContent
				editor={editor}
				className="prose dark:prose-invert focus:outline-none max-w-full z-0"
			/>
			<TableOptionsMenu editor={editor} />
			<CodeBlockLanguageMenu editor={editor} />
			<DefaultBubbleMenu editor={editor} showAiTools={true} />
		</>
	);
};

export { BlockEditor, type BlockEditorProps };
