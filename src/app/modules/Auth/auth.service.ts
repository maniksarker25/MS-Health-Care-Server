import { TLoginUser } from "./auth.interface";

const loginUserIntoDB = async (payload: TLoginUser) => {
  console.log(payload);
};

export const authService = {
  loginUserIntoDB,
};
