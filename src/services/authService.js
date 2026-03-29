import bcrypt from "bcryptjs";
import crypto from "crypto";
import AppError from "../utils/appError.js";
import { findUserByEmail, createUser, saveRefreshToken, findRefreshToken, deleteRefreshToken, findUserById } from "../models/user.model.js";
import config from "../config.js";
import jwt from "jsonwebtoken";

export async function register(email, password) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Электронный адрес уже используется.", 400);
  }
  const passwordHash = await bcrypt.hash(password, 12);
  return await createUser(email, passwordHash, "user");
}

export async function login(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("Неверный электронный адрес или пароль.", 401);
  }
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new AppError("Неверный электронный адрес или пароль.", 401);
  }
  return user;
}

export async function generateRefreshToken(userId) {
  const rawToken = crypto.randomBytes(64).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await saveRefreshToken(userId, tokenHash, expiresAt);
  return rawToken;
}
export async function rotateRefreshToken(rawToken) {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const stored = await findRefreshToken(tokenHash);

  if (!stored || new Date(stored.expires_at) < new Date()) {
    throw new AppError("Недействительный или истёкший токен обновления", 401);
  }

  await deleteRefreshToken(tokenHash);

  const user = await findUserById(stored.user_id);
  if (!user) throw new AppError("Пользователь не найден", 401);

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const newRawRefreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken: newRawRefreshToken };
}

export async function revokeRefreshToken(rawToken) {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  await deleteRefreshToken(tokenHash);
}
