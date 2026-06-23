export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "your-secret-key-change-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  evolutionApiUrl: process.env.EVOLUTION_API_URL ?? "",
  evolutionApiKey: process.env.EVOLUTION_API_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@plomozap.local",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
};
