import type { NextApiRequest, NextApiResponse } from "next";
import { generateNonce } from "siwe";
import { Redis } from "@upstash/redis";

type Data = {
  nonce: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    const nonce = generateNonce();
    const redis = Redis.fromEnv();
    await redis.set("nonce", nonce);

    res.status(200).json({ nonce });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
