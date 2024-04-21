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

    const redis = new Redis({
      url: 'https://apn1-wondrous-chipmunk-33623.upstash.io',
      token: 'AYNXASQgZDI4YmY1MDgtNzk1OC00YWJiLWFmYWItNWU5NjM5OGZkYTVjNTUzNTBhZjE0NDNhNDNhY2ExYjNkNWI1N2YxYWViZDg=',
    });

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
