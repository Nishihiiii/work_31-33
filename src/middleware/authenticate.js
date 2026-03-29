import jwt from "jsonwebtoken";
import config from "../config.js";
import AppError from "../utils/appError.js";

export default function authenticate(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) return next(new AppError("Вы не авторизованы", 401));

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Недействительный или истёкший токен", 401));
  }
}
