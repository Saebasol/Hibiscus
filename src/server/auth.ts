import { randomBytes } from 'node:crypto'
import { env } from 'node:process'
import * as oidc from 'openid-client'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type HibiscusDatabase from './database.js'
import type { AuthUser } from './database.js'

const SESSION_COOKIE = 'hibiscus_session'
const OIDC_COOKIE = 'hibiscus_oidc'
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60
const MAX_PENDING_OIDC_STATES = 5

export { SESSION_COOKIE }

// Fastify shares these decorations with the React route context on the server.
declare module 'fastify' {
  interface FastifyInstance {
    authEnabled: boolean
    authProviderName: string
  }

  interface FastifyRequest {
    user: AuthUser | null
  }
}

export type OidcClientAuthMethod = 'client_secret_basic' | 'client_secret_post'

export type OidcConfig = {
  issuer: string
  clientId: string
  clientSecret: string
  clientAuthMethod: OidcClientAuthMethod
  scopes: string
  allowInsecure: boolean
}

function stringClaim(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function safeReturnTo(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/list/1'
  const hasControlCharacters = Array.from(value).some(character => {
    const code = character.codePointAt(0) ?? 0
    return code < 32 || code === 127
  })
  return hasControlCharacters ? '/list/1' : value
}

export function safeAvatarUrl(value: unknown, allowInsecure = false): string | null {
  const candidate = stringClaim(value)
  if (!candidate) return null
  try {
    const url = new URL(candidate)
    if (url.protocol === 'https:' || (allowInsecure && url.protocol === 'http:')) {
      return url.toString()
    }
    return null
  } catch {
    return null
  }
}

function publicOrigin(request: FastifyRequest): string {
  const publicUrl = env.PUBLIC_URL?.trim()
  return publicUrl ? new URL(publicUrl).origin : request.baseUrl
}

export function isSameOrigin(request: FastifyRequest): boolean {
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin) return origin === publicOrigin(request)
  const referer = request.headers.referer
  if (referer) {
    try {
      return new URL(referer).origin === publicOrigin(request)
    } catch {
      return false
    }
  }
  return true
}

export function readOidcConfig(): OidcConfig | null {
  const issuer = env.OIDC_ISSUER_URL?.trim()
  const clientId = env.OIDC_CLIENT_ID?.trim()
  const clientSecret = env.OIDC_CLIENT_SECRET?.trim()
  const supplied = [issuer, clientId, clientSecret].filter(Boolean).length

  if (supplied > 0 && supplied < 3) {
    throw new Error('OIDC_ISSUER_URL, OIDC_CLIENT_ID, and OIDC_CLIENT_SECRET must be configured together')
  }

  const publicUrl = env.PUBLIC_URL?.trim()
  if (publicUrl) {
    const protocol = new URL(publicUrl).protocol
    if (protocol !== 'https:' && protocol !== 'http:') throw new Error('PUBLIC_URL must use HTTP or HTTPS')
  }

  if (!issuer || !clientId || !clientSecret) return null

  const allowInsecure = env.OIDC_ALLOW_INSECURE === 'true'
  const issuerProtocol = new URL(issuer).protocol
  if (issuerProtocol !== 'https:' && !(allowInsecure && issuerProtocol === 'http:')) {
    throw new Error('OIDC_ISSUER_URL must use HTTPS unless OIDC_ALLOW_INSECURE=true')
  }

  const clientAuthMethod = env.OIDC_CLIENT_AUTH_METHOD?.trim() || 'client_secret_basic'
  if (clientAuthMethod !== 'client_secret_basic' && clientAuthMethod !== 'client_secret_post') {
    throw new Error('OIDC_CLIENT_AUTH_METHOD must be client_secret_basic or client_secret_post')
  }

  return {
    issuer,
    clientId,
    clientSecret,
    clientAuthMethod,
    scopes: env.OIDC_SCOPES?.trim() || 'openid profile email',
    allowInsecure,
  }
}

function appendVaryCookie(existing: number | string | string[] | undefined): string {
  const values = (Array.isArray(existing) ? existing : existing !== undefined ? [String(existing)] : [])
    .flatMap(entry => entry.split(','))
    .map(entry => entry.trim())
    .filter(Boolean)

  if (values.some(entry => entry === '*' || entry.toLowerCase() === 'cookie')) {
    return values.join(', ')
  }
  return [...values, 'Cookie'].join(', ')
}

function parseOidcStates(value: string | undefined): string[] {
  if (!value) return []
  return value.split('.').map(entry => entry.trim()).filter(Boolean).slice(-MAX_PENDING_OIDC_STATES)
}

export async function registerAuth(server: FastifyInstance, database: HibiscusDatabase | null) {
  const config = readOidcConfig()

  server.decorate('authEnabled', Boolean(config))
  server.decorate('authProviderName', (env.OIDC_PROVIDER_NAME?.trim() || 'Identity provider').slice(0, 80))
  server.decorateRequest('user', null)

  if (!config) return
  if (!database) throw new Error('Database is required when OIDC authentication is enabled')

  server.addHook('onRequest', async request => {
    request.user = null
    if (!server.authEnabled) return
    const token = request.cookies[SESSION_COOKIE]
    if (token) request.user = database.findUserBySessionToken(token)
  })

  server.addHook('onSend', async (_request, reply, payload) => {
    const contentType = reply.getHeader('content-type')
    if (typeof contentType === 'string' && contentType.toLowerCase().startsWith('text/html')) {
      reply.header('cache-control', 'private, no-store')
      reply.header('vary', appendVaryCookie(reply.getHeader('vary')))
    }
    return payload
  })

  const clientAuthentication = config.clientAuthMethod === 'client_secret_basic'
    ? oidc.ClientSecretBasic(config.clientSecret)
    : oidc.ClientSecretPost(config.clientSecret)

  let configurationPromise: Promise<oidc.Configuration> | undefined
  const getConfiguration = () => {
    const discoveryOptions = config.allowInsecure ? { execute: [oidc.allowInsecureRequests] } : undefined
    configurationPromise ??= oidc.discovery(new URL(config.issuer), config.clientId, config.clientSecret, clientAuthentication, discoveryOptions).then(configuration => {
      if (config.allowInsecure) oidc.allowInsecureRequests(configuration)
      return configuration
    }).catch(error => {
      configurationPromise = undefined
      throw error
    })
    return configurationPromise
  }

  server.get<{ Querystring: { returnTo?: string } }>('/auth/login', async (request, reply) => {
    const returnTo = safeReturnTo(request.query.returnTo)
    if (request.user) return reply.redirect(returnTo)
    reply.header('cache-control', 'no-store')

    try {
      const configuration = await getConfiguration()
      const codeVerifier = oidc.randomPKCECodeVerifier()
      const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier)
      const state = oidc.randomState()
      const nonce = oidc.randomNonce()
      const redirectUri = new URL('/auth/callback', publicOrigin(request)).toString()
      const secure = new URL(redirectUri).protocol === 'https:'

      database.createOidcRequest({ state, codeVerifier, nonce, redirectUri, returnTo })
      const authorizationUrl = oidc.buildAuthorizationUrl(configuration, {
        redirect_uri: redirectUri,
        scope: config.scopes,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
        nonce,
      })
      const states = [...parseOidcStates(request.cookies[OIDC_COOKIE]), state].slice(-MAX_PENDING_OIDC_STATES)
      reply.setCookie(OIDC_COOKIE, states.join('.'), {
        path: '/auth', httpOnly: true, sameSite: 'lax', secure, maxAge: 600,
      })
      return reply.redirect(authorizationUrl.toString())
    } catch (error) {
      request.log.warn({ err: error }, 'OIDC discovery or authorization redirect failed')
      return reply.redirect('/login?error=discovery')
    }
  })

  server.get('/auth/callback', async (request, reply) => {
    reply.header('cache-control', 'no-store')
    if (request.user) {
      reply.clearCookie(OIDC_COOKIE, { path: '/auth' })
      return reply.redirect('/list/1')
    }

    const state = (request.query as { state?: unknown }).state
    const browserStates = parseOidcStates(request.cookies[OIDC_COOKIE])
    const pending = typeof state === 'string' && browserStates.includes(state) ? database.consumeOidcRequest(state) : null
    const remainingStates = typeof state === 'string' ? browserStates.filter(entry => entry !== state) : browserStates
    if (remainingStates.length > 0) {
      const secureCookie = (pending ? new URL(pending.redirectUri) : new URL(publicOrigin(request))).protocol === 'https:'
      reply.setCookie(OIDC_COOKIE, remainingStates.join('.'), {
        path: '/auth', httpOnly: true, sameSite: 'lax', secure: secureCookie, maxAge: 600,
      })
    } else {
      reply.clearCookie(OIDC_COOKIE, { path: '/auth' })
    }
    if (!pending || typeof state !== 'string') return reply.redirect('/login?error=invalid_request')

    try {
      const configuration = await getConfiguration()
      const currentUrl = new URL(request.url, pending.redirectUri)
      const tokens = await oidc.authorizationCodeGrant(configuration, currentUrl, {
        expectedState: state,
        expectedNonce: pending.nonce,
        pkceCodeVerifier: pending.codeVerifier,
      })
      const claims = tokens.claims()
      if (!claims) throw new Error('The identity provider did not return an ID token')

      const user = database.findOrCreateUser({
        issuer: claims.iss,
        subject: claims.sub,
        displayName: stringClaim(claims.name) ?? stringClaim(claims.preferred_username) ?? stringClaim(claims.email),
        avatarUrl: safeAvatarUrl(claims.picture, config.allowInsecure),
      })
      const token = randomBytes(32).toString('base64url')
      const expiresAt = database.createSession(user.id, token, SESSION_TTL_SECONDS)
      reply.setCookie(SESSION_COOKIE, token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: new URL(pending.redirectUri).protocol === 'https:',
        maxAge: SESSION_TTL_SECONDS,
        expires: new Date(expiresAt),
      })
      return reply.redirect(pending.returnTo)
    } catch (error) {
      request.log.warn({ err: error }, 'OIDC callback failed')
      return reply.redirect('/login?error=callback')
    }
  })

  server.post('/auth/logout', async (request, reply) => {
    if (!isSameOrigin(request)) return reply.code(403).send({ error: 'Cross-origin request rejected' })
    const token = request.cookies[SESSION_COOKIE]
    if (token) database.deleteSession(token)
    reply.header('cache-control', 'no-store')
      .clearCookie(SESSION_COOKIE, { path: '/' })
      .clearCookie(OIDC_COOKIE, { path: '/auth' })
    return reply.redirect('/list/1')
  })
}
