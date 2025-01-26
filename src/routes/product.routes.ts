import { Hono } from "hono";
import { getProductByCode } from "../controllers/product.controller";

const productRoutes = new Hono()

productRoutes.get('/:code', getProductByCode);

export default productRoutes;