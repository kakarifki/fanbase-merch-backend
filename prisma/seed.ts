import { PrismaClient } from "@prisma/client";
import productData from '../src/seed/product.json';

const prisma = new PrismaClient()

async function main() {
    // Seeding products
    await prisma.product.createMany({
        data: productData,
    })
    console.log('Seeding Products completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })