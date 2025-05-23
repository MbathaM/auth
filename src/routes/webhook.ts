import 'dotenv/config';
import { Hono } from 'hono';
import { createHmac, timingSafeEqual } from 'crypto';

export const yoco = new Hono();

yoco.post('/my/webhook/url', async (c) => {
  const headers = c.req.header();
  const rawBodyBuffer = Buffer.from(await (await c.req.raw).arrayBuffer());

  const secret = process.env.YOCO_WEBHOOK_SECRET as string;
  const id = headers['webhook-id'];
  const timestamp = headers['webhook-timestamp'];
  const signatureHeader = headers['webhook-signature'];

  if (!id || !timestamp || !signatureHeader || !secret) {
    return c.text('Missing headers or secret', 400);
  }

  const signedContent = `${id}.${timestamp}.${rawBodyBuffer.toString('utf-8')}`;
  const secretBytes = Buffer.from(secret.split('_')[1], 'base64');

  const expectedSignature = createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  const signature = signatureHeader.split(' ')[0].split(',')[1];

  const isValid = timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );

  return c.text('', isValid ? 200 : 403);
});
