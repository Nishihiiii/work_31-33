import db from "../db/db.js"; //импортируем подключение к базе данных из соседней папки

export async function findUserByEmail(email) { //функция для поиска пользователя по email
  const query = db.prepare("SELECT * FROM users WHERE email = ?"); //подготавливаем SQL-запрос с плейсхолдером, чтобы избежать SQL-инъекций
  return query.get(email) || null; //выполняем запрос, передавая email вместо знака вопроса. Если пользователь не найден, возвращаем null
}

export async function createUser(email, passwordHash, role) {  //создаём нового пользователя в базе
  const query = db.prepare( //Подготавливаем INSERT-запрос, где порядок полей важен
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)"
  );
  const result = query.run(email, passwordHash, role); //выполняем вставку, передавая реальные значения вместо плейсхолдеров
  return result.lastInsertRowid; //возвращаем автоматически сгенерированный ID новой записи
}

export async function findUserById(id) { //функция для получения данных пользователя по его числовому id
  const query = db.prepare("SELECT id, email, role, created_at, last_login FROM users WHERE id = ?"); //подготовка запроса на выборку только безопасных полей, исключая пароли
  return query.get(id) || null; //выполнение поиска по id и возврат данных или пустого значения
}

export async function getAllUsers() { //функция для получения списка всех зарегистрированных пользователей
  const query = db.prepare( //подготовка запроса на получение безопасных данных всех пользователей базы
    "SELECT id, email, role, created_at, last_login FROM users"
  );
  return query.all(); //возврат массива всех найденных записей
}

export async function saveRefreshToken(userId, tokenHash, expiresAt) { //функция для сохранения нового refresh-токена в базе данных
  const query = db.prepare( //создание sql-команды для записи токена и срока его действия
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)" 
  );
  query.run(userId, tokenHash, expiresAt); //выполнение записи токена в таблицу
}

export async function findRefreshToken(tokenHash) { //функция для поиска записи о токене по его хешу
  const query = db.prepare( //подготовка запроса для проверки существования токена в базе
    "SELECT * FROM refresh_tokens WHERE token_hash = ?"
  );
  return query.get(tokenHash) || null; //возврат найденного токена или null, если он не найден
}

export async function deleteRefreshToken(tokenHash) { //функция для удаления конкретного токена
  const query = db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?"); //подготовка sql-команды на удаление конкретной записи
  query.run(tokenHash); //выполнение операции удаления
}

export async function deleteAllRefreshTokensForUser(userId) { //функция для полной очистки всех сессий (токенов) конкретного пользователя
  const query = db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?"); // подготовка запроса на удаление всех токенов, привязанных к id юзера
  query.run(userId); //выполнение массового удаления токенов
}
