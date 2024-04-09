import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { calculatePagination } from "../../helpers/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import prisma from "../../utils/prisma";
import { TPaginationOptions } from "../../interface/pagination";
import { TDoctorFilterRequest } from "./doctor.interface";

const getAllDoctorFromDB = async (
  query: TDoctorFilterRequest,
  options: TPaginationOptions
) => {
  const { searchTerm, ...filterData } = query;
  // const { limit, page } = options;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  // console.log(filterData);

  const andConditions: Prisma.DoctorWhereInput[] = [];
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
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: query?.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  andConditions.push({
    isDeleted: false,
  });
  // console.dir(andConditions, { depth: "infinity" });

  // make queries for filter data
  if (Object.keys(filterData)?.length > 0) {
    andConditions.push({
      AND: Object.keys(filterData)?.map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.DoctorWhereInput = { AND: andConditions };
  console.dir(whereConditions, { depth: "infinity" });
  const result = await prisma.doctor.findMany({
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
  const total = await prisma.doctor.count({
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
// get single doctor from db
const getSingleDoctorFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};

// delete doctor from db
const deleteDoctorFromDB = async (id: string): Promise<Doctor | null> => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.$transaction(async (transactionClient) => {
    const doctorDeletedData = await transactionClient.doctor.delete({
      where: {
        id,
      },
    });
    await transactionClient.user.delete({
      where: {
        email: doctorDeletedData?.email,
      },
    });
    return doctorDeletedData;
  });

  return result;
};

// doctor soft delete
const softDeleteDoctorFromDB = async (id: string) => {
  await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.$transaction(async (transactionClient) => {
    const doctorDeletedData = await transactionClient.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
    await transactionClient.user.update({
      where: {
        email: doctorDeletedData?.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return doctorDeletedData;
  });

  return result;
};

export const doctorService = {
  getAllDoctorFromDB,
  getSingleDoctorFromDB,
  deleteDoctorFromDB,
  softDeleteDoctorFromDB,
};