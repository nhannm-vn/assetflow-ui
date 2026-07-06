/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Backend .NET thật (nơi Vite sẽ proxy tới). Đổi trong .env nếu backend
  // chạy ở port/host khác.
  const backendTarget = env.VITE_BACKEND_TARGET || "https://localhost:7146";

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        exclude: ["src/test/**", "**/*.d.ts", "src/main.tsx"],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      open: true,
      // Backend set cookie access_token/refresh_token với Secure=true +
      // SameSite=Strict (xem AuthController.cs). SameSite=Strict chỉ cho
      // phép gửi cookie khi request là same-origin — vì vậy mọi gọi
      // /api, /hubs được proxy ngầm tới backend thật ở đây, khiến trình
      // duyệt luôn thấy một origin duy nhất (localhost:5173).
      // Secure=true KHÔNG bắt buộc HTTPS thật khi chạy trên localhost:
      // trình duyệt coi http://localhost là "secure context" (ngoại lệ dev
      // theo chuẩn W3C Secure Contexts), nên cookie Secure vẫn được lưu và
      // gửi đi bình thường qua HTTP thường — không cần cấu hình HTTPS/chứng
      // chỉ tự ký cho dev server.
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false, // backend dùng chứng chỉ dev tự ký (dotnet dev-certs)
        },
        "/hubs": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});
