import { getRedisClient } from "./redis.connect";
import { v4 } from "uuid";
export async function initializeBucket(userId:number) {
    const client = getRedisClient();
    const bucketKey = `user-bucket:${userId}`;
    const tokenCount = await client.lLen(bucketKey);
    if (tokenCount == 0) {
        const tokens = [];
        for (let i = 1; i <= 5; i++) {
            tokens.push(`token:${v4()}`);
        }
        await client.rPush(bucketKey, tokens);
        await client.expire(bucketKey, 60);
    }
}