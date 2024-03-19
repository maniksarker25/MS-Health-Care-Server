import { Admin, Prisma, PrismaClient } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import { calculatePagination } from "../../helpers/paginationHelper";

const prisma = new PrismaClient();

const getAllAdminFromDB = async (query: any, options: any) => {
  const { searchTerm, ...filterData } = query;
  // const { limit, page } = options;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  // console.log(filterData);

  const andConditions: Prisma.AdminWhereInput[] = [];
  // [
  //   {
  //     name: {
  //       contains: query?.searchTerm,
  //       mode: "insensitive",
  //     },
  //   },
  //   {
  //     email: {
  //       contains: query?.searchTerm,
  //       mode: "insensitive",
  //     },
  //   },
  // ],
  if (query?.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
        [field]: {
          contains: query?.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  // console.dir(andConditions, { depth: "infinity" });

  // make queries for filter data
  if (Object.keys(filterData)?.length > 0) {
    andConditions.push({
      AND: Object.keys(filterData)?.map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.AdminWhereInput = { AND: andConditions };
  const result = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options?.sortOrder
        ? {
            [options?.sortBy]: options?.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });
  const total = await prisma.admin.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get single admin from db
const getSingleAdminFromDB = async (id: string) => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
    },
  });
  return result;
};

// update admin into db
const updateAdminIntoDB = async (id: string, payload: Partial<Admin>) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.admin.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

// delete admin from db
const deleteAdminFromDB = async (id: string) => {
  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.delete({
      where: {
        id,
      },
    });
    const userDeletedData = await transactionClient.user.delete({
      where: {
        email: adminDeletedData?.email,
      },
    });
    return adminDeletedData;
  });

  return result;
};

export const adminService = {
  getAllAdminFromDB,
  getSingleAdminFromDB,
  updateAdminIntoDB,
  deleteAdminFromDB,
};
