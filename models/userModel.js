import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import validator from "validator";
import initSqlJs from "sql.js";
import { AppError } from "../utils/appError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "server", "users.db");
const wasmPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "sql.js",
  "dist",
  "sql-wasm.wasm"
);

const SQL = await initSqlJs({
  wasmBinary: fs.readFileSync(wasmPath),
});

const db = fs.existsSync(dbPath)
  ? new SQL.Database(fs.readFileSync(dbPath))
  : new SQL.Database();

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user','admin')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

function ensureColumn(table, column, definition) {
  const info = db.exec(`PRAGMA table_info(${table})`);
  const cols = info.length ? info[0].values.map((row) => row[1]) : [];
  if (!cols.includes(column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("users", "last_login_at", "TEXT");

db.run(`
  CREATE TABLE IF NOT EXISTS page_visits (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL,
    visited_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS login_events (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    email TEXT,
    logged_in_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.run(
  `CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at)`
);
db.run(
  `CREATE INDEX IF NOT EXISTS idx_login_events_logged_in_at ON login_events(logged_in_at)`
);

persist();

function persist() {
  const data = db.export();
  const tmp = `${dbPath}.tmp`;
  fs.writeFileSync(tmp, Buffer.from(data));
  fs.renameSync(tmp, dbPath);
}

function rowFromStmt(stmt) {
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();
  return row;
}

function rowsFromStmt(stmt) {
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function countSince(table, timeColumn, sinceSql) {
  const stmt = db.prepare(
    `SELECT COUNT(*) AS n FROM ${table} WHERE ${timeColumn} >= ${sinceSql}`
  );
  const row = rowFromStmt(stmt);
  return Number(row?.n || 0);
}

export function findByEmail(email) {
  const stmt = db.prepare(
    "SELECT id, name, email, password, role, created_at, last_login_at FROM users WHERE email = ? COLLATE NOCASE"
  );
  stmt.bind([String(email || "").trim()]);
  return rowFromStmt(stmt);
}

export function findById(id) {
  const stmt = db.prepare(
    "SELECT id, name, email, password, role, created_at, last_login_at FROM users WHERE id = ?"
  );
  stmt.bind([Number(id)]);
  return rowFromStmt(stmt);
}

export function listUsers() {
  const stmt = db.prepare(
    "SELECT id, name, email, role, created_at, last_login_at FROM users ORDER BY id"
  );
  return rowsFromStmt(stmt);
}

export function countAdmins() {
  const stmt = db.prepare(
    "SELECT COUNT(*) AS n FROM users WHERE role = 'admin'"
  );
  const row = rowFromStmt(stmt);
  return Number(row?.n || 0);
}

function validateUserInput({ name, email, password, passwordConfirm, role }) {
  const trimmedName = String(name || "").trim();
  const trimmedEmail = String(email || "").trim().toLowerCase();
  if (!trimmedEmail || password === undefined || password === null || password === "") {
    throw new AppError("Please provide email and password.", 400);
  }
  if (!validator.isEmail(trimmedEmail)) {
    throw new AppError("Please provide a valid email.", 400);
  }
  if (String(password).length < 8) {
    throw new AppError("Password must be minimum of 8 characters.", 400);
  }
  if (passwordConfirm !== undefined && password !== passwordConfirm) {
    throw new AppError("Passwords are not the same!", 400);
  }
  if (trimmedName && (trimmedName.length < 3 || trimmedName.length > 38)) {
    throw new AppError("Username must be between 3 and 38 characters.", 400);
  }
  const resolvedRole = role || "user";
  if (resolvedRole !== "user" && resolvedRole !== "admin") {
    throw new AppError("Role must be either 'user' or 'admin'.", 400);
  }
  return {
    name: trimmedName,
    email: trimmedEmail,
    password: String(password),
    role: resolvedRole,
  };
}

export async function createUser(input) {
  const data = validateUserInput(input);
  const name = data.name || (data.role === "admin" ? "Admin" : "");
  if (!name) {
    throw new AppError("Please provide a Username.", 400);
  }
  const hash = await bcrypt.hash(data.password, 12);
  try {
    db.run(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, data.email, hash, data.role]
    );
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    if (/UNIQUE|unique/i.test(msg)) {
      throw new AppError("Email already in use.", 400);
    }
    throw err;
  }
  persist();
  return findByEmail(data.email);
}

export async function correctPassword(candidatePassword, userPassword) {
  return bcrypt.compare(candidatePassword, userPassword);
}

export function recordPageVisit(pathValue) {
  const cleaned = String(pathValue || "/").slice(0, 500);
  db.run("INSERT INTO page_visits (path, visited_at) VALUES (?, datetime('now'))", [
    cleaned,
  ]);
  persist();
}

export function recordLoginEvent(userId, email) {
  db.run(
    "UPDATE users SET last_login_at = datetime('now') WHERE id = ?",
    [Number(userId)]
  );
  db.run(
    "INSERT INTO login_events (user_id, email, logged_in_at) VALUES (?, ?, datetime('now'))",
    [Number(userId) || null, String(email || "").slice(0, 320)]
  );
  persist();
}

export function getAnalyticsSummary() {
  return {
    visits: {
      today: countSince(
        "page_visits",
        "visited_at",
        "datetime('now', 'start of day')"
      ),
      last7Days: countSince(
        "page_visits",
        "visited_at",
        "datetime('now', '-7 days')"
      ),
      last30Days: countSince(
        "page_visits",
        "visited_at",
        "datetime('now', '-30 days')"
      ),
    },
    logins: {
      today: countSince(
        "login_events",
        "logged_in_at",
        "datetime('now', 'start of day')"
      ),
      last7Days: countSince(
        "login_events",
        "logged_in_at",
        "datetime('now', '-7 days')"
      ),
      last30Days: countSince(
        "login_events",
        "logged_in_at",
        "datetime('now', '-30 days')"
      ),
    },
    windows: {
      today: "Today (UTC calendar day)",
      last7Days: "Last 7 days (rolling)",
      last30Days: "Last 30 days (rolling)",
    },
  };
}

export const dbFilePath = dbPath;
