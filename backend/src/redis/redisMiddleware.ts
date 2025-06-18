import { NextFunction, Request, Response } from "express";
import { getRedisClient } from "./redis.connect";
import { initializeBucket } from "./bucketToken";

export const redisMiddleware=async(req:AuthRequest,res:Response,next:NextFunction)=>{
    const userId=req.user?.userId;
    if(!userId){
        res.status(400).json({"message":"Crash Happend:("})
        return ;
    }
    const client=getRedisClient();
    const limitKey=`rate-limit:${req.user?.userId}`;
    const count=await client.incr(limitKey);
    if(count==1){
        await client.expire(limitKey,60);
    }
    const ttl=await client.ttl(limitKey);
    if(count>5){
        res.status(429).json({"message":`To many request try after ${ttl} this much seconds:(`})
        return ;
    }
    
    const bucketLen=await client.lLen(`user-bucket:${userId}`)
    if(bucketLen==0){
        await initializeBucket(Number(userId));
    }
    const bucket=`user-bucket:${userId}`
    const token = await client.lPop(bucket);
    if(!token){
        res.status(429).json({ message: `Too many concurrent tasks. Try later.` });
        return ;
    }
    if (req.user) {
        req.user.bucketToken = token;
    }
    next();
;}