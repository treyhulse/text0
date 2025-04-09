"use client";
import type { Editor } from "@tiptap/core";
import { useState } from "react";
import { BlockEditor } from "@/components/editor";
import defaultContent from "@/public/default-content.json";

export default function Home() {
	const [editor, setEditor] = useState<Editor>();

	return (
		<div className="container mx-auto max-w-4xl mt-16 pt-7 pb-32">
			<BlockEditor
				content={defaultContent}
				onCreate={setEditor}
				onUpdate={setEditor}
			/>
		</div>
	);
}
