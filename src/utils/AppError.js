class AppError extends Error {  //класс AppError расширяет стандартный встроенный класс Error, чтобы имет доп данные для веб сервера
  constructor(message, statusCode) { //message (екст ошибки, который увидит пользователь), statusCode (HTTP-код, допустим 400 или 500)
    super(message); //вызывает конструктор род класса Error, чтобы правильно инициализировать стандартное свойство сообщения

    this.statusCode = statusCode; //сохраняет переданный код
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; //если код начинается с 4 статус будет fail (ошибка клиента), если с чего-то другого error (ошибка сервера)
    this.isOperational = true; //помечает ошибку как ожидаемую (что то типа неверный пароль или отсутствие страницы)

    Error.captureStackTrace(this, this.constructor); //сохраняет информацию о том где произошла ошибка, но исключает из этого списка сам вызов конструктора AppError
  }
}

export default AppError; //позволяет использовать этот класс в других частях проекта через import
