import "dotenv/config"; //подключаем dotenv для чтения переменных из файла .env
import generateSecret from "./utils/generateSecret.js"; //импортируем собственную утилиту для генерации секретов. нужна, если в окружении ничего не задано

const config = { //формируем и экспортируем объект конфигурации
  port: process.env.PORT || 3000, //задаем порт сервера если в .env задан PORT берём его, иначе запускаемся на 3000

  jwt: { //Секрет для access-токена. проверяем, есть ли он в .env если нет — генерируем случайный (и выводим предупреждение) 
    secret: process.env.JWT_SECRET || generateSecret("JWT_SECRET"), //функция generateSecret выбросит ошибку, заставляя явно задать секрет
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m", //время жизни access-токена по умолчанию устанавливаем 15 минут
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", //время жизни refresh-токена по умолчанию ставим 7 дней
  },

  cookie: {
    secure: process.env.COOKIE_SECURE === "true", //Куки будут отправляться только по безопасному соединению
    sameSite: "strict", //чтобы куки не отправлялись при переходах с других сайтов
    httpOnly: true, // куки будут недоступны через JavaScript
    maxAgeRefresh: 7 * 24 * 60 * 60 * 1000, //задает срок жизни куки в миллисекундах
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", //разрешаем запросы с фронтенда
    credentials: true, //разрешаем передавать куки и заголовки авторизации
  },

  db: {
    path: process.env.DB_PATH || "./database.db", //настройки пути для схемы базы данных или где будет создаваться данный файл
  },

  nodeEnv: process.env.NODE_ENV || "development", //указываем текущее окружение, чтобы отличать разработку от продакшена
};

export default config;
