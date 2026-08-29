import { z } from 'zod'

import { bundledLanguages, bundledThemes } from 'shiki'

import {
  bgTypeOptions,
  runGeneration,
  setSnippetSettings,
  snippetSettings,
  supportedFontFamilies,
} from '~/lib/editor-state'

type StylePatch = z.infer<typeof stylePatchSchema>

interface ToolError {
  ok: false
  error: string
  hint?: string
}

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a hex color like '#a3d0ff'")

const stylePatchSchema = z
  .object({
    title: z.string().optional(),
    snippetWidth: z.number().min(0).max(1500).optional(),
    yPadding: z.number().min(0).max(200).optional(),
    xPadding: z.number().min(0).max(200).optional(),
    shadowEnabled: z.boolean().optional(),
    shadowOffsetY: z.number().min(0).optional(),
    shadowBlur: z.number().min(0).max(200).optional(),
    shadowColor: hexColor.optional(),
    shadowOpacity: z.number().min(0).max(1).optional(),
    bgType: z.enum(['solid', 'linearGradient']).optional(),
    bgGradientColorStart: hexColor.optional(),
    bgGradientColorEnd: hexColor.optional(),
    bgGradientDirection: z.number().min(0).max(359).optional(),
    bgColor: hexColor.optional(),
    language: z.string().optional(),
    theme: z.string().optional(),
    fontSize: z.number().min(1).max(64).optional(),
    fontFamily: z.string().optional(),
  })
  .strict()

const setCodeSchema = z.object({
  side: z.enum(['start', 'end']),
  code: z.string(),
})

const listOptionsSchema = z.object({
  kind: z.enum(['theme', 'language', 'font', 'bgType']),
})

const createDiffGifSchema = z.object({
  startCode: z.string(),
  endCode: z.string(),
  style: stylePatchSchema.optional(),
})

function zodErrorResult(error: z.ZodError, unrecognizedHint?: string): ToolError {
  const message = error.issues
    .map(issue =>
      issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
    )
    .join('; ')
  const hasUnrecognized = error.issues.some(issue => issue.code === 'unrecognized_keys')
  return {
    ok: false,
    error: `Invalid input: ${message}`,
    ...(hasUnrecognized && unrecognizedHint ? { hint: unrecognizedHint } : {}),
  }
}

function applyCode(side: 'start' | 'end', code: string) {
  if (side === 'start') {
    setSnippetSettings('codeLeft', code)
  } else {
    setSnippetSettings('codeRight', code)
  }
}

function validateStyleValues(patch: StylePatch): ToolError | null {
  const failures: string[] = []
  const hints: string[] = []

  if (patch.theme !== undefined && !(patch.theme in bundledThemes)) {
    failures.push(`Unknown theme '${patch.theme}'`)
    hints.push("call list_options with kind='theme' for valid values")
  }
  if (patch.language !== undefined && !(patch.language in bundledLanguages)) {
    failures.push(`Unknown language '${patch.language}'`)
    hints.push("call list_options with kind='language' for valid values")
  }
  if (
    patch.fontFamily !== undefined &&
    !supportedFontFamilies.some(family => family.name === patch.fontFamily)
  ) {
    failures.push(`Unknown font family '${patch.fontFamily}'`)
    hints.push("call list_options with kind='font' for valid values")
  }

  if (failures.length > 0) {
    return { ok: false, error: failures.join('; '), hint: `${hints.join('; ')}.` }
  }
  return null
}

function applyStylePatch(patch: StylePatch) {
  setSnippetSettings(patch)
}

export const editorTools: WebMCP.ModelContextTool[] = [
  {
    name: 'set_code',
    description: 'Set the start or end code snippet for the code diff.',
    inputSchema: {
      type: 'object',
      properties: {
        side: {
          type: 'string',
          enum: ['start', 'end'],
          description: 'Which snippet to set: "start" (before the diff) or "end" (after the diff)',
        },
        code: {
          type: 'string',
          description: 'The full code content for the snippet',
        },
      },
      required: ['side', 'code'],
      additionalProperties: false,
    },
    execute: async input => {
      const parsed = setCodeSchema.safeParse(input)
      if (!parsed.success) {
        return zodErrorResult(parsed.error)
      }
      applyCode(parsed.data.side, parsed.data.code)
      return { ok: true, side: parsed.data.side }
    },
  },
  {
    name: 'update_style',
    description:
      'Update style settings for the code snippet. Only the provided fields are changed. Call list_options for valid theme, language, and font values.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Snippet title' },
        snippetWidth: { type: 'number', description: 'Snippet width in pixels (0-1500)' },
        yPadding: { type: 'number', description: 'Vertical padding in pixels (0-200)' },
        xPadding: { type: 'number', description: 'Horizontal padding in pixels (0-200)' },
        shadowEnabled: { type: 'boolean', description: 'Show the snippet shadow' },
        shadowOffsetY: { type: 'number', description: 'Shadow vertical offset in pixels' },
        shadowBlur: { type: 'number', description: 'Shadow blur in pixels (0-200)' },
        shadowColor: { type: 'string', description: 'Shadow color as hex, e.g. "#000000"' },
        shadowOpacity: { type: 'number', description: 'Shadow opacity between 0 and 1' },
        bgType: {
          type: 'string',
          enum: ['solid', 'linearGradient'],
          description: 'Background type',
        },
        bgGradientColorStart: { type: 'string', description: 'Gradient start color as hex' },
        bgGradientColorEnd: { type: 'string', description: 'Gradient end color as hex' },
        bgGradientDirection: {
          type: 'number',
          description: 'Gradient direction in degrees (0-359)',
        },
        bgColor: { type: 'string', description: 'Solid background color as hex' },
        language: {
          type: 'string',
          description: 'Code language id — call list_options with kind="language" for valid values',
        },
        theme: {
          type: 'string',
          description:
            'Syntax highlighting theme — call list_options with kind="theme" for valid values',
        },
        fontSize: { type: 'number', description: 'Font size in pixels (1-64)' },
        fontFamily: {
          type: 'string',
          description: 'Font family — call list_options with kind="font" for valid values',
        },
      },
      additionalProperties: false,
    },
    execute: async input => {
      const parsed = stylePatchSchema.safeParse(input)
      if (!parsed.success) {
        return zodErrorResult(parsed.error, 'Use set_code to set the snippet code.')
      }
      const patch = parsed.data
      if (Object.keys(patch).length === 0) {
        return {
          ok: false,
          error: 'At least one style field is required.',
          hint: 'Style fields include title, snippetWidth, paddings, shadow settings, background settings, language, theme, fontSize, and fontFamily.',
        }
      }
      const invalid = validateStyleValues(patch)
      if (invalid) {
        return invalid
      }
      applyStylePatch(patch)
      return { ok: true, updated: Object.keys(patch) }
    },
  },
  {
    name: 'get_settings',
    description: 'Get the current editor settings (code snippets and style settings).',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
    },
    execute: async () => {
      return { ok: true, settings: { ...snippetSettings } }
    },
  },
  {
    name: 'list_options',
    description: 'List valid option values for theme, language, font, or background type.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['theme', 'language', 'font', 'bgType'],
          description: 'Which option list to return',
        },
      },
      required: ['kind'],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
    },
    execute: async input => {
      const parsed = listOptionsSchema.safeParse(input)
      if (!parsed.success) {
        return zodErrorResult(parsed.error)
      }
      const { kind } = parsed.data
      const values =
        kind === 'theme'
          ? Object.keys(bundledThemes)
          : kind === 'language'
          ? Object.keys(bundledLanguages)
          : kind === 'font'
          ? supportedFontFamilies.map(family => family.name)
          : bgTypeOptions.map(option => option.value)
      return { ok: true, kind, values }
    },
  },
  {
    name: 'generate_gif',
    description:
      'Generate the animated GIF from the current start/end code and style, and open the result dialog. The user downloads the GIF from the dialog.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    execute: async (_input, options) => {
      return runGeneration(options?.signal)
    },
  },
  {
    name: 'create_diff_gif',
    description:
      'One-shot: set the start/end code, optionally apply a style patch, generate the GIF, and open the result dialog. Prefer the granular tools (set_code, update_style, generate_gif) when adjusting iteratively.',
    inputSchema: {
      type: 'object',
      properties: {
        startCode: { type: 'string', description: 'The code before the diff' },
        endCode: { type: 'string', description: 'The code after the diff' },
        style: {
          type: 'object',
          description:
            'Optional style patch with the same fields as update_style. Call list_options for valid theme/language/font values.',
        },
      },
      required: ['startCode', 'endCode'],
      additionalProperties: false,
    },
    execute: async input => {
      const parsed = createDiffGifSchema.safeParse(input)
      if (!parsed.success) {
        return zodErrorResult(parsed.error)
      }
      const { startCode, endCode, style } = parsed.data

      if (startCode.trim() === '') {
        return { ok: false, error: 'startCode is empty. Provide the code before the diff.' }
      }
      if (endCode.trim() === '') {
        return { ok: false, error: 'endCode is empty. Provide the code after the diff.' }
      }

      const hasStyle = style !== undefined && Object.keys(style).length > 0
      if (hasStyle) {
        const invalid = validateStyleValues(style)
        if (invalid) {
          return invalid
        }
      }

      applyCode('start', startCode)
      applyCode('end', endCode)
      if (hasStyle) {
        applyStylePatch(style)
      }

      return runGeneration()
    },
  },
]
