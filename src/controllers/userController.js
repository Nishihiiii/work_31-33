import AppError from "../utils/appError.js";
import * as userService from "../services/userService.js";

export async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return next(new AppError("Пользователь не найден", 404));
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
