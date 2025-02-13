# Backend Service for Fanbase Merch

This is the backend service for the Fanbase Merch e-commerce platform, serving as an API for handling user accounts, products, cart management, and orders.

The backend is deployed on [Render.com](https://fanbase-merch-backend.onrender.com), and it provides endpoints to interact with the frontend.

## Frontend

Frontend can be accessed at [Fanbase Merch Frontend](https://jkt48-fanbase-merch.rifkiseptiawan.com).  
Frontend repository: [GitHub Repository](https://github.com/kakarifki/fanbase-merch)

## Tech Stack

- **Hono**: Lightweight, fast web framework for building APIs.
- **Prisma**: ORM for interacting with PostgreSQL database.
- **Zod**: Schema validation library.
- **Swagger UI**: Documentation for the API (ongoing integration).
- **PostgreSQL**: Relational database for storing user and product data.

## Database Schema

The backend uses Prisma with the following models:

- **User**: Stores user details, including account info and associated orders.
- **Product**: Contains product details such as code, name, description, price, etc.
- **Cart**: Manages the user's shopping cart with product references.
- **Order**: Tracks orders placed by users, including their order items.

### User Model

- `id`: Unique identifier (UUID)
- `username`: Unique username
- `email`: Unique email address
- `password`: User password (hashed)
- `role`: Defines user role, either `USER` or `ADMIN`

### Product Model

- `id`: Unique identifier (UUID)
- `code`: Unique product code
- `name`: Product name
- `price`: Product price
- `description`: Product description (optional)
- `imageUrl`: URL to product image (optional)
- `fanbase`: Fanbase related to the product (optional)

### Cart Model

- `id`: Unique cart item identifier (UUID)
- `userId`: Reference to the user who owns the cart
- `productId`: Reference to the product in the cart
- `quantity`: Number of units of the product

### Order Model

- `id`: Unique order identifier (UUID)
- `userId`: Reference to the user who placed the order
- `totalPrice`: Total order price
- `status`: Order status (`PENDING` or `COMPLETED`)

## API Endpoints

The API provides CRUD operations for managing users, products, and cart items, as well as processing orders.

### Products

- **GET** `/products`: Retrieve a list of all products.
- **POST** `/products`: Create a new product.
- **GET** `/products/:code`: Get details of a product by its unique code.

### Cart

- **GET** `/cart`: Get the current user's cart.
- **POST** `/cart/items`: Add an item to the user's cart.
- **DELETE** `/cart/items`: Remove an item from the user's cart.

### Orders

- **POST** `/order/checkout`: Create a new order from the user's cart.
- **GET** `/order/:orderId`: Get the details of a specific order by its ID.
- **GET** `/order`: Get all orders for the logged-in user.

## Authentication

Authentication is handled using JWT tokens, and users must be logged in to access certain endpoints (e.g., placing orders, viewing cart).

The `checkAuth` middleware is used to verify the authenticity of the user.