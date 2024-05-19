import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  UserRole,
  UserStatus,
} from "@prisma/client";
import bcrypt, { compareSync } from "bcrypt";
import { fileUploader } from "../../helpers/fileUploader";
import { TPaginationOptions } from "../../interface/pagination";
import { calculatePagination } from "../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { symbol } from "zod";
import { Request } from "express";
import { IFile } from "../../interface/file";
import prisma from "../../utils/prisma";
import AppError from "../../errors/appError";
import httpStatus from "http-status";
const createAdminIntoDB = async (
  file: any,
  password: string,
  adminData: Admin
) => {
  // console.log(file, password, adminData);
  if (file) {
    const imageName = file.originalname;
    const uploadImage = await fileUploader.uploadImageToCloudinary(
      imageName,
      file?.path
    );
    adminData.profilePhoto = uploadImage?.secure_url as string;
    // console.log(adminData);
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  // make user data ----------------------------------------------------------------
  const userData = {
    email: adminData?.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdAdminData = await transactionClient.admin.create({
      data: adminData,
    });
    return createdAdminData;
  });
  return result;
};

// create doctor into db
const createDoctorIntoDB = async (
  file: any,
  password: string,
  doctorData: Doctor
) => {
  // console.log("doctor", password, doctorData);
  if (file) {
    const imageName = file.originalname;
    const uploadImage = await fileUploader.uploadImageToCloudinary(
      imageName,
      file?.path
    );
    doctorData.profilePhoto = uploadImage?.secure_url as string;
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  // make user data ----------------------------------------------------------------
  const userData = {
    email: doctorData?.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdDoctorData = await transactionClient.doctor.create({
      data: doctorData,
    });
    return createdDoctorData;
  });
  return result;
};

// create patient
const createPatientIntoDB = async (
  file: any,
  password: string,
  patientData: Patient
) => {
  // console.log("Patient", password, patientData);

  const patient = await prisma.patient.findUnique({
    where: {
      email: patientData.email,
    },
  });
  if (patient) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }
  if (file) {
    const imageName = file.originalname;
    const uploadImage = await fileUploader.uploadImageToCloudinary(
      imageName,
      file?.path
    );
    patientData.profilePhoto = uploadImage?.secure_url as string;
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  // make user data ----------------------------------------------------------------
  const userData = {
    email: patientData?.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdPatientData = await transactionClient.patient.create({
      data: patientData,
    });
    return createdPatientData;
  });
  return result;
};

// get all user from db
const getAllUserFromDB = async (query: any, options: TPaginationOptions) => {
  const { searchTerm, ...filterData } = query;
  // const { limit, page } = options;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  // console.log(filterData);

  const andConditions: Prisma.UserWhereInput[] = [];
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
      OR: userSearchableFields.map((field) => ({
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
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.user.findMany({
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
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      patient: true,
      doctor: true,
    },

    // we can use include for show admin,doctor,patient profile information
    // include: {
    //   admin: true,
    //   patient: true,
    //   doctor: true,
    // },
  });
  const total = await prisma.user.count({
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

// change profile status into db
const changeProfileStatusIntoDB = async (id: string, status: UserRole) => {
  // console.log("nice", id, status);
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });
  return result;
};

const getMyProfileFromDB = async (user: JwtPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;
  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
      include: {
        doctorSpecialties: true,
      },
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }

  return { ...userInfo, ...profileInfo };
};

// ;update my profile from db
const updateMyProfileIntoDB = async (user: JwtPayload, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = req.file as IFile;
  if (file) {
    const imageName = file?.originalname;
    const uploadedImage = await fileUploader.uploadImageToCloudinary(
      imageName,
      file.path
    );
    req.body.profilePhoto = uploadedImage?.secure_url;
  }

  let profileInfo;
  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileInfo = await prisma.doctor.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileInfo = await prisma.patient.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }

  return { ...profileInfo };
};

export const userService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUserFromDB,
  changeProfileStatusIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
};
