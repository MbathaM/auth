import { siteConfig } from '@/config/site';
import { Hono } from 'hono'
export const hello = new Hono()
hello.get('/', (c) => c.json({ 
    name: siteConfig.name,
    version: '1.0.0',
    status: 'ok',
    message: 'Auth server is running' 
  }));