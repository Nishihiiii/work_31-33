import express from "express";
import config from "./config.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import { swaggerUi, spec } from "../docs/swagger.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors(config.cors));
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", limiter, authRouter);
app.use("/api/users", usersRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));
app.use(errorHandler);

export default app;
