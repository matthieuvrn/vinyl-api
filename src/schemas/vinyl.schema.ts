import { z } from "zod";

const conditionEnum = z.enum(["neuf", "bon", "use"]);

export const createVinylSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  releaseDate: z.coerce.date().refine((d) => d.getFullYear() >= 1900, {
    message: "La date de sortie doit être postérieure à 1900",
  }),
  condition: conditionEnum,
  price: z.number().positive("Le prix doit être positif"),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif").default(0),
  groupId: z.uuid("L'identifiant du groupe est invalide"),
});

export const updateVinylSchema = z.object({
  title: z.string().min(1, "Le titre est requis").optional(),
  releaseDate: z.coerce
    .date()
    .refine((d) => d.getFullYear() >= 1900, {
      message: "La date de sortie doit être postérieure à 1900",
    })
    .optional(),
  condition: conditionEnum.optional(),
  price: z.number().positive("Le prix doit être positif").optional(),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif").optional(),
  groupId: z.optional(z.uuid("L'identifiant du groupe est invalide")),
});

export const updateStockSchema = z.object({
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif"),
});
