// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { Redis } from "@upstash/redis";

type Data = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const { message, signature } = req.body;
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    const redis = Redis.fromEnv();

    const nonce = await redis.get('nonce'); 
    
    if (fields.data.nonce !== nonce)
      return res
        .status(422)
        .json({ success: false, message: "Invalid nonce." });

    res.json({ success: true });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
