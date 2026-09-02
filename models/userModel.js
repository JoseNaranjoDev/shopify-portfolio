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

export function findByEmail(email) {
  const stmt = db.prepare(
    "SELECT id, name, email, password, role, created_at FROM users WHERE email = ? COLLATE NOCASE"
  );
  stmt.bind([String(email || "").trim()]);
  return rowFromStmt(stmt);
}

export function findById(id) {
  const stmt = db.prepare(
    "SELECT id, name, email, password, role, created_at FROM users WHERE id = ?"
  );
  stmt.bind([Number(id)]);
  return rowFromStmt(stmt);
}

export function listUsers() {
  const stmt = db.prepare(
    "SELECT id, name, email, role, created_at FROM users ORDER BY id"
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

export const dbFilePath = dbPath;
