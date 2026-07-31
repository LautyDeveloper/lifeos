import { z } from "zod"

export const createLibraryNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Escribí un título para guardar la nota.")
    .max(180, "El título no puede superar los 180 caracteres."),
  content: z
    .string()
    .min(1, "Escribí algo dentro de la nota antes de guardarla.")
    .refine((value) => value.trim().length > 0, {
      message: "Escribí algo dentro de la nota antes de guardarla.",
    }),
})

export const updateLibraryNoteSchema = z.object({
  id: z.string().uuid("Nota inválida."),
  title: z
    .string()
    .trim()
    .min(1, "Escribí un título para guardar la nota.")
    .max(180, "El título no puede superar los 180 caracteres."),
  content: z
    .string()
    .min(1, "Escribí algo dentro de la nota antes de guardarla.")
    .refine((value) => value.trim().length > 0, {
      message: "Escribí algo dentro de la nota antes de guardarla.",
    }),
})

const libraryNoteIdSchema = z.object({
  id: z.string().uuid("Nota inválida."),
})

export type CreateLibraryNoteInput = z.infer<typeof createLibraryNoteSchema>
export type UpdateLibraryNoteInput = z.infer<typeof updateLibraryNoteSchema>
export const archiveLibraryNoteSchema = libraryNoteIdSchema
export const restoreLibraryNoteSchema = libraryNoteIdSchema
export const deleteLibraryNoteSchema = libraryNoteIdSchema
export type ArchiveLibraryNoteInput = z.infer<typeof archiveLibraryNoteSchema>
export type RestoreLibraryNoteInput = z.infer<typeof restoreLibraryNoteSchema>
export type DeleteLibraryNoteInput = z.infer<typeof deleteLibraryNoteSchema>
