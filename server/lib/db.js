import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'reset.db')

// Ensure data directory exists
import fs from 'fs'
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    raw_answers TEXT NOT NULL,
    derived_signals TEXT,
    interpreted_profile TEXT,
    blueprint_data TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// ─── Operations ──────────────────────────────────────────────────────────────

const insertSession = db.prepare(`
  INSERT INTO sessions (id, raw_answers, status)
  VALUES (?, ?, 'pending')
`)

const updateSignals = db.prepare(`
  UPDATE sessions SET derived_signals = ?, updated_at = datetime('now') WHERE id = ?
`)

const updateInterpretation = db.prepare(`
  UPDATE sessions SET interpreted_profile = ?, status = 'interpreted', updated_at = datetime('now') WHERE id = ?
`)

const updateBlueprint = db.prepare(`
  UPDATE sessions SET blueprint_data = ?, status = 'complete', updated_at = datetime('now') WHERE id = ?
`)

const updateError = db.prepare(`
  UPDATE sessions SET error = ?, status = 'error', updated_at = datetime('now') WHERE id = ?
`)

const getSession = db.prepare(`
  SELECT * FROM sessions WHERE id = ?
`)

export function createSession(rawAnswers) {
  const id = randomUUID()
  insertSession.run(id, JSON.stringify(rawAnswers))
  return id
}

export function saveSignals(id, signals) {
  updateSignals.run(JSON.stringify(signals), id)
}

export function saveInterpretation(id, profile) {
  updateInterpretation.run(JSON.stringify(profile), id)
}

export function saveBlueprint(id, blueprint) {
  updateBlueprint.run(JSON.stringify(blueprint), id)
}

export function saveError(id, error) {
  updateError.run(typeof error === 'string' ? error : JSON.stringify(error), id)
}

export function fetchSession(id) {
  const row = getSession.get(id)
  if (!row) return null
  return {
    ...row,
    raw_answers:         row.raw_answers ? JSON.parse(row.raw_answers) : null,
    derived_signals:     row.derived_signals ? JSON.parse(row.derived_signals) : null,
    interpreted_profile: row.interpreted_profile ? JSON.parse(row.interpreted_profile) : null,
    blueprint_data:      row.blueprint_data ? JSON.parse(row.blueprint_data) : null,
  }
}

export default db
