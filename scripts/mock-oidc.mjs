// Local-development-only mock OIDC provider for testing Hibiscus authentication.
// Do not use in production: accepts arbitrary test users without credentials.
import { createHash, generateKeyPairSync, randomBytes, sign } from 'node:crypto'
import { createServer } from 'node:http'

const port = Number(process.env.PORT || 4100)
const host = '127.0.0.1'
const issuer = `http://${host}:${port}`
const expectedClientId = process.env.OIDC_CLIENT_ID || 'hibiscus-local'
const expectedClientSecret = process.env.OIDC_CLIENT_SECRET || 'hibiscus-local-secret'

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const publicJwk = { ...publicKey.export({ format: 'jwk' }), kid: 'local-mock-key', use: 'sig', alg: 'RS256' }
const authCodes = new Map()

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function readFormBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(new URLSearchParams(Buffer.concat(chunks).toString('utf8'))))
    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(payload))
}

function verifyClientCredentials(req, params) {
  const auth = req.headers.authorization
  if (typeof auth === 'string' && auth.startsWith('Basic ')) {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8')
    const sep = decoded.indexOf(':')
    if (sep < 0) return false
    const clientId = decodeURIComponent(decoded.slice(0, sep))
    const clientSecret = decodeURIComponent(decoded.slice(sep + 1))
    return clientId === expectedClientId && clientSecret === expectedClientSecret
  }
  return params.get('client_id') === expectedClientId && params.get('client_secret') === expectedClientSecret
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', issuer)

  if (req.method === 'GET' && url.pathname === '/.well-known/openid-configuration') {
    return sendJson(res, 200, {
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      jwks_uri: `${issuer}/jwks`,
      response_types_supported: ['code'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      scopes_supported: ['openid', 'profile', 'email'],
    })
  }

  if (req.method === 'GET' && url.pathname === '/jwks') {
    return sendJson(res, 200, { keys: [publicJwk] })
  }

  if (req.method === 'GET' && url.pathname === '/authorize') {
    const clientId = url.searchParams.get('client_id') || ''
    const redirectUri = url.searchParams.get('redirect_uri') || ''
    const state = url.searchParams.get('state') || ''
    const nonce = url.searchParams.get('nonce') || ''
    const codeChallenge = url.searchParams.get('code_challenge') || ''
    const codeChallengeMethod = url.searchParams.get('code_challenge_method') || ''

    if (clientId !== expectedClientId || !redirectUri || !state) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
      return res.end('Invalid authorization request')
    }

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Local Mock OIDC</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #111113; color: #edeef0; font-family: system-ui, -apple-system, sans-serif; }
    form { width: min(24rem, 90vw); padding: 1.5rem; border-radius: 0.75rem; background: #18191b; border: 1px solid #2e3135; display: grid; gap: 1rem; }
    h1 { margin: 0; font-size: 1.25rem; }
    p { margin: 0; color: #b0b4ba; font-size: 0.875rem; }
    label { display: grid; gap: 0.375rem; font-size: 0.875rem; }
    input[type="text"] { padding: 0.625rem 0.75rem; border-radius: 0.5rem; border: 1px solid #363a3f; background: #111113; color: #edeef0; font-size: 0.9375rem; }
    button { padding: 0.6875rem 1rem; border-radius: 0.5rem; border: 0; background: #e54666; color: #fff; font-weight: 600; font-size: 0.9375rem; cursor: pointer; }
  </style>
</head>
<body>
  <form method="post" action="/authorize">
    <h1>Local Mock OIDC</h1>
    <p>Sign in as any test user to continue to Hibiscus.</p>
    <input type="hidden" name="client_id" value="${escapeHtml(clientId)}" />
    <input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}" />
    <input type="hidden" name="state" value="${escapeHtml(state)}" />
    <input type="hidden" name="nonce" value="${escapeHtml(nonce)}" />
    <input type="hidden" name="code_challenge" value="${escapeHtml(codeChallenge)}" />
    <input type="hidden" name="code_challenge_method" value="${escapeHtml(codeChallengeMethod)}" />
    <label>
      Display name
      <input type="text" name="name" value="Vespera" required />
    </label>
    <label>
      Subject ID
      <input type="text" name="sub" value="local-user-1" required />
    </label>
    <button type="submit">Sign in</button>
  </form>
</body>
</html>`
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    return res.end(html)
  }

  if (req.method === 'POST' && url.pathname === '/authorize') {
    const form = await readFormBody(req)
    const clientId = form.get('client_id') || ''
    const redirectUri = form.get('redirect_uri') || ''
    const state = form.get('state') || ''
    const nonce = form.get('nonce') || ''
    const codeChallenge = form.get('code_challenge') || ''
    const codeChallengeMethod = form.get('code_challenge_method') || ''
    const name = (form.get('name') || 'Vespera').trim() || 'Vespera'
    const sub = (form.get('sub') || 'local-user-1').trim() || 'local-user-1'

    if (clientId !== expectedClientId || !redirectUri || !state) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
      return res.end('Invalid authorization submission')
    }

    const code = randomBytes(24).toString('base64url')
    authCodes.set(code, {
      clientId,
      redirectUri,
      nonce,
      codeChallenge,
      codeChallengeMethod,
      name,
      sub,
      expiresAt: Date.now() + 5 * 60 * 1000,
    })

    const target = new URL(redirectUri)
    target.searchParams.set('code', code)
    target.searchParams.set('state', state)
    res.writeHead(302, { location: target.toString(), 'cache-control': 'no-store' })
    return res.end()
  }

  if (req.method === 'POST' && url.pathname === '/token') {
    const form = await readFormBody(req)
    if (!verifyClientCredentials(req, form)) {
      return sendJson(res, 401, { error: 'invalid_client' })
    }
    if (form.get('grant_type') !== 'authorization_code') {
      return sendJson(res, 400, { error: 'unsupported_grant_type' })
    }

    const code = form.get('code') || ''
    const entry = authCodes.get(code)
    authCodes.delete(code)

    if (!entry || entry.expiresAt <= Date.now()) {
      return sendJson(res, 400, { error: 'invalid_grant' })
    }
    if (form.get('redirect_uri') !== entry.redirectUri) {
      return sendJson(res, 400, { error: 'invalid_grant' })
    }
    if (entry.codeChallenge) {
      if (entry.codeChallengeMethod !== 'S256') {
        return sendJson(res, 400, { error: 'invalid_grant' })
      }
      const verifier = form.get('code_verifier') || ''
      const expectedChallenge = createHash('sha256').update(verifier, 'utf8').digest('base64url')
      if (expectedChallenge !== entry.codeChallenge) {
        return sendJson(res, 400, { error: 'invalid_grant' })
      }
    }

    const now = Math.floor(Date.now() / 1000)
    const header = base64urlJson({ alg: 'RS256', typ: 'JWT', kid: 'local-mock-key' })
    const payload = base64urlJson({
      iss: issuer,
      sub: entry.sub,
      aud: entry.clientId,
      ...(entry.nonce ? { nonce: entry.nonce } : {}),
      iat: now,
      exp: now + 3600,
      name: entry.name,
      preferred_username: entry.sub,
      email: `${entry.sub}@local.test`,
    })
    const unsigned = `${header}.${payload}`
    const signature = sign('RSA-SHA256', Buffer.from(unsigned, 'utf8'), privateKey).toString('base64url')

    return sendJson(res, 200, {
      access_token: randomBytes(24).toString('base64url'),
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: `${unsigned}.${signature}`,
    })
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
  res.end('Not found')
})

server.listen(port, host, () => {
  console.log(`Mock OIDC listening at ${issuer}`)
})
