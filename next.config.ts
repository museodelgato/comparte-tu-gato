import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Raíz explícita: evita que Next infiera otra por lockfiles sueltos fuera del proyecto
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
