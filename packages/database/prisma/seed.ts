import { PrismaClient, RoleName, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('Admin123!', 10);
  console.log("DATABASE_URL =", process.env.DATABASE_URL);

  await prisma.$transaction(async (tx) => {
    
    // 1️⃣ Organization
    const org = await tx.organization.upsert({
      where: { slug: 'default-org' },
      update: {},
      create: {
        name: 'Default Organization',
        slug: 'default-org',
      },
    })

    // 2️⃣ Roles
    const roles = await Promise.all([
      tx.role.upsert({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: RoleName.ADMIN,
          },
        },
        update: {},
        create: {
          name: RoleName.ADMIN,
          organizationId: org.id,
        },
      }),
      tx.role.upsert({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: RoleName.MANAGER,
          },
        },
        update: {},
        create: {
          name: RoleName.MANAGER,
          organizationId: org.id,
        },
      }),
      tx.role.upsert({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: RoleName.WORKER,
          },
        },
        update: {},
        create: {
          name: RoleName.WORKER,
          organizationId: org.id,
        },
      }),
    ])

    const adminRole = roles.find(r => r.name === RoleName.ADMIN)!

    // 3️⃣ Admin user
    const admin = await tx.user.upsert({
      where: { email: 'admin@local.dev' },
      update: {},
      create: {
        email: 'admin@local.dev',
        password,
        status: UserStatus.ACTIVE,
      },
    })

    // 4️⃣ Membership
    await tx.membership.upsert({
      where: {
        userId_organizationId: {
          userId: admin.id,
          organizationId: org.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        organizationId: org.id,
        roleId: adminRole.id,
      },
    })
  })
}

main()
  .then(() => {
    console.log('🌱 Database seeded with SUPER ADMIN')
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect())