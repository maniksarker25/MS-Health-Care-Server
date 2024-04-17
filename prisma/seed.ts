import { UserRole } from "@prisma/client";
import prisma from "../src/app/utils/prisma";

const seedSuperAdmin = async () => {
  try {
    const isExistsSuperAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });
    if (isExistsSuperAdmin) {
      console.log("Super admin is already exists");
      return;
    }
    const createSuperAdmin = await prisma.user.create({
      data: {
        email: "super@gmail.com",
        password: "superadmin",
        role: UserRole.SUPER_ADMIN,
        admin: {
          create: {
            name: "Super Admin",
            // email: "super@gmail.com",
            contactNumber: "017777777",
          },
        },
      },
    });
    console.log("super admin created successfully", createSuperAdmin);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
