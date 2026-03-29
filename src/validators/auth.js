import Joi from "joi"; //импорт библиотеки joi для создания схем валидации
import AppError from "../utils/appError.js"; //импорт собственного класса для обработки ошибок

const registerSchema = Joi.object({ //создание схемы валидации для регистрации пользователя
  email: Joi.string().email().required(), //поле email должно быть строкой, валидным адресом почты и обязательно для заполнения
  password: Joi.string().min(8).required(), //поле password должно быть строкой (минимум 8 символов) и обязательно для заполнения
});

const loginSchema = Joi.object({ //создание схемы валидации для входа (логина) в систему
  email: Joi.string().email().required(), //почта проверяется так же, как и при регистрации
  password: Joi.string().min(8).required(), //пароль проверяется так же, как и при регистрации
});

export function validate(schema) { //экспорт функции-обертки, которая принимает схему валидации
  return (req, res, next) => { //возвращает middleware-функцию (посредник) для express
    const { error } = schema.validate(req.body); //запуск проверки данных из тела запроса (req.body) по переданной схеме
    if (error) { //проверка, возникла ли ошибка при валидации
      return next(new AppError(error.details[0].message, 400)); //если ошибка есть, передаем её дальше с текстом первого нарушения и статус-кодом 400
    }
    next(); //если ошибок нет, передаем управление следующей функции
  };
}

export { registerSchema, loginSchema }; //экспорт созданных схем, чтобы использовать их в роутах
