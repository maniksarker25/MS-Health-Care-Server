import multer from "multer";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import config from "../config";
cloudinary.config({
  cloud_name: "dp6nuvot3",
  api_key: "578152791375281",
  api_secret: "N8x2HVDeXXZvOUJkAV40S-nWx-g",
});

const uploadImageToCloudinary = async (
  imageName: string,
  path: string
): Promise<Record<string, unknown>> => {
  // console.log("from image uploader", imageName, path);
  //* make by me-------------
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      { public_id: imageName },
      function (error, result) {
        if (error) {
          reject(error);
        }
        resolve(result as UploadApiResponse);
        fs.unlink(path, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("file is deleted successfully");
          }
        });
      }
    );
  });
  //! from cloudinary
  // cloudinary.uploader.upload(
  //   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  //   { public_id: "olympic_flag" },
  //   function (error, result) {
  //     console.log(result);
  //   }
  // );
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + "/uploads");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export const fileUploader = {
  upload,
  uploadImageToCloudinary,
};
