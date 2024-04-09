import { z } from "zod";

const crateSpecialtiesValidationSchema = z.object({
  title: z.string({
    required_error: "Title is required",
  }),
});

export const specialtiesValidation = {
  crateSpecialtiesValidationSchema,
};
