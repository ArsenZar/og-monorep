import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.role.createMany({
        data: [
            { name: 'admin' },
            { name: 'manager' },
            { name: 'worker' },
        ],
        skipDuplicates: true,
    })
}

main()
    .then(() => {
        console.log('🌱 Roles seeded')
    })
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
