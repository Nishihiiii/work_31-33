import * as authService from "../services/authService.js";
import jwt from "jsonwebtoken";
import config from "../config.js";
import AppError from "../utils/appError.js";

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const userId = await authService.register(email, password);
    res
      .status(201)
      .json({ message: "Пользователь успешно зарегистрирован", userId });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiresIn },
    );
    const refreshToken = await authService.generateRefreshToken(user.id);
    res.cookie("accessToken", accessToken, config.cookie);
    res.cookie("refreshToken", refreshToken, {
      ...config.cookie,
      maxAge: config.cookie.maxAgeRefresh,
    });
    res.status(200).json({ message: "Успешный вход в систему" });
  } catch (error) {
    next(error);
  }
}
export async function refresh(req, res, next) {
  try {
    const rawToken = req.cookies.refreshToken;
    if (!rawToken) return next(new AppError("Токен обновления отсутствует", 401));
    const { accessToken, refreshToken } = await authService.rotateRefreshToken(rawToken);
    res.cookie("accessToken", accessToken, config.cookie);
    res.cookie("refreshToken", refreshToken, {
      ...config.cookie,
      maxAge: config.cookie.maxAgeRefresh,
    });
    res.status(200).json({ message: "Токены обновлены" });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const rawToken = req.cookies.refreshToken;
    if (rawToken) await authService.revokeRefreshToken(rawToken);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Выход выполнен" });
  } catch (error) {
    next(error);
  }
}
