import type { NextApiRequest, NextApiResponse } from "next";
import { generateNonce } from "siwe";
import { getIronSession } from "iron-session";

type Data = {
  nonce: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    const nonce = generateNonce();
    const session = await getIronSession<{ nonce: string }>(req, res, {
      password: "123456789123456789123456789123456789",
      cookieName: "siwe",
    });

    session.nonce = nonce;
    await session.save();
    res.status(200).json({ nonce });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
