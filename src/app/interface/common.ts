import { UserRole } from "@prisma/client";

export type TAuthUser = {
  email: string;
  role: UserRole;
} | null;
