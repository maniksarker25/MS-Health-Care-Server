import { Specialties } from "@prisma/client";
import { IFile } from "../../interface/file";
import { fileUploader } from "../../helpers/fileUploader";
import prisma from "../../utils/prisma";

const createSpecialtiesIntoDB = async (file: IFile, payload: Specialties) => {
  console.log(file, payload);
  if (file) {
    const imageName = file.originalname;
    const uploadImage = await fileUploader.uploadImageToCloudinary(
      imageName,
      file?.path
    );
    payload.icon = uploadImage?.secure_url as string;
  }

  const result = await prisma.specialties.create({
    data: payload,
  });

  return result;
};

export const specialtiesService = {
  createSpecialtiesIntoDB,
};
