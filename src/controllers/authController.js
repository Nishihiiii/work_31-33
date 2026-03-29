import * as authService from "../services/authService.js"; //импорт всех функций из сервиса аутентификации под именем authService
import jwt from "jsonwebtoken"; //импорт библиотеки jsonwebtoken для работы с jwt-токенами
import config from "../config.js"; //импорт объекта конфигурации из файла настроек
import AppError from "../utils/appError.js"; //импорт кастомного класса для обработки ошибок AppError

export async function register(req, res, next) { //экспорт асинхронной функции для регистрации пользователя
  try {
    const { email, password } = req.body; //извлечение почты и пароля из тела входящего запроса
    const userId = await authService.register(email, password); //вызов метода регистрации из сервиса и получение id нового пользователя
    res //начало формирования ответа сервера
      .status(201) //установка http-статуса 201 (создано)
      .json({ message: "Пользователь успешно зарегистрирован", userId }); //отправка json-ответа с сообщением об успехе и id пользователя
  } catch (error) { 
    next(error); //передача ошибки в следующий обработчик (middleware)
  }
}

export async function login(req, res, next) { //экспорт асинхронной функции для входа пользователя в систему
  try {
    const { email, password } = req.body; //извлечение почты и пароля из тела запроса
    const user = await authService.login(email, password); //проверка данных пользователя через сервис аутентификации
    const accessToken = jwt.sign( //начало создания access-токена с помощью jwt.sign
      { id: user.id, role: user.role }, //запись данных пользователя (id и роль) в полезную нагрузку токенам
      config.jwt.secret, //использование секретного ключа из конфигурации для подписи
      { expiresIn: config.jwt.accessExpiresIn }, //установка времени жизни токена из настроек
    );
    const refreshToken = await authService.generateRefreshToken(user.id); //генерация refresh-токена через сервис для продления сессий
    res.cookie("accessToken", accessToken, config.cookie); //сохранение access-токена в куки браузера с настройками из конфига
    res.cookie("refreshToken", refreshToken, { //сохранение refresh-токена в куки
      ...config.cookie,  //применение дополнительных параметров безопасности для куки
      maxAge: config.cookie.maxAgeRefresh, //установка срока жизни куки для refresh-токена
    });
    res.status(200).json({ message: "Успешный вход в систему" }); //отправка успешного статуса 200 и json-сообщения о входе
  } catch (error) { 
    next(error); //передача возникшей ошибки дальше по цепочке
  }
}
export async function refresh(req, res, next) { //экспорт асинхронной функции для обновления токенов
  try {
    const rawToken = req.cookies.refreshToken; // извлечение refresh-токена из куки запроса
    if (!rawToken) return next(new AppError("Токен обновления отсутствует", 401)); //проверка наличия токена и возврат ошибки 401, если его нет
    const { accessToken, refreshToken } = await authService.rotateRefreshToken(rawToken); //вызов сервиса для ротации (замены) старого токена на новую пару
    res.cookie("accessToken", accessToken, config.cookie); //установка нового access-токена в куки
    res.cookie("refreshToken", refreshToken, { //начало установки нового refresh-токена в куки
      ...config.cookie, //копирование базовых настроек безопасности для куки
      maxAge: config.cookie.maxAgeRefresh, //установка срока жизни куки для токена обновления
    });
    res.status(200).json({ message: "Токены обновлены" }); //отправка успешного ответа со статусом 200
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) { //экспорт асинхронной функции для выхода из системы
  try {
    const rawToken = req.cookies.refreshToken; //получение refresh-токена из куки для его последующего удаления в базе
    if (rawToken) await authService.revokeRefreshToken(rawToken); //если токен есть, вызываем сервис для его аннулирования (отзыва)
    res.clearCookie("accessToken"); //удаление куки с access-токеном на стороне клиента
    res.clearCookie("refreshToken"); //удаление куки с refresh-токеном на стороне клиента
    res.status(200).json({ message: "Выход выполнен" }); //отправка ответа об успешном выходе
  } catch (error) {
    next(error);
  }
}
