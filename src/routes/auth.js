import { validate, registerSchema, loginSchema } from "../validators/auth.js"; //импорт функции валидации и схем данных для регистрации и входа из папки валидаторов
import { register, login, refresh, logout } from "../controllers/authController.js"; //импорт функций-контроллеров, которые содержат логику регистрации, входа, обновления токена и выхода
import authenticate from "../middleware/authenticate.js"; // импорт посредника (middleware) для проверки того, вошел ли пользователь в систему
import { Router } from "express"; //импорт инструмента создания маршрутов из библиотеки express

const router = Router(); //создание нового экземпляра роутера для обработки запросов.

router.post("/register", validate(registerSchema), register); //создание маршрута для регистрации сначала проверяются данные по схеме, затем вызывается контроллер регистрации
router.post("/login", validate(loginSchema), login); //создание маршрута для входа: проверяются учетные данные и выполняется вход в аккаунт
router.post("/refresh", refresh); //создание маршрута для обновления токена доступа, чтобы пользователь оставался в системе
router.post("/logout", authenticate, logout); //создание маршрута для выхода сначала проверяется личность пользователя, а затем завершается его сессия

export default router; //экспорт настроенного роутера для его подключения в основном файле сервера
