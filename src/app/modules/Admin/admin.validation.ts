import { z } from "zod";

const createAdminValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be string",
    }),
    email: z.string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a email",
    }),
    contactNumber: z.string({ required_error: "Contact Number is required" }),
  }),
});

const updateAdminValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

export const adminValidation = {
  createAdminValidationSchema,
  updateAdminValidationSchema,
};
