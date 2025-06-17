import { Request,Response, Router } from "express";
const route=Router();
route.post("/sign",signIn);
route.post("/signout",signOut);
export default route;