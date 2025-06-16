import express from "express";
import router from "./routes/route";
import dotenv from "dotenv";
import { connectRedis } from "./redis/redis.connect";
const app=express();
dotenv.config();
app.use(express.json())
async function start() {
    await connectRedis()
    app.use("/api",router);
    app.listen(3000,()=>{
        console.log("Server up in running...")
    })
}
start();