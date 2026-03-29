import jwt from "jsonwebtoken"; //импорт библиотеки для работы с json web token
import config from "../config.js"; //импорт файла с настройками приложения (секретными ключами)
import AppError from "../utils/appError.js"; //импорт класса для создания стандартизированных ошибок

export default function authenticate(req, res, next) { //экспорт функции-посредника для проверки авторизации
  const token = req.cookies.accessToken; //извлечение токена доступа из куки-файлов запроса
  if (!token) return next(new AppError("Вы не авторизованы", 401)); //если токена нет, передаем ошибку не авторизован дальше

  try {
    const decoded = jwt.verify(token, config.jwt.secret); //проверка подлинности токена с помощью секретного ключа
    req.user = decoded; //сохранение расшифрованных данных пользователя в объект запроса
    next(); //передача управления следующему обработчику, если проверка прошла успешно
  } catch (error) { //если токен подделан или просрочен, управление переходит сюда
    return next(new AppError("Недействительный или истёкший токен", 401)); //возврат ошибки о невалидном токене
  }
}
