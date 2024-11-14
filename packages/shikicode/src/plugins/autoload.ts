import type { BundledLanguage, BundledTheme } from 'shiki'
import type { IDisposable, ShikiCode } from './index.js'

/**
 * Automatically load languages and themes when they are not already loaded.
 *
 * It's recommended to handle shiki highlighter by yourself if you know all the languages and themes you will use.
 * This plugin will convert the `updateOptions` method to async method.
 */
export function autoload(editor: ShikiCode): IDisposable {
  const updateOptions = editor.updateOptions

  editor.updateOptions = async newOptions => {
    const themes = editor.highlighter.getLoadedThemes()
    const langs = editor.highlighter.getLoadedLanguages()

    const task_list = []

    if (
      newOptions.theme !== void 0 &&
      newOptions.theme !== 'none' &&
      !themes.includes(newOptions.theme)
    ) {
      task_list.push(editor.highlighter.loadTheme(newOptions.theme as unknown as BundledTheme))
    }

    if (
      newOptions.language !== void 0 &&
      newOptions.language !== 'text' &&
      !langs.includes(newOptions.language)
    ) {
      task_list.push(editor.highlighter.loadLanguage(newOptions.language as BundledLanguage))
    }

    await Promise.all(task_list)

    updateOptions(newOptions)
  }

  return () => {
    editor.updateOptions = updateOptions
  }
}
