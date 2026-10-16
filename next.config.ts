import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "sharp",
    "bcryptjs",
    "@whiskeysockets/baileys",
    "whatsapp-rust-bridge",
    "jimp",
    "pino",
    "qrcode-terminal",
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default withNextIntl(nextConfig);
