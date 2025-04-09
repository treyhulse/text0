import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import AiCompletionView from "./ai-completion-view";

export interface AiCompletionOptions {
	HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		aiCompletionCommands: {
			setAiCompletion: () => ReturnType;
		};
	}
}

export const AiCompletion = Node.create<AiCompletionOptions>({
	name: "aiCompletion",
	group: "block",
	draggable: true,
	marks: "",
	content: "inline*",

	addAttributes() {
		return {
			content: {
				default: "",
			},
		};
	},

	addOptions() {
		return {
			HTMLAttributes: {},
		};
	},

	addCommands() {
		return {
			setAiCompletion:
				() =>
				({ editor, chain }) => {
					const $aiCompletion = editor.$node(this.name);
					if ($aiCompletion) {
						return false;
					}

					return chain()
						.insertContent({
							type: this.name,
							attrs: { content: "" },
						})
						.setMeta("preventUpdate", true)
						.run();
				},
		};
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
			0,
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(AiCompletionView, {
			className: this.options.HTMLAttributes.class,
		});
	},
});
