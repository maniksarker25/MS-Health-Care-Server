import { UserRole } from "@prisma/client";
import { IGenericErrorMessage } from "./error";
export type TAuthUser = {
  email: string;
  role: UserRole;
} | null;

export type IGenericResponse<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[];
};
