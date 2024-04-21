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
    const redis = new Redis({
      url: "https://apn1-wondrous-chipmunk-33623.upstash.io",
      token:
        "AYNXASQgZDI4YmY1MDgtNzk1OC00YWJiLWFmYWItNWU5NjM5OGZkYTVjNTUzNTBhZjE0NDNhNDNhY2ExYjNkNWI1N2YxYWViZDg=",
    });
    await redis.set("nonce", nonce);

    res.status(200).json({ nonce });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
