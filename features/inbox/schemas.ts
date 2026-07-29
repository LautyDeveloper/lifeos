import { z } from "zod"

export const createInboxItemSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Capturá algo antes de guardarlo.")
    .max(500, "Mantenelo corto. Hasta 500 caracteres alcanza para capturar."),
})

export type CreateInboxItemInput = z.infer<typeof createInboxItemSchema>
