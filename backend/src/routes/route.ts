import { Router, Request, Response } from "express";
import { actionMethod } from "../controller/action.controller";
import { authMiddleware } from "../authentication/middleware";
import { redisMiddleware } from "../redis/redisMiddleware";

interface AuthRequest extends Request{
  user?:any
}

const router= Router();
router.post("/action",authMiddleware,redisMiddleware,(req: AuthRequest,res:Response)=>{
    console.log(req.user)
    res.status(200).json({"message":req.user})
});
export default router;