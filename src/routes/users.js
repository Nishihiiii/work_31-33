import { Router } from "express"; // импорт роутера из express для управления путями пользователей
import { getAllUsers, getUserById } from "../controllers/userController.js"; //импорт функций для получения списка всех пользователей и информации о конкретном пользователе
import authenticate from "../middleware/authenticate.js"; //импорт посредника для проверки аутентификации
import authorize from "../middleware/authorize.js"; //импорт функции для проверки прав доступа (ролей)

const router = Router(); //инициализация нового объекта роутера

router.use(authenticate, authorize("admin")); //установка защиты на все следующие маршруты доступ разрешен только вошедшим в систему администраторам

router.get("/", getAllUsers); //создание маршрута для получения списка всех пользователей
router.get("/:id", getUserById); //создание маршрута для получения данных пользователя по его уникальному идентификатору (id)

export default router; //экспорт роутера пользователей для использования в приложении
