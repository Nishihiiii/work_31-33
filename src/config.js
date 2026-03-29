import "dotenv/config";
import generateSecret from "./utils/generateSecret.js";

const config = {
  port: process.env.PORT || 3000,

  jwt: {
    secret: process.env.JWT_SECRET || generateSecret("JWT_SECRET"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  cookie: {
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "strict",
    httpOnly: true,
    maxAgeRefresh: 7 * 24 * 60 * 60 * 1000,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },

  db: {
    path: process.env.DB_PATH || "./database.db",
  },

  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
