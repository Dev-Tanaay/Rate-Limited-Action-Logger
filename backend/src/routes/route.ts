import { Router } from "express";
import { actionMethod } from "../controller/action.controller";
const router= Router();
router.post("/action",actionMethod);
export default router;