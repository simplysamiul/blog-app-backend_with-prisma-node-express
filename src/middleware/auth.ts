import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth';

export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}


declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean;
            }
        }
    }
}


export const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            //    get user seassion
            const seassion = await betterAuth.api.getSession({
                headers: req.headers as any
            })
            if (!seassion) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized ..!"
                })
            }

            if (!seassion?.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Email verification required. Please verify your email ..!"
                })
            }

            req.user = {
                id: seassion.user.id,
                email: seassion.user.email,
                name: seassion.user.name,
                role: seassion.user.role as string,
                emailVerified: seassion.user.emailVerified,
            }


            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permisson to access this resources ..!"
                })
            }

            next();
        } catch (error) {
            next(error)
        }

    }
}
