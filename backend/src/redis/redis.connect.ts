import { createClient } from "redis";

const client = createClient({
    url: String(process.env.REDIS_URL)
});
const subscriber = createClient();
client.on("connect", () => {
    console.log("Redis is been connected");
})
subscriber.on("error", (err) => console.error("Redis Subscriber Error:", err));

export async function connectRedis() {
    await client.connect()
    await subscriber.connect()
    await subscriber.subscribe("actionChannel", (message) => {
        const data = JSON.parse(message);
        console.log(`Redis PubSub: ${data.userId} did ${data.type}`);
    });
}
export function getRedisClient() {
    return client;
}