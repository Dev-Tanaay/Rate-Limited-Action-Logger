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

export const actionMethod = async (
  req: Request<{}, {}, Upload>,
  res: Response
): Promise<void> => {
  try {
    const { userId, type, metaData } = req.body;

    const client = getRedisClient();
    const limitKey = `rate-limit:${userId}`;
    const count = await client.incr(limitKey);

    // set expiry only on first call
    if (count === 1) {
      await client.expire(limitKey, 60);
    }

    // rate-limited response
    if (count > 5) {
      const ttl = await client.ttl(limitKey);
      res.status(429).json({
        message: `Too many requests, wait ${ttl} seconds`,
      });
      return;
    }

    // log in DB
    const result = await prisma.action.create({
      data: {
        userId,
        type,
        metaData,
      },
    });

    // update leaderboard
    await client.zIncrBy("userLeaderboard", 1, userId.toString());

    // publish to channel
    await client.publish("actionChannel", JSON.stringify({ userId, type }));

    // push to stream
    await client.xAdd("actionStream", "*", {
      userId: userId.toString(),
      type,
      file: metaData.file,
    });

    // cache latest action
    await client.set(`user:lastAction:${userId}`, type, { EX: 300 });

    // get rank + score
    const rank = await client.zRevRank("userLeaderboard", userId.toString());
    const score = await client.zScore("userLeaderboard", userId.toString());

    // success response
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
