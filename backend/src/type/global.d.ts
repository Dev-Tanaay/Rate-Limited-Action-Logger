import { Request } from "express";

declare global{
    interface AuthRequest extends Request{
        user?:{
            userId:number
        }
    }
}

export {}