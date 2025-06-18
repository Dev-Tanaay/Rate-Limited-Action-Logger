import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { getRedisClient } from "../redis/redis.connect";

const prisma = new PrismaClient();

export const actionMethod = async (req: AuthRequest,res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (typeof userId !== "number") {
      res.status(400).json({ message: "Invalid or missing userId" });
      return;
    }
    const {  type, metaData } = req.body as { type: string; metaData: { file: string } };
    const client = getRedisClient();
    const result = await prisma.action.create({
      data: {
        userId,
        type,
        metaData,
      },
    });
    const token=req.user?.bucketToken;
    if(typeof token === "string"){
      await client.rPush(`user-bucket:${userId}`,token);
    }

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

    res.status(200).json({message: "Action logged successfully","rank":Number(rank)+1,score});
  } catch (error: any) {
    console.error("Error in /action:", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};
