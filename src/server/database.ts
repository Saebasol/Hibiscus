import { createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'

export type AuthUser = {
  id: number
  issuer: string
  subject: string
  displayName: string | null
  avatarUrl: string | null
}

export type Bookmark = {
  workId: number
  title: string
  createdAt: number
}

export type OidcRequest = {
  codeVerifier: string
  nonce: string
  redirectUri: string
  returnTo: string
}

type UserRow = {
  id: number
  issuer: string
  subject: string
  display_name: string | null
  avatar_url: string | null
}

type SessionUserRow = UserRow & {
  expires_at: number
}

type OidcRequestRow = {
  code_verifier: string
  nonce: string
  redirect_uri: string
  return_to: string
  expires_at: number
}

type BookmarkRow = {
  work_id: number
  title: string
  created_at: number
}

const OIDC_REQUEST_TTL_MS = 10 * 60 * 1000

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    issuer: row.issuer,
    subject: row.subject,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  }
}

function assertPositiveSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive safe integer`)
  }
}

function normalizeTag(tag: string): string {
  const normalized = tag.trim().toLowerCase()
  if (!normalized || normalized.length > 200) {
    throw new Error('Tag must be between 1 and 200 characters')
  }
  return normalized
}

export default class HibiscusDatabase {
  private readonly db: Database.Database

  constructor(path: string) {
    if (path !== ':memory:') {
      mkdirSync(dirname(path), { recursive: true })
    }

    this.db = new Database(path)
    this.db.pragma('foreign_keys = ON')
    this.db.pragma('busy_timeout = 5000')
    if (path !== ':memory:') {
      this.db.pragma('journal_mode = WAL')
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issuer TEXT NOT NULL,
        subject TEXT NOT NULL,
        display_name TEXT,
        avatar_url TEXT,
        created_at INTEGER NOT NULL,
        last_login_at INTEGER NOT NULL,
        UNIQUE(issuer, subject)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS oidc_requests (
        state_hash TEXT PRIMARY KEY,
        code_verifier TEXT NOT NULL,
        nonce TEXT NOT NULL,
        redirect_uri TEXT NOT NULL,
        return_to TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
        work_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY(user_id, work_id)
      );

      CREATE TABLE IF NOT EXISTS blurred_tags (
        user_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
        tag TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY(user_id, tag)
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
        ON sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_oidc_requests_expires_at
        ON oidc_requests(expires_at);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created_at
        ON bookmarks(user_id, created_at DESC, work_id DESC);
      CREATE INDEX IF NOT EXISTS idx_blurred_tags_user_created_at
        ON blurred_tags(user_id, created_at ASC, tag ASC);
    `)

    this.pruneExpired()
  }

  close(): void {
    this.db.close()
  }

  pruneExpired(now = Date.now()): void {
    this.db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now)
    this.db.prepare('DELETE FROM oidc_requests WHERE expires_at <= ?').run(now)
  }

  findOrCreateUser(input: {
    issuer: string
    subject: string
    displayName: string | null
    avatarUrl: string | null
  }): AuthUser {
    const now = Date.now()
    const row = this.db.prepare(`
      INSERT INTO users (
        issuer, subject, display_name, avatar_url, created_at, last_login_at
      ) VALUES (
        @issuer, @subject, @displayName, @avatarUrl, @now, @now
      )
      ON CONFLICT(issuer, subject) DO UPDATE SET
        display_name = excluded.display_name,
        avatar_url = excluded.avatar_url,
        last_login_at = excluded.last_login_at
      RETURNING id, issuer, subject, display_name, avatar_url
    `).get({
      issuer: input.issuer,
      subject: input.subject,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
      now,
    }) as UserRow

    return toAuthUser(row)
  }

  createSession(userId: number, rawToken: string, ttlSeconds: number): number {
    const now = Date.now()
    const expiresAt = now + ttlSeconds * 1000

    this.db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now)
    this.db.prepare(`
      INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(sha256(rawToken), userId, expiresAt, now)

    return expiresAt
  }

  findUserBySessionToken(rawToken: string): AuthUser | null {
    const tokenHash = sha256(rawToken)

    return this.db.transaction((now: number): AuthUser | null => {
      const row = this.db.prepare(`
        SELECT
          users.id,
          users.issuer,
          users.subject,
          users.display_name,
          users.avatar_url,
          sessions.expires_at
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ?
      `).get(tokenHash) as SessionUserRow | undefined

      if (!row) return null

      if (row.expires_at <= now) {
        this.db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
        return null
      }

      return toAuthUser(row)
    })(Date.now())
  }

  deleteSession(rawToken: string): void {
    this.db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(rawToken))
  }

  createOidcRequest(input: {
    state: string
    codeVerifier: string
    nonce: string
    redirectUri: string
    returnTo: string
  }): void {
    const now = Date.now()

    this.db.prepare('DELETE FROM oidc_requests WHERE expires_at <= ?').run(now)
    this.db.prepare(`
      INSERT INTO oidc_requests (
        state_hash, code_verifier, nonce, redirect_uri, return_to, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      sha256(input.state),
      input.codeVerifier,
      input.nonce,
      input.redirectUri,
      input.returnTo,
      now + OIDC_REQUEST_TTL_MS,
    )
  }

  consumeOidcRequest(state: string): OidcRequest | null {
    const stateHash = sha256(state)

    return this.db.transaction((now: number): OidcRequest | null => {
      const row = this.db.prepare(`
        SELECT code_verifier, nonce, redirect_uri, return_to, expires_at
        FROM oidc_requests
        WHERE state_hash = ?
      `).get(stateHash) as OidcRequestRow | undefined

      if (!row) return null

      this.db.prepare('DELETE FROM oidc_requests WHERE state_hash = ?').run(stateHash)

      if (row.expires_at <= now) return null

      return {
        codeVerifier: row.code_verifier,
        nonce: row.nonce,
        redirectUri: row.redirect_uri,
        returnTo: row.return_to,
      }
    })(Date.now())
  }

  listBookmarks(userId: number): Bookmark[] {
    const rows = this.db.prepare(`
      SELECT work_id, title, created_at
      FROM bookmarks
      WHERE user_id = ?
      ORDER BY created_at DESC, work_id DESC
    `).all(userId) as BookmarkRow[]

    return rows.map((row) => ({
      workId: row.work_id,
      title: row.title,
      createdAt: row.created_at,
    }))
  }

  addBookmark(userId: number, workId: number, title: string): void {
    assertPositiveSafeInteger(userId, 'userId')
    assertPositiveSafeInteger(workId, 'workId')

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      throw new Error('Bookmark title must not be empty')
    }

    this.db.prepare(`
      INSERT INTO bookmarks (user_id, work_id, title, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, work_id) DO UPDATE SET
        title = excluded.title
    `).run(userId, workId, trimmedTitle, Date.now())
  }

  removeBookmark(userId: number, workId: number): boolean {
    const result = this.db.prepare(`
      DELETE FROM bookmarks WHERE user_id = ? AND work_id = ?
    `).run(userId, workId)

    return result.changes > 0
  }

  listBlurredTags(userId: number): string[] {
    const rows = this.db.prepare(`
      SELECT tag
      FROM blurred_tags
      WHERE user_id = ?
      ORDER BY created_at ASC, tag ASC
    `).all(userId) as { tag: string }[]

    return rows.map((row) => row.tag)
  }

  addBlurredTag(userId: number, tag: string): string {
    assertPositiveSafeInteger(userId, 'userId')
    const normalized = normalizeTag(tag)

    this.db.prepare(`
      INSERT INTO blurred_tags (user_id, tag, created_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, tag) DO NOTHING
    `).run(userId, normalized, Date.now())

    return normalized
  }

  removeBlurredTag(userId: number, tag: string): boolean {
    assertPositiveSafeInteger(userId, 'userId')
    const normalized = tag.trim().toLowerCase()
    if (!normalized) return false

    const result = this.db.prepare(`
      DELETE FROM blurred_tags WHERE user_id = ? AND tag = ?
    `).run(userId, normalized)

    return result.changes > 0
  }

  clearUserData(userId: number): void {
    assertPositiveSafeInteger(userId, 'userId')

    this.db.transaction(() => {
      this.db.prepare('DELETE FROM bookmarks WHERE user_id = ?').run(userId)
      this.db.prepare('DELETE FROM blurred_tags WHERE user_id = ?').run(userId)
    })()
  }

  deleteUser(userId: number): boolean {
    assertPositiveSafeInteger(userId, 'userId')

    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(userId)
    return result.changes > 0
  }
}
