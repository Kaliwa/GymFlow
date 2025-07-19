import { Request, Response, NextFunction } from "express";
import { getUserRoleLevel, UserRole } from "../models";

export function requireRoleLevel(minLevel: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoleLevel = getUserRoleLevel(req.user?.role ?? UserRole.USER);
    if (userRoleLevel < minLevel) {
      return res.status(403).json({ _error: 'Forbidden' });
    }
    next();
  };
}
