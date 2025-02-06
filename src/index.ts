import { Hono } from 'hono'
import productRoutes from './routes/product.routes'
import { cors } from 'hono/cors';
import { auth } from './utils/auth'
import prisma from './db/prisma';
// import { serve } from '@hono/node-server'

const app = new Hono()


app.use('*', cors());

// // Dummy handler untuk pengujian
// app.post('/api/auth/dummy-register', async (c) => {
//   console.log("Dummy register terpanggil!");
//   try {
//     const body = await c.req.json(); // Ganti parseBody() dengan json()
//     console.log("Dummy Request Body:", body);
//     return c.json({ message: "Dummy register berhasil!", data: body }, 201);
//   } catch (error) {
//     console.error("Error parsing JSON:", error);
//     return c.json({ message: "Error parsing JSON", error: error.message }, 400);
//   }
// });


// Mount the auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
  });

// Contoh (dengan asumsi kamu menggunakan Prisma)
// app.post('/api/auth/dummy-register', async (c) => {
//   console.log("Dummy register terpanggil!");
//   try {
//     const body = await c.req.json();
//     console.log("Dummy Request Body:", body);

//     console.log("Mencoba membuat user di database...");
//     const newUser = await prisma.user.create({
//       data: {
//         username: body.username,
//         name: body.name,
//         email: body.email,
//         password: body.password,
//         emailVerified: body.emailVerified // JANGAN SIMPAN PASSWORD SECARA LANGSUNG! HASH DULU!
//       },
//     });
//     console.log("User berhasil dibuat di database:", newUser);

//     return c.json({ message: "Dummy register berhasil!", data: newUser }, 201);
//   } catch (error) {
//     console.error("Error membuat user:", error);
//     return c.json({ message: "Error membuat user", error: error.message }, 500);
//   }
// });

// Mount the auth handler
// app.on(["POST", "GET"], "/api/auth/*", async (c) => {
//   console.log("Better Auth handler terpanggil!");

//   try {
//     const request = new Request(c.req.url, {
//       method: c.req.method,
//       headers: c.req.header(),  // Copy headers
//       body: c.req.method !== 'GET' ? JSON.stringify(await c.req.json()) : null, // Copy body for non-GET requests
//     });

//     const response = await auth.handler(request); // Pass the new Request object
//     console.log("Better Auth Response:", response); // Log the response
//     return response;
//   } catch (error) {
//     console.error("Error di dalam Better Auth handler:", error);
//     return c.json({ message: 'Internal Server Error', error: error.message }, 500); // Kirim error ke client
//   }
// });


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/products', productRoutes)

export default app
