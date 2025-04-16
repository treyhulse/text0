import { T0Logo } from "@/components/ui/icons/t0-logo";
import type React from "react";
import { useState, useEffect, useRef } from "react";

interface KeyProps {
	char: string;
	span?: boolean;
	active?: boolean;
	onClick: () => void;
	onMouseDown: () => void;
	onMouseUp: () => void;
	onKeyDown?: (e: React.KeyboardEvent) => void;
	onKeyUp?: (e: React.KeyboardEvent) => void;
	tabIndex?: number;
}

const Key: React.FC<KeyProps> = ({
	char,
	span,
	active,
	onClick,
	onMouseDown,
	onMouseUp,
	onKeyDown,
	onKeyUp,
	tabIndex = 0,
}) => {
	return (
		<div
			className={`key ${span ? "span" : ""} ${active ? "active" : ""}`}
			onClick={onClick}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseUp}
			onKeyDown={onKeyDown}
			onKeyUp={onKeyUp}
			tabIndex={tabIndex}
		>
			<div className="side" />
			<div className="top" />
			<T0Logo className="char w-10 h-10" />
		</div>
	);
};

const Column: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<div className="column">{children}</div>
);

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<div className="row">{children}</div>
);

const useSetState = (initialState: string[] = []) => {
	const [state, setState] = useState(new Set(initialState));

	const add = (item: string) => setState((state) => new Set(state.add(item)));
	const remove = (item: string) => {
		setState((state) => {
			const newState = new Set(state);
			newState.delete(item);
			return newState;
		});
		return state;
	};

	return {
		set: state,
		add,
		remove,
		has: (char: string) => state.has(char),
	};
};

const useSound = (url: string) => {
	const audio = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audio.current = new Audio(url);
	}, [url]);

	return {
		play: () => {
			if (audio.current) {
				audio.current.currentTime = 0;
				audio.current
					.play()
					.catch((err) => console.log("Audio play error:", err));
			}
		},
		stop: () => {
			if (audio.current) {
				audio.current.pause();
				audio.current.currentTime = 0;
			}
		},
	};
};

export const Keyboard: React.FC = () => {
	const { add, remove, has } = useSetState([]);
	const { play, stop } = useSound("/keytype.mp3");

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			add(e.key);
			stop();
			play();
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			remove(e.key);
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, [add, remove, play, stop]);

	const handleClick = (char: string) => {
		add(char);
		stop();
		play();
		setTimeout(() => remove(char), 100); // Remove after 100ms to show animation
	};

	const handleMouseDown = (char: string) => {
		add(char);
		stop();
		play();
	};

	const handleMouseUp = (char: string) => {
		remove(char);
	};

	const handleKeyDown = (char: string, e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			add(char);
			stop();
			play();
		}
	};

	const handleKeyUp = (char: string, e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			remove(char);
		}
	};

	const keys = (chars: string[], spans: boolean[] = []) =>
		chars.map((char, i) => (
			<Key
				key={char}
				char={char}
				span={spans[i] || false}
				active={has(char)}
				onClick={() => handleClick(char)}
				onMouseDown={() => handleMouseDown(char)}
				onMouseUp={() => handleMouseUp(char)}
				onKeyDown={(e) => handleKeyDown(char, e)}
				onKeyUp={(e) => handleKeyUp(char, e)}
			/>
		));

	return (
		<div className="keyboard">
			<Column>
				<Row>{keys(["t"])}</Row>
			</Column>
			<div className="cover" />
		</div>
	);
};

export default Keyboard;
