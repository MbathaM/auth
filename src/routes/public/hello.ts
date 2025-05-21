import { Hono } from 'hono'
export const hello = new Hono()
hello.get('/', (c) => {
    return c.text('Hello Hono!')
  })