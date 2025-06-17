import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface AuthRequest extends Request{
    user ?: any;
}

export const authMiddleware=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token=req.cookies?.token;
        if(!token){
            res.status(401).json({"message":"UnAuthorized"});
            return;
        }
        const decode=verify(token,String(process.env.JTW_SECRET));
        req.user=decode;
        next();
    } catch (error) {
        res.status(401).json({"message":error});
        return ;
    }
}