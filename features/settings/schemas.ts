import { z } from "zod"

import { areaColorOptions, areaIconOptions } from "@/features/settings/config"

export const updateAreaDetailsSchema = z.object({
  areaId: z.string().uuid("Área inválida."),
  name: z
    .string()
    .trim()
    .min(1, "Escribí un nombre para el área.")
    .max(120, "El nombre del área no puede superar los 120 caracteres."),
  icon: z.enum(areaIconOptions, "Elegí un ícono válido."),
  color: z.enum(areaColorOptions, "Elegí un color válido."),
})

export const moveAreaSchema = z.object({
  areaId: z.string().uuid("Área inválida."),
  direction: z.enum(["up", "down"]),
})

export const createContainerSchema = z.object({
  areaId: z.string().uuid("Área inválida."),
  name: z
    .string()
    .trim()
    .min(1, "Escribí un nombre para el container.")
    .max(160, "El nombre del container no puede superar los 160 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres.")
    .optional(),
})

export const updateContainerDetailsSchema = z.object({
  containerId: z.string().uuid("Container inválido."),
  name: z
    .string()
    .trim()
    .min(1, "Escribí un nombre para el container.")
    .max(160, "El nombre del container no puede superar los 160 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres.")
    .optional(),
})

export const archiveContainerSchema = z.object({
  containerId: z.string().uuid("Container inválido."),
})

export const restoreContainerSchema = z.object({
  containerId: z.string().uuid("Container inválido."),
})

export const moveContainerSchema = z.object({
  containerId: z.string().uuid("Container inválido."),
  direction: z.enum(["up", "down"]),
})

export type UpdateAreaDetailsInput = z.infer<typeof updateAreaDetailsSchema>
export type MoveAreaInput = z.infer<typeof moveAreaSchema>
export type CreateContainerInput = z.infer<typeof createContainerSchema>
export type UpdateContainerDetailsInput = z.infer<typeof updateContainerDetailsSchema>
export type ArchiveContainerInput = z.infer<typeof archiveContainerSchema>
export type RestoreContainerInput = z.infer<typeof restoreContainerSchema>
export type MoveContainerInput = z.infer<typeof moveContainerSchema>
