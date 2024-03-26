import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt, { compareSync } from "bcrypt";
import { fileUploader } from "../../helpers/fileUploader";
const prisma = new PrismaClient();
const createAdminIntoDB = async (
  file: any,
  password: string,
  adminData: any
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
  doctorData: any
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
  patientData: any
) => {
  console.log("Patient", password, patientData);
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
    role: UserRole.DOCTOR,
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
export const userService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
};
