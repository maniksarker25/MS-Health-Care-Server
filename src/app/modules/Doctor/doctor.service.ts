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
  const { searchTerm, specialties, ...filterData } = query;
  // const { limit, page } = options;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  // console.log(filterData);

  console.log(specialties);
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

  // doctor => doctorSpecialties => specialties => title
  if (specialties && specialties.length) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialties: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
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
  // console.dir(whereConditions, { depth: "infinity" });
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
            averageRating: "desc",
          },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
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

// update doctor into db
const updateDoctorIntoDB = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;
  // console.log("specialties", specialties);
  // console.log("doctorData", doctorData);
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    const updatedDoctorData = await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: true,
      },
    });

    if (specialties && specialties.length > 0) {
      // delete specialties
      const deleteSpecialties = specialties.filter(
        (specialty: any) => specialty.isDeleted
      );
      console.log("delete", deleteSpecialties);
      for (const specialty of deleteSpecialties) {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: doctorInfo?.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }
      // create specialties
      const createSpecialties = specialties.filter(
        (specialty: any) => !specialty.isDeleted
      );
      console.log("create", createSpecialties);
      for (const specialty of createSpecialties) {
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: doctorInfo?.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }
    }
  });
  const result = await prisma.doctor.findUnique({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
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
  updateDoctorIntoDB,
  deleteDoctorFromDB,
  softDeleteDoctorFromDB,
};
