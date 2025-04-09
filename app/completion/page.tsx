"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect } from "react";

export default function EditorPage() {
	const [blockContent, setBlockContent] = useState(""); // Current block text
	const [blocks, setBlocks] = useState<string[]>([]); // Previous blocks

	const { completion, input, setInput, handleSubmit, error, isLoading } =
		useCompletion({
			api: "/api/completion",
			body: { blocks, currentBlock: blockContent },
		});

	// Debounce input to trigger streaming
	useEffect(() => {
		const timer = setTimeout(() => {
			setInput(blockContent); // Update input to trigger stream
			handleSubmit(
				new Event("submit") as unknown as React.FormEvent<HTMLFormElement>,
			); // Auto-submit to stream
		}, 500);
		return () => clearTimeout(timer);
	}, [blockContent, setInput, handleSubmit]);

	// Handle new block creation
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (blockContent.trim()) {
				setBlocks([...blocks, blockContent]);
				setBlockContent("");
			}
		}
	};

	return (
		<div style={{ padding: "20px", fontFamily: "Arial" }}>
			<h1>ObsidianX PoC</h1>
			{/* Render previous blocks */}
			{blocks.map((block, index) => (
				<div
					key={block.replace(/\s+/g, "-")}
					style={{ margin: "10px 0", padding: "8px", background: "#f5f5f5" }}
				>
					{block}
				</div>
			))}
			{/* Current block with streaming completion */}
			<form onSubmit={handleSubmit}>
				<input
					value={blockContent}
					onChange={(e) => setBlockContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Start typing..."
					style={{ width: "100%", padding: "8px", fontSize: "16px" }}
				/>
				{isLoading && <span style={{ color: "#999" }}>Thinking...</span>}
				{completion && (
					<span style={{ color: "#666", opacity: 0.7 }}>
						{` ${completion}`} {/* Streamed ghost text */}
					</span>
				)}
				{error && <div style={{ color: "red" }}>Error: {error.message}</div>}
			</form>
		</div>
	);
}
