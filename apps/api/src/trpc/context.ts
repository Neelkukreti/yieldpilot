import { prisma } from "@yieldpilot/database";

export function createContext() {
  return { db: prisma };
}

export type Context = ReturnType<typeof createContext>;
