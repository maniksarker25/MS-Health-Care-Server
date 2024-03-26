import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
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
    console.log(uploadImage);
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

export const userService = {
  createAdminIntoDB,
};
