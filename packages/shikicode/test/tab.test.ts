import { Action, PatchAction, SelectAction, State, indentText, outdentText } from "../src/plugins";

interface TabConfig {
	tabSize: number;
	insertSpaces: boolean;
}

const space_4 = {
	tabSize: 4,
	insertSpaces: true,
};

const tab_4 = {
	tabSize: 4,
	insertSpaces: false,
};

const space_2 = {
	tabSize: 2,
	insertSpaces: true,
};

const tab_2 = {
	tabSize: 2,
	insertSpaces: false,
};

function setRangeText(state: State, patch: PatchAction): State {
	const [start, mid, end] = [state.value.slice(0, patch.start), patch.value, state.value.slice(patch.end)];

	const new_state = { ...state };

	switch (patch.mode) {
		case "start":
			new_state.selectionStart = new_state.selectionEnd = start.length;
			break;
		case "end":
			new_state.selectionStart = new_state.selectionEnd = start.length + mid.length;
			break;
		case "select":
		default:
			// Unfortunately, we cannot mimic the behavior of `preserve`.
			new_state.selectionStart = start.length;
			new_state.selectionEnd = start.length + mid.length;
			break;
	}

	new_state.value = start + mid + end;
	return new_state;
}

function setSelectionRange(state: State, select: SelectAction): State {
	return { value: state.value, selectionStart: select.start, selectionEnd: select.end };
}

function applyEdit(state: State, action?: Action): State {
	if (!action) {
		return state;
	}
	if (action.patch) {
		state = setRangeText(state, action.patch);
	}
	if (action.select) {
		state = setSelectionRange(state, action.select);
	}
	return state;
}

const simpleText = "My First Line\n\t\tMy Second Line\n    Third Line\n\n123";

describe("Editor Commands - ShiftCommand", () => {
	test("basic usage", () => {
		testShiftCommand(simpleText, 0, 0, space_4);
	});

	test("basic usage", () => {
		testShiftCommand(simpleText, 2, 2, space_4);
	});

	test("basic usage", () => {
		const select = simpleText.indexOf("Third Line") - 2;
		testShiftCommand(simpleText, select, select, tab_2);
	});

	test("single line", () => {
		const select = "My First Line";
		testShiftCommand(simpleText, 0, select.length, space_4);
	});

	test("single line", () => {
		const select = "My First Line\n";
		testShiftCommand(simpleText, 0, select.length, space_4);
	});

	test("single line", () => {
		const select = "\t\tMy Second Line\n";
		const start = simpleText.indexOf(select);
		testShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "First Line\n";
		const start = simpleText.indexOf(select);
		testShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "Line\n\t\tMy";
		const start = simpleText.indexOf(select);
		testShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "Line\n\t\tMy Second Line\n";
		const start = simpleText.indexOf(select);
		testShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "First Line\n\t";
		const start = simpleText.indexOf(select);
		testShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "\tMy Second Line\n  ";
		const start = simpleText.indexOf(select);
		testShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		testShiftCommand(simpleText, 0, simpleText.length, space_4);
	});
});

describe("Editor Commands - UnShiftCommand", () => {
	test("basic usage", () => {
		testUnShiftCommand(simpleText, 0, 0, space_4);
	});

	test("basic usage", () => {
		testUnShiftCommand(simpleText, 2, 2, space_4);
	});

	test("basic usage", () => {
		const select = simpleText.indexOf("Third Line") - 2;
		testUnShiftCommand(simpleText, select, select, tab_2);
	});

	test("single line", () => {
		const select = "My First Line";
		testUnShiftCommand(simpleText, 0, select.length, space_4);
	});

	test("single line", () => {
		const select = "My First Line\n";
		testUnShiftCommand(simpleText, 0, select.length, space_4);
	});

	test("single line", () => {
		const select = "\t\tMy Second Line\n";
		const start = simpleText.indexOf(select);
		testUnShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "First Line\n";
		const start = simpleText.indexOf(select);
		testUnShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "Line\n\t\tMy";
		const start = simpleText.indexOf(select);
		testUnShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "Line\n\t\tMy Second Line\n";
		const start = simpleText.indexOf(select);
		testUnShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "First Line\n\t";
		const start = simpleText.indexOf(select);
		testUnShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		const select = "\tMy Second Line\n  ";
		const start = simpleText.indexOf(select);
		testUnShiftCommand(simpleText, start, start + select.length, space_4);
	});

	test("multiple lines", () => {
		testUnShiftCommand(simpleText, 0, simpleText.length, space_4);
	});
});

function testShiftCommand(value: string, selectionStart: number, selectionEnd: number, config: TabConfig): void {
	const state = { value, selectionStart, selectionEnd };

	const action = indentText(state, config);
	const result = applyEdit(state, action);

	expect({ config, input: handleState(state), output: handleState(result) }).toMatchSnapshot();
}

function testUnShiftCommand(value: string, selectionStart: number, selectionEnd: number, config: TabConfig): void {
	const state = { value, selectionStart, selectionEnd };

	const action = outdentText(state, config);
	const result = applyEdit(state, action);

	expect({ config, input: handleState(state), output: handleState(result) }).toMatchSnapshot();
}

function handleState(state: State) {
	const lines = state.value.split(/\r\n|\n/);
	return {
		...state,
		value: lines,
	};
}
