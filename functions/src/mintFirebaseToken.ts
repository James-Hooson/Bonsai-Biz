import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import jwt, { type JwtHeader, type SigningKeyCallback } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'dev-66bli1zciwkj4o0t.au.auth0.com'
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || 'iRSbxwoBIHgRSTRT8e3cJGXuEkmE0lEn'

const jwks = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
})

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err || !key) {
      callback(err ?? new Error('Signing key not found'))
      return
    }
    callback(null, key.getPublicKey())
  })
}

interface Auth0IdTokenPayload extends jwt.JwtPayload {
  sub: string
  email?: string
  email_verified?: boolean
}

function verifyAuth0IdToken(idToken: string): Promise<Auth0IdTokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getSigningKey,
      {
        algorithms: ['RS256'],
        audience: AUTH0_CLIENT_ID,
        issuer: `https://${AUTH0_DOMAIN}/`,
      },
      (err, decoded) => {
        if (err || !decoded || typeof decoded === 'string') {
          reject(err ?? new Error('Invalid token'))
          return
        }
        resolve(decoded as Auth0IdTokenPayload)
      }
    )
  })
}

export const mintFirebaseToken = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' })
    return
  }
  const idToken = authHeader.slice('Bearer '.length)

  try {
    const payload = await verifyAuth0IdToken(idToken)

    if (!payload.email || !payload.email_verified) {
      res.status(403).json({ error: 'Email not verified' })
      return
    }

    const firebaseToken = await admin.auth().createCustomToken(payload.sub, {
      email: payload.email,
    })

    res.json({ firebaseToken })
  } catch (error) {
    console.error('Error verifying Auth0 token:', error)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
})
