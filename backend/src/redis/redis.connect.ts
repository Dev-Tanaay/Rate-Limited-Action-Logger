import { createClient } from "redis";

const client=createClient({
    url:"redis://localhost:6379"
});
client.on("connect",()=>{
    console.log("Redis is been connected");
})

export async function connectRedis(){
    await client.connect()
}
export function getRedisClient() {
  return client;
}