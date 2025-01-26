import { Hono } from "hono";
import { createProduct, getProductByCode } from "../controllers/product.controller";

const productRoutes = new Hono()

productRoutes.get('/:code', getProductByCode);
productRoutes.post('/', createProduct)

export default productRoutes;