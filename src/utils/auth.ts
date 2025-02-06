import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
  await prisma.$connect(); // Coba koneksi langsung
  console.log("Koneksi ke database berhasil!");
} catch (error) {
  console.error("Gagal terhubung ke database:", error);
  process.exit(1); // Hentikan aplikasi jika koneksi gagal
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    },
});

