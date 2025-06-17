import { Request,Response, Router } from "express";
import { logIn, logOut, signIn } from "../controller/user.controller";
const route=Router();
route.post("/signin",signIn);
route.post("/login",logIn);
route.post("/logout",logOut)
export default route;