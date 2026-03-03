import { v4 as uuidv4 } from "uuid";

/** Generate a UUID. Uses uuid package for compatibility (crypto.randomUUID not available in all environments). */
export function generateId(): string {
  return uuidv4();
}
