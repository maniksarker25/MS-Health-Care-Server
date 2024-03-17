import { Prisma, PrismaClient } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";

const prisma = new PrismaClient();
const getAllAdminFromDB = async (query: any, options: any) => {
  const { searchTerm, ...filterData } = query;
  const { limit, page } = options;
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
    skip: (page - 1) * limit,
  });
  return result;
};

export const adminService = {
  getAllAdminFromDB,
};
