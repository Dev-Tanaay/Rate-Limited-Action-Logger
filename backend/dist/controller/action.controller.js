"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionMethod = void 0;
const prisma_1 = require("../../generated/prisma");
const redis_connect_1 = require("../redis/redis.connect");
const prisma = new prisma_1.PrismaClient();
const actionMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, type, metaData } = req.body;
        const client = (0, redis_connect_1.getRedisClient)();
        const limitKey = `rate-limit:${userId}`;
        const count = yield client.incr(limitKey);
        // set expiry only on first call
        if (count === 1) {
            yield client.expire(limitKey, 60);
        }
        // rate-limited response
        if (count > 5) {
            const ttl = yield client.ttl(limitKey);
            res.status(429).json({
                message: `Too many requests, wait ${ttl} seconds`,
            });
            return;
        }
        // log in DB
        const result = yield prisma.action.create({
            data: {
                userId,
                type,
                metaData,
            },
        });
        // update leaderboard
        yield client.zIncrBy("userLeaderboard", 1, userId.toString());
        // publish to channel
        yield client.publish("actionChannel", JSON.stringify({ userId, type }));
        // push to stream
        yield client.xAdd("actionStream", "*", {
            userId: userId.toString(),
            type,
            file: metaData.file,
        });
        // cache latest action
        yield client.set(`user:lastAction:${userId}`, type, { EX: 300 });
        // get rank + score
        const rank = yield client.zRevRank("userLeaderboard", userId.toString());
        const score = yield client.zScore("userLeaderboard", userId.toString());
        // success response
        res.status(200).json({
            message: "Action logged successfully",
            remaining: 5 - count,
            rank: rank !== null ? rank + 1 : null,
            score: score || 0,
        });
    }
    catch (error) {
        console.error("Error in /action:", error);
        res.status(500).json({ message: error.message || "Something went wrong" });
    }
});
exports.actionMethod = actionMethod;
