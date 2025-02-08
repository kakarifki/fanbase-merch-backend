import { Hono } from 'hono'
import productRoutes from './routes/product.routes'
import authRoutes from './routes/auth.routes';
import { cors } from 'hono/cors';
import cartRoutes from './routes/cart.route';
import orderRoutes from './routes/order.routes';
// import { serve } from '@hono/node-server'

const app = new Hono()



app.use('*', cors());

app.get('/', (c) => {
  return c.text('Selamat datang di backend fanbase merch')
})

app.route('/products', productRoutes);
app.route('/auth', authRoutes);
app.route('/cart', cartRoutes);
app.route('/order', orderRoutes);

export default app
