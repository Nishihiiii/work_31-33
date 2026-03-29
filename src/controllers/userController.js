import AppError from "../utils/appError.js"; //импорт класса для создания кастомных ошибок с кодами статуса
import * as userService from "../services/userService.js"; //импорт всех функций из файла сервиса под общим именем userservice

export async function getAllUsers(req, res, next) { //экспорт асинхронной функции для получения списка всех пользователей
  try {
    const users = await userService.getAllUsers(); //ожидание получения массива всех пользователей из сервиса
    res.status(200).json(users); //отправка ответа со статусом 200 и данными пользователей в формате json
  } catch (error) { //блок для перехвата ошибок, если запрос к сервису завершится неудачей
    next(error); //передача ошибки в глобальный обработчик ошибок express
  }
}

export async function getUserById(req, res, next) { //экспорт асинхронной функции для поиска конкретного пользователя по id
  try {
    const user = await userService.getUserById(req.params.id); //поиск пользователя по id, который берется из параметров url
    if (!user) return next(new AppError("Пользователь не найден", 404)); //если пользователь не найден, прерываем выполнение и кидаем ошибку 404
    res.status(200).json(user); //отправка найденного пользователя клиенту со статусом 200
    } catch (error) { //блок для перехвата системных ошибок или ошибок базы данных
    next(error); //передача ошибки дальше
  }
}
