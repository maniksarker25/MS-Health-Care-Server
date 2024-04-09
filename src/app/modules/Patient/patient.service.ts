import { Doctor, Patient, Prisma, UserStatus } from "@prisma/client";
import { calculatePagination } from "../../helpers/paginationHelper";

import prisma from "../../utils/prisma";
import { TPaginationOptions } from "../../interface/pagination";
import { TPatientFilterRequest } from "./patient.interface";
import { patientSearchableFields } from "./patient.constant";

const getAllPatientFromDB = async (
  query: TPatientFilterRequest,
  options: TPaginationOptions
) => {
  const { searchTerm, ...filterData } = query;
  // const { limit, page } = options;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  // console.log(filterData);

  const andConditions: Prisma.PatientWhereInput[] = [];
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
      OR: patientSearchableFields.map((field) => ({
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
  const whereConditions: Prisma.PatientWhereInput = { AND: andConditions };
  console.dir(whereConditions, { depth: "infinity" });
  const result = await prisma.patient.findMany({
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
  const total = await prisma.patient.count({
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
const getSinglePatientFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  return result;
};

// delete doctor from db
const deletePatientFromDB = async (id: string): Promise<Patient | null> => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.$transaction(async (transactionClient) => {
    const patientDeletedData = await transactionClient.patient.delete({
      where: {
        id,
      },
    });
    await transactionClient.user.delete({
      where: {
        email: patientDeletedData?.email,
      },
    });
    return patientDeletedData;
  });

  return result;
};

// doctor soft delete
const softDeletePatientFromDB = async (id: string) => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.$transaction(async (transactionClient) => {
    const patientDeletedData = await transactionClient.patient.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
    await transactionClient.user.update({
      where: {
        email: patientDeletedData?.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return patientDeletedData;
  });

  return result;
};

export const patientService = {
  getAllPatientFromDB,
  getSinglePatientFromDB,
  deletePatientFromDB,
  softDeletePatientFromDB,
};
