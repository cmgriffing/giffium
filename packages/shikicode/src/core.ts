import type { BundledLanguage, BundledTheme, Highlighter } from "shiki";
import type { EditorPlugin } from "./plugins/index.js";

import { hookScroll } from "./scroll.js";
import { injectStyle } from "./style.js";

export interface IndentOptions {
	/**
	 * The number of spaces a tab is equal to.
	 * This setting is overridden based on the file contents when `detectIndentation` is on.
	 * Defaults to 4.
	 */
	readonly tabSize: number;
	/**
	 * Insert spaces when pressing `Tab`.
	 * This setting is overridden based on the file contents when `detectIndentation` is on.
	 * Defaults to true.
	 */
	readonly insertSpaces: boolean;
}

export interface EditorOptions extends IndentOptions {
	/**
	 * Control the rendering of line numbers.
	 * Defaults to `on`.
	 */
	readonly lineNumbers: "on" | "off";
	/**
	 * Should the editor be read only.
	 * Defaults to false.
	 */
	readonly readOnly: boolean;
	readonly language: BundledLanguage | "plaintext" | "txt" | "text" | "plain" | (string & {});
	readonly theme: BundledTheme | "none" | (string & {});
}

export interface InitOptions extends Pick<EditorOptions, "language" | "theme"> {
	readonly value?: string;
}

export interface UpdateOptions extends Partial<EditorOptions> {}

interface EditorOptionsWithValue extends EditorOptions {
	readonly value: string;
}

interface ShikiCodeFactory {
	create(domElement: HTMLElement, highlighter: Highlighter, options: InitOptions): ShikiCode;
	withOptions(options: UpdateOptions): ShikiCodeFactory;
	withPlugins(...plugins: readonly EditorPlugin[]): ShikiCodeFactory;
}

export interface ShikiCode {
	readonly input: HTMLTextAreaElement;
	readonly output: HTMLDivElement;
	readonly container: HTMLElement;

	/**
	 * The highlighter instance used by the editor.
	 */
	readonly highlighter: Highlighter;

	/**
	 * The current value of the editor.
	 * Setting this value will update the editor and force a re-render.
	 */
	value: string;
	forceRender(value?: string): void;

	/**
	 * Make sure the theme or language is loaded before calling this method.
	 */
	updateOptions(options: UpdateOptions): void;

	addPlugin(plugin: EditorPlugin): void;

	dispose(): void;
}

const defaultOptions = {
	lineNumbers: "on",
	readOnly: false,
	tabSize: 4,
	insertSpaces: true,
} as const;

export function shikiCode(): ShikiCodeFactory {
	const editor_options = { ...defaultOptions };
	const plugin_list: EditorPlugin[] = [];

	return {
		create(domElement: HTMLElement, highlighter: Highlighter, options: InitOptions): ShikiCode {
			return create(domElement, highlighter, { value: "", ...editor_options, ...options }, plugin_list);
		},
		withOptions(options: UpdateOptions): ShikiCodeFactory {
			Object.assign(editor_options, options);
			return this;
		},
		withPlugins(...plugins: EditorPlugin[]): ShikiCodeFactory {
			plugin_list.push(...plugins);
			return this;
		},
	};
}

function create(
	domElement: HTMLElement,
	highlighter: Highlighter,
	editor_options: EditorOptionsWithValue,
	plugin_list: EditorPlugin[],
): ShikiCode {
	const doc = domElement.ownerDocument;

	const output = doc.createElement("div");
	const input = doc.createElement("textarea");

	initIO(input, output);
	initContainer(domElement);

	domElement.append(input);
	domElement.append(output);

	updateIO(input, output, editor_options);
	updateContainer(domElement, highlighter, editor_options.theme);

	if (editor_options.value) {
		input.value = editor_options.value;
	}

	const forceRender = (value = input.value) => {
		render(output, highlighter, value, editor_options.language, editor_options.theme);
	};

	const onInput = () => {
		forceRender();
	};
	input.addEventListener("input", onInput);

	forceRender();

	const cleanup = [
		() => {
			input.removeEventListener("input", onInput);
		},
		hookScroll(input, output),
		injectStyle(doc),
	];

	const editor: ShikiCode = {
		input,
		output,
		container: domElement,

		get value() {
			return input.value;
		},
		set value(code) {
			input.value = code;
			forceRender(code);
		},

		get highlighter() {
			return highlighter;
		},

		forceRender,
		updateOptions(newOptions) {
			if (shouldUpdateIO(editor_options, newOptions)) {
				updateIO(input, output, newOptions);
			}

			if (shouldUpdateContainer(editor_options, newOptions)) {
				updateContainer(domElement, highlighter, newOptions.theme!);
			}

			const should_rerender = shouldRerender(editor_options, newOptions);

			Object.assign(editor_options, newOptions);

			if (should_rerender) {
				forceRender();
			}
		},

		addPlugin(plugin) {
			cleanup.push(plugin(this, editor_options));
		},
		dispose() {
			cleanup.forEach((fn) => fn());
			input.remove();
			output.remove();
		},
	};

	for (const plugin of plugin_list) {
		cleanup.push(plugin(editor, editor_options));
	}

	return editor;
}

function initContainer(container: HTMLElement) {
	container.style.color = "var(--fg)";
	container.style.backgroundColor = "var(--bg)";
	container.style.position = "relative";
}

function shouldUpdateContainer(config: EditorOptions, newOptions: UpdateOptions) {
	return newOptions.theme !== void 0 && newOptions.theme !== config.theme;
}

function updateContainer(container: HTMLElement, highlighter: Highlighter, theme_name: string) {
	const theme = highlighter.getTheme(theme_name);
	container.style.setProperty("--fg", theme.fg);
	container.style.setProperty("--bg", theme.bg);
}

function initIO(input: HTMLTextAreaElement, output: HTMLElement) {
	input.setAttribute("autocapitalize", "off");
	input.setAttribute("autocomplete", "off");
	input.setAttribute("autocorrect", "off");
	input.setAttribute("spellcheck", "false");

	input.classList.add("shikicode", "input");
	output.classList.add("shikicode", "output");
	output.setAttribute("inert", "");
}

function shouldUpdateIO(config: EditorOptions, newOptions: UpdateOptions) {
	return (
		(newOptions.lineNumbers !== void 0 && newOptions.lineNumbers !== config.lineNumbers) ||
		(newOptions.tabSize !== void 0 && newOptions.tabSize !== config.tabSize) ||
		(newOptions.readOnly !== void 0 && newOptions.readOnly !== config.readOnly)
	);
}

function updateIO(input: HTMLTextAreaElement, output: HTMLElement, options: UpdateOptions) {
	switch (options.lineNumbers) {
		case "on": {
			input.classList.add("line-numbers");
			output.classList.add("line-numbers");
			break;
		}
		case "off": {
			input.classList.remove("line-numbers");
			output.classList.remove("line-numbers");
			break;
		}
	}

	if (options.tabSize !== void 0) {
		input.style.setProperty("--tab-size", options.tabSize.toString());
		output.style.setProperty("--tab-size", options.tabSize.toString());
	}

	if (options.readOnly !== void 0) {
		input.readOnly = options.readOnly;
	}
}

function render(output: HTMLElement, highlighter: Highlighter, value: string, lang: string, theme: string) {
	const { codeToHtml } = highlighter;
	output.innerHTML = codeToHtml(value, {
		lang,
		theme,
	});
}

function shouldRerender(options: EditorOptions, newOptions: UpdateOptions) {
	return (
		(newOptions.theme !== void 0 && newOptions.theme !== options.theme) ||
		(newOptions.language !== void 0 && newOptions.language !== options.language)
	);
}
