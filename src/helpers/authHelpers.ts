import crypto from "crypto";
import jwt from "jsonwebtoken";

export function generateAccessToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, "your-secret-key", {
    expiresIn: "15s",
  });
}
export function generateRefreshToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, "your-refresh-secret-key", {
    expiresIn: "1d",
  });
}
