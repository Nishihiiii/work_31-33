import Database from "better-sqlite3"; //подключаем библиотеку better-sqlite3 для работы с SQLite базой данных
import config from "../config.js"; //импортируем конфигурацию проекта, в которой уже прописан путь к файлу базы данных и текущий режим окружения

const db = new Database(config.db.path, { //создаём объект базы данных с указанием пути из конфига
  verbose: config.nodeEnv === "development" ? console.log : undefined, //в режиме разработки библиотека будет выводить все SQL-запросы в консоль
});

db.pragma("foreign_keys = ON"); //включаем поддержку внешних ключей
//создаём таблицу users, если её ещё нет и создаём таблицу refresh_tokens для хранения refresh-токенов
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    last_login    TEXT
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    expires_at  TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); 
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
`); //создаём индекс по email для быстрого поиска при логине и индекс по хешу refresh-токена для ускорения проверки при обновлении сессии

console.log(`БД инициализирована: ${config.db.path}`); //сообщаем в консоль, с каким файлом базы данных сейчас работает

export default db; //экспортируем объект БД, чтобы использовать в других модулях одной строкой
