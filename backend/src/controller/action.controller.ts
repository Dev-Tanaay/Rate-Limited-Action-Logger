import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { getRedisClient } from "../redis/redis.connect";

const prisma = new PrismaClient();

interface Upload {
  userId: number;
  type: string;
  metaData: {
    file: string;
  };
}

export const actionMethod = async (req: Request<{}, {}, Upload>,res: Response): Promise<void> => {
  try {
    const { userId, type, metaData } = req.body;

    const client = getRedisClient();
    const limitKey = `rate-limit:${userId}`;
    const count = await client.incr(limitKey);
    if (count === 1) {
      await client.expire(limitKey, 60);
    }
    if (count > 5) {
      const ttl = await client.ttl(limitKey);
      res.status(429).json({
        message: `Too many requests, wait ${ttl} seconds`,
      });
      return;
    }
    const result = await prisma.action.create({
      data: {
        userId,
        type,
        metaData,
      },
    });

    await client.zIncrBy("userLeaderboard", 1, userId.toString());

    await client.publish("actionChannel", JSON.stringify({ userId, type }));

    await client.xAdd("actionStream", "*", {
      userId: userId.toString(),
      type,
      file: metaData.file,
    });

    await client.set(`user:lastAction:${userId}`, type, { EX: 300 });

    const rank = await client.zRevRank("userLeaderboard", userId.toString());
    const score = await client.zScore("userLeaderboard", userId.toString());

    res.status(200).json({
      message: "Action logged successfully",
      remaining: 5 - count,
      rank: rank !== null ? rank + 1 : null,
      score: score || 0,
    });
  } catch (error: any) {
    console.error("Error in /action:", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};
