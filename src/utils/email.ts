import "dotenv/config";
import type { ReactNode } from "hono/jsx";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

/**
 * Sends an email using the Resend API.
 *
 * You can send either plain text or a React component as the email content.
 *
 * @param {Object} params - The email parameters.
 * @param {string} params.to - Recipient email address.
 * @param {string} params.subject - Subject line of the email.
 * @param {string} [params.text] - Plain text content of the email (optional).
 * @param {ReactNode} [params.react] - React component to render as email content (optional).
 * 
 * @returns {Promise<Object>} The response from the Resend API.
 *
 * @example
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   text: "Thanks for signing up!",
 * });
 *
 * @example
 * import { jsx } from "hono/jsx";
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Hello with React",
 *   react: <div><h1>Hello</h1><p>This is a React email.</p></div>,
 * });
 */
export const sendEmail = async ({
  to,
  subject,
  text,
  react,
}: {
  to: string;
  subject: string;
  text?: string;
  react?: ReactNode;
}) => {
  return await resend.emails.send({
    from: "Melusi Mbatha <me@mbathamelusi.co.za>",
    to,
    subject,
    text,
    react,
  });
};
