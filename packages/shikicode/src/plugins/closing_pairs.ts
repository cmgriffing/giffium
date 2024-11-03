import { setRangeText } from "./common.js";
import type { EditorPlugin } from "./index.js";

export type ClosingPair = readonly [open: string, close: string];

export type ClosingPairsRules = {
	readonly language: string;
	readonly pairs: ClosingPair[];
};

interface ResolvedClosingPairsRules {
	auto_closing_pairs_open: Map<string, string>;
	auto_closing_pairs_close: Map<string, string>;
	auto_closing_pairs: Set<string>;
}

const should_auto_close = " \t\n.,;)]}>=";

/**
 * A plugin that automatically inserts closing pairs.
 */
export function hookClosingPairs(...pairs_rule_list: readonly ClosingPairsRules[]): EditorPlugin {
	const rules = new Map<string, ResolvedClosingPairsRules>();

	const list = default_pairs.concat(pairs_rule_list);

	for (const { language, pairs } of list) {
		const auto_closing_pairs_open = new Map<string, string>();
		const auto_closing_pairs_close = new Map<string, string>();
		const auto_closing_pairs = new Set<string>();
		pairs.forEach(([open, close]) => {
			auto_closing_pairs_open.set(open, close);
			auto_closing_pairs_close.set(close, open);
			auto_closing_pairs.add(open + close);
		});
		rules.set(language, {
			auto_closing_pairs_open,
			auto_closing_pairs_close,
			auto_closing_pairs,
		});
	}

	return ({ input }, options) => {
		const onKeydown = (e: KeyboardEvent) => {
			const config = rules.get(options.language);
			if (!config) {
				return;
			}

			const { selectionStart, selectionEnd } = input;

			if (isBackspace(e)) {
				if (selectionStart !== selectionEnd) {
					return;
				}

				const slice = input.value.slice(selectionStart - 1, selectionStart + 1);
				if (config.auto_closing_pairs.has(slice)) {
					input.setSelectionRange(selectionStart - 1, selectionStart + 1);
				}
				return;
			}

			if (!config.auto_closing_pairs_open.has(e.key) && !config.auto_closing_pairs_close.has(e.key)) {
				return;
			}

			// add pairs surrounding the selection
			if (selectionStart !== selectionEnd && config.auto_closing_pairs_open.has(e.key)) {
				e.preventDefault();
				const text = input.value.slice(selectionStart, selectionEnd);
				const left = e.key;
				const right = config.auto_closing_pairs_open.get(left)!;
				setRangeText(input, left + text + right, selectionStart, selectionEnd, "select");
				input.dispatchEvent(new Event("input"));
				input.dispatchEvent(new Event("change"));
				input.setSelectionRange(selectionStart + 1, selectionEnd + 1);
				return;
			}

			// add pairs at the cursor
			if (
				selectionStart === selectionEnd &&
				config.auto_closing_pairs_open.has(e.key) &&
				should_auto_close.includes(input.value[selectionStart] || "")
			) {
				e.preventDefault();
				const left = e.key;
				const right = config.auto_closing_pairs_open.get(left)!;
				setRangeText(input, left + right, selectionStart, selectionEnd, "start");
				input.dispatchEvent(new Event("input"));
				input.dispatchEvent(new Event("change"));
				input.setSelectionRange(selectionStart + 1, selectionEnd + 1);
				return;
			}

			// skip right pairs
			if (
				selectionStart === selectionEnd &&
				selectionStart > 0 &&
				config.auto_closing_pairs.has(input.value.slice(selectionStart - 1, selectionStart + 1))
			) {
				input.setSelectionRange(selectionStart, selectionEnd + 1);
			}
		};

		input.addEventListener("keydown", onKeydown);

		return () => {
			input.removeEventListener("keydown", onKeydown);
		};
	};
}

function isBackspace(e: KeyboardEvent) {
	return e.key === "Backspace" && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey;
}

export const pairs_parentheses = ["(", ")"] satisfies ClosingPair;
export const pairs_brackets = ["[", "]"] satisfies ClosingPair;
export const pairs_braces = ["{", "}"] satisfies ClosingPair;
export const pairs_angle = ["<", ">"] satisfies ClosingPair;
export const pairs_quotes = ['"', '"'] satisfies ClosingPair;
export const pairs_single_quotes = ["'", "'"] satisfies ClosingPair;
export const pairs_backticks = ["`", "`"] satisfies ClosingPair;

const c_lang_pairs: ClosingPair[] = [
	pairs_parentheses,
	pairs_brackets,
	pairs_braces,
	pairs_quotes,
	pairs_single_quotes,
];

const c_lang_pairs_with_backticks: ClosingPair[] = [
	pairs_parentheses,
	pairs_brackets,
	pairs_braces,
	pairs_quotes,
	pairs_single_quotes,
	pairs_backticks,
];

export const default_pairs: readonly ClosingPairsRules[] = [
	{
		language: "c",
		pairs: c_lang_pairs,
	},
	{
		language: "cpp",
		pairs: c_lang_pairs,
	},
	{
		language: "css",
		pairs: c_lang_pairs,
	},
	{
		language: "csharp",
		pairs: c_lang_pairs,
	},
	{
		language: "dart",
		pairs: c_lang_pairs_with_backticks,
	},
	{
		language: "go",
		pairs: c_lang_pairs_with_backticks,
	},
	{
		language: "java",
		pairs: c_lang_pairs,
	},
	{
		language: "json",
		pairs: [pairs_brackets, pairs_braces, pairs_quotes],
	},
	{
		language: "javascript",
		pairs: c_lang_pairs_with_backticks,
	},
	{
		language: "typescript",
		pairs: c_lang_pairs_with_backticks,
	},
	{
		language: "jsx",
		pairs: c_lang_pairs_with_backticks,
	},
	{
		language: "tsx",
		pairs: c_lang_pairs_with_backticks,
	},
	{
		language: "php",
		pairs: c_lang_pairs,
	},
	{
		language: "python",
		pairs: c_lang_pairs,
	},
	{
		language: "rust",
		pairs: [pairs_parentheses, pairs_brackets, pairs_braces, pairs_quotes],
	},
	{
		language: "ruby",
		pairs: c_lang_pairs_with_backticks,
	},
	{
		language: "sql",
		pairs: c_lang_pairs_with_backticks,
	},
];
