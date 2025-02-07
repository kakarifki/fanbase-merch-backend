import { Hono } from 'hono'
import productRoutes from './routes/product.routes'
import { cors } from 'hono/cors';
// import { serve } from '@hono/node-server'

const app = new Hono()



app.use('*', cors());

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/products', productRoutes)

export default app
