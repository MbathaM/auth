import 'dotenv/config';
import { Resend } from "resend";

// Check if API key exists, otherwise use a placeholder for development
const apiKey = process.env.RESEND_API_KEY || 'test_api_key';
const resend = new Resend(apiKey);

// Flag to track if we're in development mode without a real API key
const isDevelopmentMode = !process.env.RESEND_API_KEY;

export const sendEmail = async ({
    to,
    subject,
    text,
}: {
    to: string;
    subject: string;
    text: string;
}) => {
    // In development mode without API key, log instead of sending
    if (isDevelopmentMode) {
        console.log('\n[DEV MODE] Email would be sent:');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${text}\n`);
        return { id: 'dev-mode-email-id' };
    }
    
    // In production, actually send the email
    return await resend.emails.send({
        from: "Melusi Mbatha <me@mbathamelusi.co.za>",
        to,
        subject,
        text,
    });
};
