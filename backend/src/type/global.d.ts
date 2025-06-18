import { Request } from "express";

interface CustomUser {
  userId: number;
  bucketToken?: string;
}

declare global{
    interface AuthRequest extends Request{
        user?: CustomUser
    }
}

export {}