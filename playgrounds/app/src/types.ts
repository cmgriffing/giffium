export interface User {
  id: string
  email: string
  githubId: string
  githubUsername: string
  githubAvatarUrl: string
}

export interface SnippetSettings {
  title?: string
  codeLeft: string
  codeRight: string
  snippetWidth: number
  yPadding: number
  xPadding: number
  shadowEnabled: boolean
  shadowOffsetY: number
  shadowBlur: number
  shadowColor: string
  shadowOpacity: number
  bgType: 'solid' | 'linearGradient'
  bgGradientColorStart: string
  bgGradientColorEnd: string
  bgGradientDirection: number
  bgColor: string
  language: string
  theme: string
  fontSize: number
  fontFamily: string
}

export interface Snippet extends SnippetSettings {
  id: string
  userId: string
  createdAt: number
  updatedAt: number
}

export interface AnimationFrameLayout {
  yPadding: number
  xPadding: number
}

export interface AnimationFrameShadow {
  shadowEnabled: boolean
  shadowOffsetY: number
  shadowBlur: number
  shadowColor: string
  shadowOpacity: number
}

export interface AnimationFrameStyling {
  fontSize: string
  fontFamily: string
  snippetBackgroundColor: string
  backgroundColor: string
  backgroundType: string
  backgroundGradientColorStart: string
  backgroundGradientColorEnd: string
  backgroundGradientDirection: number
}

export interface AnimationFrameConfig {
  layout: AnimationFrameLayout
  shadow: AnimationFrameShadow
  styling: AnimationFrameStyling
}
