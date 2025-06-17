import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { hashSync,compareSync } from "bcrypt";
import { sign } from "jsonwebtoken";
import { initializeBucket } from "../redis/bucketToken";

const prisma = new PrismaClient();

interface User {
  userName: string,
  email: string,
  password:string
}

const saltRounds = parseInt(process.env.saltRound || "10");

export const signIn=async(req:Request<{},{},User>,res:Response)=>{
    const { userName,email,password } =req.body;
    const checkUser=await prisma.user.findFirst({
        where:{
            userName
        }
    })
    if(checkUser){
        res.status(409).json({"message":"User already existed :("});
        return
    }
    const hashPassword=hashSync(password,saltRounds)
    const createUser=await prisma.user.create({
        data:{
            userName,
            email,
            password:hashPassword
        }
    })
    if(createUser){
        res.status(200).json({"message":"User created successfully :)"});
        return ;
    }
    res.status(400).json({"message":"Cant regiter:("});
        return ;   
}

export const logIn=async(req:Request<{},{},User>,res:Response)=>{
    const { email,password } =req.body;
    const checkUser=await prisma.user.findFirst({
        where:{
            email
        }
    })
    if(!checkUser){
        res.status(401).json({"message":"Credentials dont match :("});
        return;
    }
    const verifyPassword=compareSync(password,checkUser.password);
    if(!verifyPassword){
        res.status(401).json({"message":"Credentials dont match :("});
        return;
    }
    const token=sign({userId:checkUser.id},String(process.env.JTW_SECRET));
    res.cookie("token", token, { httpOnly: true });
    await initializeBucket(checkUser.id);
    res.status(200).json({checkUser,token});
}

export const logOut=(req:Request,res:Response)=>{
    res.clearCookie("token");
    res.status(200).json({"message":"Successfully logged Out:)"})
    return ; 
}