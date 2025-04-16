"use client";

import { T0Logo } from "@/components/ui/icons/t0-logo";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";

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
			onKeyDown={onKeyDown}
			onKeyUp={onKeyUp}
			tabIndex={tabIndex}
		>
			<div className="side" />
			<div className="top" />
			<T0Logo className="char h-10 w-10" />
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

export const T0Keycap: React.FC = () => {
	const router = useRouter();
	const { add, remove, has } = useSetState([]);
	const { play, stop } = useSound("/keytype.mp3");

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "t") {
				add(e.key);
				stop();
				play();
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "t") {
				remove(e.key);
				router.push("/home");
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, [add, remove, play, stop, router]);

	const handleClick = (char: string) => {
		add(char);
		stop();
		play();
		setTimeout(() => {
			remove(char);
			router.push("/home");
		}, 100);
	};

	const handleMouseDown = (char: string) => {
		add(char);
		stop();
		play();
	};

	const handleMouseUp = (char: string) => {
		remove(char);
		router.push("/home");
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
			router.push("/home");
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
