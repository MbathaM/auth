import { siteConfig } from '@/config/site';
import { Hono } from 'hono'

export const home = new Hono()

home.get('/', (c) => c.json({ 
    name: siteConfig.name,
    version: '1.0.0',
    status: 'ok',
    message: 'Server is running' 
  }));