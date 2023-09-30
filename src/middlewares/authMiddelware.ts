import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export interface JwtPayload {
  userId: string;
}
declare module "express" {
  interface Request {
    user?: JwtPayload;
  }
}
function authorize(
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Authorization token is missing" });
  }
  try {
    const decoded = jwt.verify(token, "your-secret-key");
    req.user = decoded as JwtPayload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export default authorize;

export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    next();
  };
}
