"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const action_controller_1 = require("../controller/action.controller");
const router = (0, express_1.Router)();
router.post("/action", action_controller_1.actionMethod);
exports.default = router;
