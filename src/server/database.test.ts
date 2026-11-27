import { strict as assert } from 'node:assert'
import test, { type TestContext } from 'node:test'
import type Database from 'better-sqlite3'
import HibiscusDatabase, { type AuthUser } from './database.js'

function useDatabase(t: TestContext): HibiscusDatabase {
  const database = new HibiscusDatabase(':memory:')
  t.after(() => database.close())
  return database
}

function createUser(database: HibiscusDatabase, subject = 'subject-1'): AuthUser {
  return database.findOrCreateUser({
    issuer: 'https://issuer.example',
    subject,
    displayName: 'Initial Name',
    avatarUrl: 'https://issuer.example/avatar.png',
  })
}

test('findOrCreateUser upserts the profile and uses issuer + subject identity', (t) => {
  const database = useDatabase(t)
  const created = createUser(database)

  assert.deepStrictEqual(created, {
    id: 1,
    issuer: 'https://issuer.example',
    subject: 'subject-1',
    displayName: 'Initial Name',
    avatarUrl: 'https://issuer.example/avatar.png',
  })

  const updated = database.findOrCreateUser({
    issuer: created.issuer,
    subject: created.subject,
    displayName: 'Updated Name',
    avatarUrl: null,
  })

  assert.strictEqual(updated.id, created.id)
  assert.strictEqual(updated.displayName, 'Updated Name')
  assert.strictEqual(updated.avatarUrl, null)

  const otherSubject = createUser(database, 'subject-2')
  const otherIssuer = database.findOrCreateUser({
    issuer: 'https://other-issuer.example',
    subject: created.subject,
    displayName: null,
    avatarUrl: null,
  })

  assert.notStrictEqual(otherSubject.id, created.id)
  assert.notStrictEqual(otherIssuer.id, created.id)
  assert.notStrictEqual(otherIssuer.id, otherSubject.id)
})

test('sessions resolve users and can be deleted idempotently', (t) => {
  const database = useDatabase(t)
  const user = createUser(database)
  const before = Date.now()
  const expiresAt = database.createSession(user.id, 'raw-session-token', 60)
  const after = Date.now()

  assert.ok(Number.isSafeInteger(expiresAt))
  assert.ok(expiresAt >= before + 60_000)
  assert.ok(expiresAt <= after + 60_000)
  assert.deepStrictEqual(database.findUserBySessionToken('raw-session-token'), user)
  assert.strictEqual(database.findUserBySessionToken('unknown-token'), null)

  database.deleteSession('raw-session-token')
  assert.strictEqual(database.findUserBySessionToken('raw-session-token'), null)
  assert.doesNotThrow(() => database.deleteSession('raw-session-token'))
})

test('an expired session is rejected and removed', (t) => {
  const database = useDatabase(t)
  const user = createUser(database)

  database.createSession(user.id, 'reused-token', 0)
  assert.strictEqual(database.findUserBySessionToken('reused-token'), null)

  assert.doesNotThrow(() => database.createSession(user.id, 'reused-token', 60))
  assert.deepStrictEqual(database.findUserBySessionToken('reused-token'), user)
})

test('OIDC requests are returned once and then consumed', (t) => {
  const database = useDatabase(t)
  const request = {
    codeVerifier: 'code-verifier',
    nonce: 'nonce-value',
    redirectUri: 'https://client.example/callback',
    returnTo: '/works/123',
  }

  database.createOidcRequest({ state: 'raw-oidc-state', ...request })

  assert.deepStrictEqual(database.consumeOidcRequest('raw-oidc-state'), request)
  assert.strictEqual(database.consumeOidcRequest('raw-oidc-state'), null)
  assert.strictEqual(database.consumeOidcRequest('unknown-state'), null)
})

test('expired OIDC requests are deleted without being returned', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1_000_000_000_000 })
  const database = useDatabase(t)
  const request = {
    codeVerifier: 'code-verifier',
    nonce: 'nonce-value',
    redirectUri: 'https://client.example/callback',
    returnTo: '/',
  }

  database.createOidcRequest({ state: 'expiring-state', ...request })
  t.mock.timers.tick(10 * 60 * 1000 + 1)

  assert.strictEqual(database.consumeOidcRequest('expiring-state'), null)
  assert.doesNotThrow(() => database.createOidcRequest({ state: 'expiring-state', ...request }))
  assert.deepStrictEqual(database.consumeOidcRequest('expiring-state'), request)
})

test('bookmarks are newest first and upserts preserve creation time', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 10_000 })
  const database = useDatabase(t)
  const user = createUser(database)

  database.addBookmark(user.id, 20, 'First title')
  t.mock.timers.tick(1_000)
  database.addBookmark(user.id, 10, 'Second title')
  t.mock.timers.tick(1_000)
  database.addBookmark(user.id, 30, 'Third title')

  assert.deepStrictEqual(database.listBookmarks(user.id), [
    { workId: 30, title: 'Third title', createdAt: 12_000 },
    { workId: 10, title: 'Second title', createdAt: 11_000 },
    { workId: 20, title: 'First title', createdAt: 10_000 },
  ])

  t.mock.timers.tick(1_000)
  database.addBookmark(user.id, 20, '  Updated title  ')
  assert.deepStrictEqual(database.listBookmarks(user.id), [
    { workId: 30, title: 'Third title', createdAt: 12_000 },
    { workId: 10, title: 'Second title', createdAt: 11_000 },
    { workId: 20, title: 'Updated title', createdAt: 10_000 },
  ])

  assert.strictEqual(database.removeBookmark(user.id, 10), true)
  assert.strictEqual(database.removeBookmark(user.id, 10), false)
  assert.deepStrictEqual(database.listBookmarks(user.id), [
    { workId: 30, title: 'Third title', createdAt: 12_000 },
    { workId: 20, title: 'Updated title', createdAt: 10_000 },
  ])
})

test('bookmarks validate IDs and titles before writing', (t) => {
  const database = useDatabase(t)
  const user = createUser(database)
  const invalidWorkIds = [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]

  for (const workId of invalidWorkIds) {
    assert.throws(() => database.addBookmark(user.id, workId, 'Valid title'), /workId/)
  }

  for (const title of ['', ' ', '\t\n']) {
    assert.throws(() => database.addBookmark(user.id, 123, title), /title/)
  }

  assert.throws(() => database.addBookmark(0, 123, 'Valid title'), /userId/)
  assert.deepStrictEqual(database.listBookmarks(user.id), [])
})

test('deleting a user cascades to bookmarks and sessions', (t) => {
  const database = useDatabase(t)
  const user = createUser(database)
  database.addBookmark(user.id, 123, 'Bookmark title')
  database.createSession(user.id, 'cascaded-session', 60)

  const internal = (database as unknown as { db: Database.Database }).db
  internal.prepare('DELETE FROM users WHERE id = ?').run(user.id)

  assert.deepStrictEqual(database.listBookmarks(user.id), [])
  assert.strictEqual(database.findUserBySessionToken('cascaded-session'), null)
})

test('creating new sessions and OIDC requests prunes expired rows', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: 1_000_000_000_000 })
  const database = useDatabase(t)
  const user = createUser(database)
  const internal = (database as unknown as { db: Database.Database }).db

  database.createSession(user.id, 'expired-session', 10)
  database.createOidcRequest({
    state: 'abandoned-state',
    codeVerifier: 'code-verifier',
    nonce: 'nonce-value',
    redirectUri: 'https://client.example/callback',
    returnTo: '/list/1',
  })

  t.mock.timers.tick(10 * 60 * 1000 + 1)
  database.createSession(user.id, 'fresh-session', 60)
  database.createOidcRequest({
    state: 'fresh-state',
    codeVerifier: 'code-verifier-2',
    nonce: 'nonce-value-2',
    redirectUri: 'https://client.example/callback',
    returnTo: '/bookmarks',
  })

  const sessionCount = internal.prepare('SELECT COUNT(*) AS count FROM sessions').get() as { count: number }
  const requestCount = internal.prepare('SELECT COUNT(*) AS count FROM oidc_requests').get() as { count: number }

  assert.strictEqual(sessionCount.count, 1)
  assert.strictEqual(requestCount.count, 1)
  assert.deepStrictEqual(database.findUserBySessionToken('fresh-session'), user)
  assert.strictEqual(database.consumeOidcRequest('abandoned-state'), null)
  assert.strictEqual(database.consumeOidcRequest('fresh-state')?.returnTo, '/bookmarks')
})

test('blurred tags normalize, deduplicate, and cascade on user deletion', (t) => {
  const database = useDatabase(t)
  const user = createUser(database)
  const internal = (database as unknown as { db: Database.Database }).db

  assert.strictEqual(database.addBlurredTag(user.id, '  Female:Guro '), 'female:guro')
  assert.strictEqual(database.addBlurredTag(user.id, 'female:guro'), 'female:guro')
  assert.strictEqual(database.addBlurredTag(user.id, 'guro'), 'guro')
  assert.deepStrictEqual(database.listBlurredTags(user.id), ['female:guro', 'guro'])

  for (const invalid of ['', '   ', 'x'.repeat(201)]) {
    assert.throws(() => database.addBlurredTag(user.id, invalid), /Tag/)
  }

  assert.strictEqual(database.removeBlurredTag(user.id, '  FEMALE:GURO '), true)
  assert.strictEqual(database.removeBlurredTag(user.id, 'female:guro'), false)
  assert.deepStrictEqual(database.listBlurredTags(user.id), ['guro'])

  internal.prepare('DELETE FROM users WHERE id = ?').run(user.id)
  assert.deepStrictEqual(database.listBlurredTags(user.id), [])
})
