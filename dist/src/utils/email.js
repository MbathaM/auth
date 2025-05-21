import "dotenv/config";
import { Resend } from "resend";
const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);
export const sendEmail = async ({ to, subject, text, react, }) => {
    return await resend.emails.send({
        from: "Melusi Mbatha <me@mbathamelusi.co.za>",
        to,
        subject,
        text,
        react,
    });
};
