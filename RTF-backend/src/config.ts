const required = ["DATABASE_URL", "JWT_SECRET", "FRONTEND_ORIGIN"] as const;

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

if ((process.env.JWT_SECRET?.length ?? 0) < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

const frontendOrigins = [...new Set(process.env.FRONTEND_ORIGIN!.split(",").map((origin) => origin.trim()).filter(Boolean))];
if (frontendOrigins.length === 0) {
  throw new Error("FRONTEND_ORIGIN must contain at least one exact frontend origin.");
}
for (const origin of frontendOrigins) {
  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    throw new Error("FRONTEND_ORIGIN must contain valid exact origins.");
  }
  if (
    parsedOrigin.origin !== origin ||
    parsedOrigin.pathname !== "/" ||
    parsedOrigin.search ||
    parsedOrigin.hash ||
    parsedOrigin.username ||
    parsedOrigin.password ||
    (process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "https:")
  ) {
    throw new Error("FRONTEND_ORIGIN must contain exact origins; production origins must use HTTPS.");
  }
}

const appBaseUrl = process.env.APP_BASE_URL ?? frontendOrigins[0];
let parsedAppBaseUrl: URL;
try {
  parsedAppBaseUrl = new URL(appBaseUrl);
} catch {
  throw new Error("APP_BASE_URL must be a valid absolute URL.");
}
if (process.env.NODE_ENV === "production" && parsedAppBaseUrl.protocol !== "https:") {
  throw new Error("APP_BASE_URL must use HTTPS in production.");
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  frontendOrigins,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  isProduction: process.env.NODE_ENV === "production",
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFrom: process.env.SMTP_FROM,
  appBaseUrl
};
