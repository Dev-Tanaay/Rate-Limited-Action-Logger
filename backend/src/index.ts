import express from "express";
import router from "./routes/route";
import route from "./routes/user.route";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectRedis } from "./redis/redis.connect";
const app=express();
dotenv.config();
app.use(express.json())
app.use(cookieParser())
async function start() {
    await connectRedis()
    app.use("/api/user",route);
    app.use("/api",router);
    app.listen(process.env.PORT,()=>{
        console.log("Server up in running...")
    })
}
start();