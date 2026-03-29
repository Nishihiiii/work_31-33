import db from "../db/db.js";

export async function findUserByEmail(email) {
  const query = db.prepare("SELECT * FROM users WHERE email = ?");
  return query.get(email) || null;
}

export async function createUser(email, passwordHash, role) {
  const query = db.prepare(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)"
  );
  const result = query.run(email, passwordHash, role);
  return result.lastInsertRowid;
}

export async function findUserById(id) {
  const query = db.prepare("SELECT id, email, role, created_at, last_login FROM users WHERE id = ?");
  return query.get(id) || null;
}

export async function getAllUsers() {
  const query = db.prepare(
    "SELECT id, email, role, created_at, last_login FROM users"
  );
  return query.all();
}

export async function saveRefreshToken(userId, tokenHash, expiresAt) {
  const query = db.prepare(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)"
  );
  query.run(userId, tokenHash, expiresAt);
}

export async function findRefreshToken(tokenHash) {
  const query = db.prepare(
    "SELECT * FROM refresh_tokens WHERE token_hash = ?"
  );
  return query.get(tokenHash) || null;
}

export async function deleteRefreshToken(tokenHash) {
  const query = db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?");
  query.run(tokenHash);
}

export async function deleteAllRefreshTokensForUser(userId) {
  const query = db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?");
  query.run(userId);
}
