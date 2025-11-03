import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  openAiKey: process.env.OPENAI_API_KEY ?? "",
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? ""
  },
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173").split(",")
};

const required = [
  "OPENAI_API_KEY",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY"
] as const;

required.forEach(key => {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}`);
  }
});
