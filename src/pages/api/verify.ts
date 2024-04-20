// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { getIronSession } from "iron-session";

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

    const session = await getIronSession<{ nonce: string }>(req, res, {
      password: "123456789123456789123456789123456789",
      cookieName: "siwe",
    });
    
    console.log({session})
    if (fields.data.nonce !== session.nonce)
      return res
        .status(422)
        .json({ success: false, message: "Invalid nonce." });

    res.json({ success: true });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
