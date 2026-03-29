import bcrypt from "bcryptjs"; //импорт библиотеки для хеширования паролей и их безопасного сравнения
import crypto from "crypto"; //импорт встроенного модуля node.js для работы с криптографией и генерации случайных строк
import AppError from "../utils/appError.js"; //импорт класса для создания кастомных ошибок с кодами состояния
import { findUserByEmail, createUser, saveRefreshToken, findRefreshToken, deleteRefreshToken, findUserById } from "../models/user.model.js"; //импорт всех необходимых функций для прямой работы с таблицами пользователей и токенов в базе
import config from "../config.js"; //импорт настроек (секретные ключи, время жизни токенов)
import jwt from "jsonwebtoken"; //импорт модуля для создания и проверки access-токенов

export async function register(email, password) { //функция регистрации нового пользователя
  const existingUser = await findUserByEmail(email); //проверка в базе, не занята ли уже эта почта
  if (existingUser) { ///если почта занята, прерываем выполнение с ошибкой 400
    throw new AppError("Электронный адрес уже используется.", 400);
  }
  const passwordHash = await bcrypt.hash(password, 12); //превращаем пароль в безопасный хеш с коэффициентом сложности 12
  return await createUser(email, passwordHash, "user");  //сохранение нового пользователя в базу данных с ролью по умолчанию и получение его id
}

export async function login(email, password) { //объявление функции для авторизации пользователя
  const user = await findUserByEmail(email);  //поиск пользователя в базе по введенному email
  if (!user) { //если пользователь не найден в системе
    throw new AppError("Неверный электронный адрес или пароль.", 401); //выброс ошибки о неверных данных со статус-кодом 401
  }
  const passwordMatch = await bcrypt.compare(password, user.password_hash); //сравнение введенного пароля с тем, что хранится в базе (хешем)
  if (!passwordMatch) { //если пароли не совпали
    throw new AppError("Неверный электронный адрес или пароль.", 401); //выброс аналогичной ошибки безопасности
  }
  return user; //если всё верно, возвращаем объект пользователя
}

export async function generateRefreshToken(userId) { //функция создания долгоживущего токена обновления
  const rawToken = crypto.randomBytes(64).toString("hex"); //генерация случайной строки из 64 байт в формате hex
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex"); //создание sha256 хеша от этой строки для безопасного хранения в базе
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); //установка срока жизни токена на 7 дней от текущего момента
  await saveRefreshToken(userId, tokenHash, expiresAt); //сохранение хеша токена и срока его жизни в базу данных
  return rawToken; // возврат незахешированного токена клиенту
}
export async function rotateRefreshToken(rawToken) { //функция для замены старого рефреш-токена на новый
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex"); //превращаем полученный от клиента токен в хеш для поиска
  const stored = await findRefreshToken(tokenHash); //ищем этот хеш в базе данных

  if (!stored || new Date(stored.expires_at) < new Date()) { //существует ли токен и не просрочен ли он
    throw new AppError("Недействительный или истёкший токен обновления", 401); //если токен невалиден, выкидываем ошибку
  }

  await deleteRefreshToken(tokenHash); //удаляем старый токен из базы

  const user = await findUserById(stored.user_id); //ищем пользователя, которому принадлежал этот токен
  if (!user) throw new AppError("Пользователь не найден", 401); //если пользователь вдруг не найден, выдаем ошибку

  const accessToken = jwt.sign( //начало процесса подписи нового короткоживущего access-токена
    { id: user.id, role: user.role }, //полезные данные которые будут зашиты внутри токена
    config.jwt.secret, //использование секретного ключа из конфига для подписи
    { expiresIn: config.jwt.accessExpiresIn } // установка времени жизни access-токена из настроек
  ); 

  const newRawRefreshToken = await generateRefreshToken(user.id); //создаем абсолютно новый рефреш-токен для пользователя

  return { accessToken, refreshToken: newRawRefreshToken }; //возвращаем клиенту новую пару токенов
}

export async function revokeRefreshToken(rawToken) { //функция для выхода из системы (удаления токена)
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex"); //хешируем входящий токен
  await deleteRefreshToken(tokenHash); //удаляем его из базы данных, чтобы им больше нельзя было воспользоваться
}
