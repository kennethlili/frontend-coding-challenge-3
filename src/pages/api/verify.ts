// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { getCookie } from 'cookies-next';

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

    const nonceFromCookie = getCookie("nonce",{req,res});

    if (fields.data.nonce !== nonceFromCookie)
      return res
        .status(422)
        .json({ success: false, message: "Invalid nonce." });

    res.json({ success: true });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
