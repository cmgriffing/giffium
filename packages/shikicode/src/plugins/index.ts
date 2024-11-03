import type { EditorOptions, ShikiCode } from "../core.js";

export type IDisposable = () => void;
export type { EditorOptions, IndentOptions, ShikiCode } from "../core.js";

export type EditorPlugin = {
	(editor: ShikiCode, options: EditorOptions): IDisposable;
};

export * from "./autoload.js";
export * from "./closing_pairs.js";
export * from "./tab.js";
