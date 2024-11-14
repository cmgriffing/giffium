const style = `.shikicode.input, .shikicode.output {
	position: absolute;
	margin: 0;
	inset: 0;
	border: 0;
	padding: 0;
	font-size: inherit;
	line-height: inherit;
	tab-size: var(--tab-size);
}

.shikicode.input, .shikicode.output, .shikicode.output code {
	font-family: var(--font-family, monospace);
}

.shikicode.input {
	box-sizing: border-box;
	outline: none;
	background-color: transparent;
	padding-left: 2em;
	width: 100%;
	height: 100%;
	overflow: auto;
	resize: none;
	color: transparent;
	caret-color: var(--fg, black);
	white-space: pre;
}

.shikicode.output {
	counter-reset: shiki-line 0;
	overflow: hidden;
	pointer-events: none;
}

.shikicode.output > pre {
	display: contents;
}

.shikicode.output .line {
	counter-increment: shiki-line 1;
}

.shikicode.output .line::before {
	display: inline-block;
	position: sticky;
	left: 0;
	box-sizing: border-box;
	background-color: var(--bg);
	width: 2em;
	content: counter(shiki-line);
	color: var(--bg);
	text-align: right;
}

.shikicode.output.line-numbers .line::before {
	padding-right: 2em;
	width: 5em;
	color: var(--fg);
}

.shikicode.input.line-numbers {
	padding-left: 5em;
}
`

function noop() {}

export function injectStyle(doc: Document) {
  const hash = `shikicode-${djb2(style).toString(36)}`
  if (doc.getElementById(hash)) return noop
  const element = doc.createElement('style')
  element.id = hash
  element.append(doc.createTextNode(''))
  doc.head.append(element)

  try {
    const sheet = getSheet(element, doc)
    sheet.insertRule(style)
  } catch (e) {
    element.append(doc.createTextNode(style))
  }
  return () => {
    element.remove()
  }
}

function djb2(s: string, hash = 5381) {
  let i = s.length

  while (i) {
    hash = (hash * 33) ^ s.charCodeAt(--i)
  }

  return hash
}

function getSheet(tag: HTMLStyleElement, doc: Document): CSSStyleSheet {
  if (tag.sheet) {
    return tag.sheet
  }

  // Avoid Firefox quirk where the style element might not have a sheet property
  const { styleSheets } = doc
  for (let i = 0, l = styleSheets.length; i < l; i++) {
    const sheet = styleSheets[i]
    if (sheet.ownerNode === tag) {
      return sheet
    }
  }

  throw new Error('Could not find CSSStyleSheet object')
}
