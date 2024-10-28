import { z } from 'zod'

export const snippetValidator = z.object({
  title: z.string().min(1).max(100),
  codeLeft: z
    .string()
    .min(1)
    .max(5 * 1024),
  codeRight: z
    .string()
    .min(1)
    .max(5 * 1024),
  snippetWidth: z.number().min(1).max(5000),
  yPadding: z.number().min(0).max(200),
  xPadding: z.number().min(0).max(200),
  shadowEnabled: z.boolean(),
  shadowOffsetY: z.number().min(0).max(200),
  shadowBlur: z.number().min(1).max(200),
  shadowColor: z.string().min(1).max(30),
  shadowOpacity: z.number().min(0).max(1),
  bgType: z.enum(['solid', 'linearGradient']),
  bgGradientColorStart: z.string().min(1).max(30),
  bgGradientColorEnd: z.string().min(1).max(30),
  bgGradientDirection: z.number().min(0).max(360),
  bgColor: z.string().min(1).max(30),
  language: z.string().min(1).max(64),
  theme: z.string().min(1).max(64),
  fontSize: z.number().min(1).max(64),
  fontFamily: z.string().min(1).max(64),
})
