import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: { root: path.join(process.cwd(), "..") },
};

export default config;
