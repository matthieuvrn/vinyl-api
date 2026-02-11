import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  genre: z.string().min(1, "Le genre est requis"),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  genre: z.string().min(1, "Le genre est requis").optional(),
});
