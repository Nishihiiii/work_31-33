import AppError from "../utils/appError.js";

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("У вас нет прав для доступа к этому ресурсу", 403),
      );
    }
    next();
  };
};

export default authorize;
