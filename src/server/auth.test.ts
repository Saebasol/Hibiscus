import { strict as assert } from 'node:assert'
import { createHash, generateKeyPairSync, sign } from 'node:crypto'
import { env } from 'node:process'
import test from 'node:test'
import Fastify from 'fastify'
import FastifyCookie from '@fastify/cookie'
import FastifyFormbody from '@fastify/formbody'
import HibiscusDatabase from './database.js'
import { readOidcConfig, registerAuth, safeAvatarUrl, safeReturnTo, SESSION_COOKIE } from './auth.js'
import { registerBookmarkRoutes } from './bookmarks.js'

const publicOrigin = 'http://hibiscus.example'
const clientId = 'hibiscus-test'
const clientSecret = 'test-secret'

function encoded(value: string | object) {
  return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url')
}

function responseCookie(response: { headers: Record<string, unknown> }, name: string): string {
  const headers = response.headers['set-cookie']
  const cookies = Array.isArray(headers) ? headers : [headers]
  const cookie = cookies.find(value => typeof value === 'string' && value.startsWith(name + '='))
  assert.equal(typeof cookie, 'string')
  return (cookie as string).split(';', 1)[0]
}

function preserveEnvironment(t: { after: (callback: () => void) => void }) {
  const names = ['PUBLIC_URL', 'OIDC_ISSUER_URL', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'OIDC_PROVIDER_NAME', 'OIDC_SCOPES', 'OIDC_ALLOW_INSECURE', 'OIDC_CLIENT_AUTH_METHOD']
  const previous = names.map(name => [name, env[name]] as const)
  t.after(() => {
    for (const [name, value] of previous) {
      if (value === undefined) delete env[name]
      else env[name] = value
    }
  })
}

test('OIDC and bookmark routes support a complete signed-in session', async t => {
  preserveEnvironment(t)
  delete env.OIDC_ISSUER_URL
  delete env.OIDC_CLIENT_ID
  delete env.OIDC_CLIENT_SECRET
  env.PUBLIC_URL = publicOrigin

  const publicDatabase = new HibiscusDatabase(':memory:')
  const oldUser = publicDatabase.findOrCreateUser({ issuer: 'https://old.example', subject: 'old-user', displayName: 'Old User', avatarUrl: null })
  publicDatabase.createSession(oldUser.id, 'disabled-session', 60)
  publicDatabase.addBookmark(oldUser.id, 999, 'Must stay private')
  const publicApp = Fastify({ logger: false })
  await publicApp.register(FastifyCookie)
  await publicApp.register(FastifyFormbody)
  assert.equal(readOidcConfig(), null)
  await registerAuth(publicApp, null)
  publicApp.get('/public', async () => ({ public: true }))
  publicApp.get('/html', async (_request, reply) => reply.type('text/html; charset=utf-8').send('<html></html>'))
  registerBookmarkRoutes(publicApp, null)

  const existingDbApp = Fastify({ logger: false })
  await existingDbApp.register(FastifyCookie)
  await existingDbApp.register(FastifyFormbody)
  await registerAuth(existingDbApp, publicDatabase)
  registerBookmarkRoutes(existingDbApp, publicDatabase)
  t.after(async () => {
    await publicApp.close()
    await existingDbApp.close()
    publicDatabase.close()
  })

  assert.equal((await publicApp.inject('/public')).statusCode, 200)
  const publicHtml = await publicApp.inject('/html')
  assert.equal(publicHtml.statusCode, 200)
  assert.notEqual(publicHtml.headers['cache-control'], 'private, no-store')
  assert.equal((await publicApp.inject('/auth/login')).statusCode, 404)
  assert.equal((await publicApp.inject('/internal/bookmarks')).statusCode, 401)
  const disabledCookie = 'hibiscus_session=disabled-session'
  for (const disabledApp of [publicApp, existingDbApp]) {
    assert.equal((await disabledApp.inject({ url: '/internal/bookmarks', headers: { cookie: disabledCookie } })).statusCode, 401)
    assert.equal((await disabledApp.inject({
      method: 'PUT', url: '/internal/bookmarks/999',
      headers: { cookie: disabledCookie, origin: publicOrigin, 'content-type': 'application/json' }, payload: { title: 'Blocked' },
    })).statusCode, 401)
  }
  assert.equal(publicDatabase.listBookmarks(oldUser.id)[0].title, 'Must stay private')

  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const provider = Fastify({ logger: false })
  await provider.register(FastifyFormbody)
  let issuer = ''
  let authorization: URL | undefined
  let tokenRequests = 0

  provider.get('/.well-known/openid-configuration', async () => ({
    issuer,
    authorization_endpoint: issuer + '/authorize',
    token_endpoint: issuer + '/token',
    jwks_uri: issuer + '/jwks',
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['client_secret_basic'],
  }))
  provider.get('/jwks', async () => ({
    keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'hibiscus-test-key', use: 'sig', alg: 'RS256' }],
  }))
  provider.post('/token', async (request, reply) => {
    tokenRequests++
    assert.ok(authorization)
    const body = request.body as Record<string, string>
    assert.equal(body.grant_type, 'authorization_code')
    assert.equal(body.code, 'test-authorization-code')
    assert.equal(body.redirect_uri, publicOrigin + '/auth/callback')
    assert.equal(createHash('sha256').update(body.code_verifier).digest('base64url'), authorization.searchParams.get('code_challenge'))
    const basic = request.headers.authorization?.replace(/^Basic /, '')
    const [encodedClient, encodedSecret] = Buffer.from(basic ?? '', 'base64').toString().split(':')
    assert.equal(decodeURIComponent(encodedClient), clientId)
    assert.equal(decodeURIComponent(encodedSecret), clientSecret)

    const now = Math.floor(Date.now() / 1000)
    const header = encoded({ alg: 'RS256', typ: 'JWT', kid: 'hibiscus-test-key' })
    const payload = encoded({
      iss: issuer,
      sub: 'ory-user-123',
      aud: clientId,
      nonce: authorization.searchParams.get('nonce'),
      iat: now,
      exp: now + 300,
      name: 'OIDC Test User',
      picture: 'https://issuer.example/avatar.png',
    })
    const unsigned = header + '.' + payload
    const idToken = unsigned + '.' + sign('RSA-SHA256', Buffer.from(unsigned), privateKey).toString('base64url')
    return reply.send({ access_token: 'unused-access-token', token_type: 'Bearer', expires_in: 300, id_token: idToken })
  })
  issuer = await provider.listen({ host: '127.0.0.1', port: 0 })
  t.after(() => provider.close())

  Object.assign(env, {
    PUBLIC_URL: publicOrigin,
    OIDC_ISSUER_URL: issuer,
    OIDC_CLIENT_ID: clientId,
    OIDC_CLIENT_SECRET: clientSecret,
    OIDC_PROVIDER_NAME: 'Ory Test',
    OIDC_ALLOW_INSECURE: 'true',
    OIDC_CLIENT_AUTH_METHOD: 'client_secret_basic',
  })

  const database = new HibiscusDatabase(':memory:')
  const app = Fastify({ logger: false })
  await app.register(FastifyCookie)
  await app.register(FastifyFormbody)
  app.addHook('onRequest', async request => { request.baseUrl = publicOrigin })
  await registerAuth(app, database)
  registerBookmarkRoutes(app, database)
  app.get('/html', async (_request, reply) => reply.type('text/html; charset=utf-8').send('<html></html>'))
  t.after(async () => {
    await app.close()
    database.close()
  })

  const html = await app.inject('/html')
  assert.equal(html.statusCode, 200)
  assert.equal(html.headers['cache-control'], 'private, no-store')
  assert.match(String(html.headers.vary), /\bCookie\b/i)

  const login = await app.inject('/auth/login?returnTo=%2Fbookmarks')
  assert.equal(login.statusCode, 302)
  assert.equal(app.authProviderName, 'Ory Test')
  authorization = new URL(login.headers.location!)
  assert.equal(authorization.origin + authorization.pathname, issuer + '/authorize')
  assert.equal(authorization.searchParams.get('redirect_uri'), publicOrigin + '/auth/callback')
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256')
  assert.equal(authorization.searchParams.get('scope'), 'openid profile email')
  const state = authorization.searchParams.get('state')!
  const firstStateCookie = responseCookie(login, 'hibiscus_oidc')

  const secondLogin = await app.inject({ url: '/auth/login?returnTo=%2Flist%2F2', headers: { cookie: firstStateCookie } })
  assert.equal(secondLogin.statusCode, 302)
  const secondState = new URL(secondLogin.headers.location!).searchParams.get('state')!
  const stateCookie = responseCookie(secondLogin, 'hibiscus_oidc')
  assert.equal(stateCookie, `hibiscus_oidc=${state}.${secondState}`)

  const wrongBrowser = await app.inject({ method: 'GET', url: '/auth/callback?code=test-authorization-code&state=' + state, headers: { cookie: 'hibiscus_oidc=wrong' } })
  assert.equal(wrongBrowser.statusCode, 302)
  assert.equal(wrongBrowser.headers.location, '/login?error=invalid_request')

  const callback = await app.inject({ method: 'GET', url: '/auth/callback?code=test-authorization-code&state=' + state, headers: { cookie: stateCookie } })
  assert.equal(callback.statusCode, 302)
  assert.equal(callback.headers.location, '/bookmarks')
  assert.equal(responseCookie(callback, 'hibiscus_oidc'), `hibiscus_oidc=${secondState}`)
  assert.equal(tokenRequests, 1)
  const sessionCookie = responseCookie(callback, SESSION_COOKIE)
  assert.match(String(callback.headers['set-cookie']), /HttpOnly/i)
  assert.match(String(callback.headers['set-cookie']), /SameSite=Lax/i)

  const empty = await app.inject({ url: '/internal/bookmarks', headers: { cookie: sessionCookie } })
  assert.equal(empty.statusCode, 200)
  assert.deepEqual(empty.json(), { bookmarks: [] })

  const added = await app.inject({
    method: 'PUT', url: '/internal/bookmarks/123',
    headers: { cookie: sessionCookie, origin: publicOrigin, 'content-type': 'application/json' },
    payload: { title: 'A saved work' },
  })
  assert.equal(added.statusCode, 200)
  const listed = await app.inject({ url: '/internal/bookmarks', headers: { cookie: sessionCookie } })
  assert.equal(listed.json().bookmarks[0].workId, 123)
  assert.equal(listed.json().bookmarks[0].title, 'A saved work')

  const crossOrigin = await app.inject({
    method: 'DELETE', url: '/internal/bookmarks/123',
    headers: { cookie: sessionCookie, origin: 'https://attacker.example' },
  })
  assert.equal(crossOrigin.statusCode, 403)
  assert.equal((await app.inject({
    method: 'PUT', url: '/internal/bookmarks/123',
    headers: { cookie: sessionCookie, 'sec-fetch-site': 'cross-site', 'content-type': 'application/json' },
    payload: { title: 'Cross-site blocked' },
  })).statusCode, 403)
  assert.equal((await app.inject({
    method: 'PUT', url: '/internal/bookmarks/123',
    headers: { cookie: sessionCookie, referer: 'https://attacker.example/page', 'content-type': 'application/json' },
    payload: { title: 'Cross-origin referer blocked' },
  })).statusCode, 403)
  assert.equal(database.listBookmarks(1).length, 1)

  assert.equal((await app.inject({ url: '/internal/bookmarks' })).statusCode, 401)
  const removed = await app.inject({ method: 'DELETE', url: '/internal/bookmarks/123', headers: { cookie: sessionCookie, origin: publicOrigin } })
  assert.equal(removed.statusCode, 200)
  assert.deepEqual(database.listBookmarks(1), [])

  const logout = await app.inject({
    method: 'POST', url: '/auth/logout', payload: '',
    headers: { cookie: sessionCookie, origin: publicOrigin, 'content-type': 'application/x-www-form-urlencoded' },
  })
  assert.equal(logout.statusCode, 302)
  assert.equal((await app.inject({ url: '/internal/bookmarks', headers: { cookie: sessionCookie } })).statusCode, 401)

  const replay = await app.inject({ method: 'GET', url: '/auth/callback?code=test-authorization-code&state=' + state, headers: { cookie: stateCookie } })
  assert.equal(replay.headers.location, '/login?error=invalid_request')
  assert.equal(tokenRequests, 1)
})

test('return targets are limited to local paths', () => {
  assert.equal(safeReturnTo('/bookmarks?from=home'), '/bookmarks?from=home')
  for (const target of ['https://evil.example', '//evil.example', '/\\evil.example', 'bookmarks', '/line\nbreak', null, undefined]) {
    assert.equal(safeReturnTo(target), '/list/1')
  }
})

test('avatar URLs require safe HTTP(S) protocols and partial OIDC config is rejected', (t) => {
  preserveEnvironment(t)
  assert.equal(safeAvatarUrl('https://issuer.example/avatar.png'), 'https://issuer.example/avatar.png')
  assert.equal(safeAvatarUrl('http://issuer.example/avatar.png', false), null)
  assert.equal(safeAvatarUrl('http://issuer.example/avatar.png', true), 'http://issuer.example/avatar.png')
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'not-a-url', '', null, undefined]) {
    assert.equal(safeAvatarUrl(value, true), null)
  }

  env.OIDC_ISSUER_URL = 'https://issuer.example'
  delete env.OIDC_CLIENT_ID
  delete env.OIDC_CLIENT_SECRET
  assert.throws(() => readOidcConfig(), /configured together/)

  env.OIDC_ISSUER_URL = 'http://issuer.example'
  env.OIDC_CLIENT_ID = clientId
  env.OIDC_CLIENT_SECRET = clientSecret
  delete env.OIDC_ALLOW_INSECURE
  assert.throws(() => readOidcConfig(), /HTTPS/)

  env.OIDC_ALLOW_INSECURE = 'true'
  assert.equal(readOidcConfig()?.allowInsecure, true)
})
