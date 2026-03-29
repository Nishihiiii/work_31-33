import express from "express"; //импорт основного фреймворка express для создания веб-сервера
import config from "./config.js"; //импорт настроек конфигурации приложения из локального файла
import helmet from "helmet"; //импорт модуля для защиты приложения через настройку заголовков http
import cors from "cors"; //импорт механизма для управления кросс-доменными запросами
import rateLimit from "express-rate-limit"; //импорт библиотеки для ограничения частоты запросов к серверу
import cookieParser from "cookie-parser"; //импорт парсера для чтения данных из куки (cookies) браузера
import errorHandler from "./middleware/errorHandler.js"; //импорт пользовательского обработчика ошибок
import authRouter from "./routes/auth.js"; //импорт маршрутов, отвечающих за аутентификацию
import usersRouter from "./routes/users.js"; //импорт маршрутов для работы с данными пользователей
import { swaggerUi, spec } from "../docs/swagger.js"; //импорт инструментов для генерации и отображения документации api через swagger

const app = express(); //инициализация экземпляра приложения express

const limiter = rateLimit({ //создание настройки для ограничения входящих запросов
  windowMs: 15 * 60 * 1000, //установка временного окна в 15 минут для подсчета запросов
  max: 100, //установка лимита в 100 запросов для одного ip за указанное время
});

app.use(helmet()); //подключение защиты заголовков для базовой безопасности сервера
app.use(cors(config.cors)); //разрешение и настройка совместного использования ресурсов между разными доменами
app.use(cookieParser()); //подключение посредника для работы с куками
app.use(express.json()); //включение возможности парсинга входящих данных в формате json
app.use("/api/auth", limiter, authRouter); //подключение маршрутов авторизации с применением ограничителя частоты запросов
app.use("/api/users", usersRouter); //подключение маршрутов для управления пользователями
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec)); //настройка страницы с интерактивной документацией api
app.use(errorHandler); //подключение глобального обработчика ошибок в самом конце цепочки

export default app; //экспорт объекта приложения для запуска в файле сервера
