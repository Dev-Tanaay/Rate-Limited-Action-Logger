import { Router, Request, Response } from "express";
import { actionMethod } from "../controller/action.controller";
import { authMiddleware } from "../authentication/middleware";
import { redisMiddleware } from "../redis/redisMiddleware";

const router= Router();
router.post("/action",authMiddleware,redisMiddleware,actionMethod);
export default router;