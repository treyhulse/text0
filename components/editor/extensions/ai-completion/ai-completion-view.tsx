import { NodeViewWrapper, useEditorState } from "@tiptap/react";
import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import type { Editor, NodeViewProps } from "@tiptap/core";

interface AiCompletionViewProps extends NodeViewProps {
	editor: Editor;
}

const AiCompletionView = ({ editor, node, getPos }: AiCompletionViewProps) => {
	const [blockContent, setBlockContent] = useState(node.attrs.content || "");
	const [blocks, setBlocks] = useState<string[]>([]);
	const [shouldTrigger, setShouldTrigger] = useState(true);
	const [completionKey, setCompletionKey] = useState(0); // To force re-render of useCompletion
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const mirrorRef = useRef<HTMLDivElement>(null);

	// Fetch previous blocks
	const { previousBlocks } = useEditorState({
		editor,
		selector: (instance) => {
			const { from } = instance.editor.state.selection;
			const doc = instance.editor.state.doc;
			const previousBlocks: string[] = [];
			doc.descendants((node, pos) => {
				if (pos >= from) return false;
				if (
					node.type.name === "paragraph" ||
					node.type.name === "aiCompletion"
				) {
					previousBlocks.push(node.textContent || node.attrs.content || "");
				}
			});
			return { previousBlocks };
		},
	});

	const { completion, input, setInput, handleSubmit, error, isLoading } =
		useCompletion({
			api: "/api/completion",
			body: { blocks: previousBlocks, currentBlock: blockContent },
			id: `completion-${completionKey}`,
		});

	// Debounce input to trigger streaming only when user types
	useEffect(() => {
		setBlocks(previousBlocks);
		if (!shouldTrigger) return;

		const timer = setTimeout(() => {
			setInput(blockContent);
			handleSubmit(
				new Event("submit") as unknown as React.FormEvent<HTMLFormElement>,
			);
		}, 500);
		return () => clearTimeout(timer);
	}, [blockContent, previousBlocks, setInput, handleSubmit, shouldTrigger]);

	// Parse the completion to extract <completion> content
	const parsedCompletion =
		completion.match(/<completion>(.*?)<\/completion>/)?.[1] || "";

	// Handle user input
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newContent = e.target.value;
		setBlockContent(newContent);
		setShouldTrigger(true);
		editor.commands.updateAttributes("aiCompletion", { content: newContent });
	};

	// Handle keypress to clear ghost text or accept completion
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Tab" && parsedCompletion) {
			// Accept completion on Tab
			e.preventDefault();
			const newContent = `${blockContent} ${parsedCompletion}`;
			setBlockContent(newContent);
			setShouldTrigger(false);
			setCompletionKey((prev) => prev + 1); // Reset completion
			editor.commands.updateAttributes("aiCompletion", { content: newContent });
			setInput(""); // Clear suggestion
		} else if (
			parsedCompletion &&
			e.key !== "Tab" &&
			!e.ctrlKey &&
			!e.metaKey &&
			!e.altKey
		) {
			// Clear ghost text on any other keypress (except modifier keys)
			setCompletionKey((prev) => prev + 1); // Reset completion
			setInput(""); // Clear suggestion
		}
	};

	// Sync textarea and mirror dimensions
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (textareaRef.current && mirrorRef.current) {
			const textarea = textareaRef.current;
			const mirror = mirrorRef.current;
			const styles = window.getComputedStyle(textarea);
			mirror.style.font = styles.font;
			mirror.style.lineHeight = styles.lineHeight;
			mirror.style.padding = styles.padding;
			mirror.style.width = styles.width;
			mirror.style.minHeight = styles.minHeight;
			mirror.style.whiteSpace = "pre-wrap";
			mirror.style.wordWrap = "break-word";
		}
	}, [blockContent]);

	return (
		<NodeViewWrapper>
			<div className="ai-completion-block relative">
				{/* Mirrored content with ghost text */}
				<div
					ref={mirrorRef}
					className="absolute top-0 left-0 text-foreground pointer-events-none"
					style={{ zIndex: 1 }}
				>
					<span>{blockContent}</span>
					{isLoading && (
						<span className="text-gray-400 opacity-70">Thinking...</span>
					)}
					{parsedCompletion && !isLoading && (
						<span className="text-gray-400 opacity-70 pointer-events-none select-none">
							{` ${parsedCompletion}`}
						</span>
					)}
				</div>
				{/* Transparent textarea for input */}
				<textarea
					ref={textareaRef}
					value={blockContent}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder="Type here for AI completions..."
					className="w-full p-0 border-none bg-transparent focus:outline-none resize-none whitespace-pre-wrap text-transparent caret-foreground"
					style={{
						minHeight: "2rem",
						lineHeight: "1.5rem",
						zIndex: 2,
						position: "relative",
					}}
				/>
				{error && (
					<div className="text-red-500 mt-1">Error: {error.message}</div>
				)}
			</div>
		</NodeViewWrapper>
	);
};

export default AiCompletionView;
