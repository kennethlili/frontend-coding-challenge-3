import type { NextApiRequest, NextApiResponse } from "next";
import { generateNonce } from "siwe";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { getCookie, setCookie } from "cookies-next";

type Data = {
  nonce: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    const nonce = generateNonce();
    setCookie("nonce", nonce,{req,res});
    
    res.status(200).json({ nonce });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
