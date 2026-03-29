import crypto from "crypto";

export default function generateSecret(name) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} должен быть установлен в переменных окружения в режиме production`);
  }
  const generated = crypto.randomBytes(64).toString("hex");
  console.warn(`[config] ${name} не установлен, используем сгенерированный секрет (только для разработки):`, generated);
  return generated;
}

