import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }
        const decode = verify(token, String(process.env.JTW_SECRET)) as {userId:number};
        req.user = decode;
        next();
    } catch (error) {
        console.error("Error in authMiddleware:", error);
        res.status(401).json({ message: "Unauthorized" });
        return ;
    }
};