import "dotenv/config";
import type { ReactNode } from "hono/jsx";
import { Resend } from "resend";
const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

export const sendEmail = async ({
  to,
  subject,
  text,
  react,
}: {
  to: string;
  subject: string;
  text?: string;
  react?: ReactNode; //can use text or react
}) => {
  return await resend.emails.send({
    from: "Melusi Mbatha <me@mbathamelusi.co.za>",
    to,
    subject,
    text,
    react,
  });
};
