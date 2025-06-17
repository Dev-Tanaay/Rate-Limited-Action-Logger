import { NextFunction, Request } from "express";
import { verify } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware=async(req:Request,next:NextFunction)=>{
    const token=req.cookies.token;
    const verifyToken=verify(token,String(process.env.JTW_SECRET));
    req.user=verifyToken;
}