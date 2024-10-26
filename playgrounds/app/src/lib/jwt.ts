import 'dotenv/config'
import jwt from 'jsonwebtoken'

const TOKEN_SIGNING_KEY = process.env.TOKEN_SIGNING_KEY!

console.log('Has quotes', TOKEN_SIGNING_KEY.matchAll(/"/g))

export function decodeToken(token: string) {
  return jwt.verify(token, TOKEN_SIGNING_KEY, {
    algorithms: ['RS512'],
  })
}

function encodeToken(
  user: {
    id: string
    email: string
    githubId: string
    githubUsername: string
    githubAvatarUrl: string
  },
  type: 'access' | 'refresh',
) {
  let expiresIn = '24h'
  if (type === 'refresh') {
    expiresIn = '7d'
  }

  return jwt.sign(
    {
      sub: { ...user },
      type,
    },
    TOKEN_SIGNING_KEY,
    { expiresIn, algorithm: 'RS512' },
  )
}

export function encodeAccessToken(user: any) {
  return encodeToken(user, 'access')
}
export function encodeRefreshToken(user: any) {
  return encodeToken(user, 'refresh')
}
