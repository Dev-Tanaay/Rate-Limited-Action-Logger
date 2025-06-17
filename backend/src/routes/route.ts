import { Router, Request } from "express";
import { actionMethod } from "../controller/action.controller";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router= Router();
router.post("/action",(req: Request)=>{
    console.log(req.user)
});
export default router;