import { PrismaClient, RoleName } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

    // ✅ 1. Create Organization
    const org = await prisma.organization.upsert({
        where: { slug: 'orion' },
        update: {},
        create: {
            name: 'Orion',
            slug: 'orion',
        },
    })

    // ✅ 2. Create Roles scoped to org
    await prisma.role.createMany({
        data: [
            {
                name: RoleName.ADMIN,
                organizationId: org.id,
            },
            {
                name: RoleName.MANAGER,
                organizationId: org.id,
            },
            {
                name: RoleName.WORKER,
                organizationId: org.id,
            },
        ],
        skipDuplicates: true,
    })

    console.log('🌱 Organization + Roles seeded')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })