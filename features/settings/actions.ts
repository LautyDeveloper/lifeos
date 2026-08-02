"use server"

import { revalidatePath } from "next/cache"

import type {
  CreateContainerActionState,
  UpdateAreaActionState,
  UpdateContainerActionState,
} from "@/features/settings/action-state"
import type { ActionResult } from "@/types/action-result"
import {
  archiveContainer,
  createContainer,
  moveArea,
  moveContainer,
  restoreContainer,
  updateAreaDetails,
  updateContainerDetails,
} from "@/features/settings/repository"
import {
  archiveContainerSchema,
  createContainerSchema,
  moveAreaSchema,
  moveContainerSchema,
  restoreContainerSchema,
  updateAreaDetailsSchema,
  updateContainerDetailsSchema,
} from "@/features/settings/schemas"

function revalidateSetupPaths() {
  revalidatePath("/settings")
  revalidatePath("/")
  revalidatePath("/inbox")
  revalidatePath("/today")
  revalidatePath("/parking")
  revalidatePath("/work")
  revalidatePath("/dev")
  revalidatePath("/study")
  revalidatePath("/health")
}

export async function updateAreaDetailsAction(
  previousState: UpdateAreaActionState,
  formData: FormData
): Promise<UpdateAreaActionState> {
  const parsed = updateAreaDetailsSchema.safeParse({
    areaId: formData.get("areaId"),
    name: formData.get("name"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "No pudimos actualizar esa área.",
      fieldErrors: {
        areaId: fieldErrors.areaId,
        name: fieldErrors.name,
        icon: fieldErrors.icon,
        color: fieldErrors.color,
      },
      resetKey: previousState.resetKey,
    }
  }

  try {
    await updateAreaDetails(parsed.data)
  } catch (error) {
    console.error("Failed to update area", error)
    return {
      status: "error",
      message: "No pudimos actualizar esa área.",
      resetKey: previousState.resetKey,
    }
  }

  revalidateSetupPaths()

  return {
    status: "success",
    message: "Área actualizada.",
    resetKey: previousState.resetKey + 1,
  }
}

export async function moveAreaAction(formData: FormData): Promise<ActionResult> {
  const parsed = moveAreaSchema.safeParse({
    areaId: formData.get("areaId"),
    direction: formData.get("direction"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos mover esa área." }
  }

  try {
    await moveArea(parsed.data)
  } catch (error) {
    console.error("Failed to move area", error)
    return { status: "error", message: "No pudimos mover esa área." }
  }

  revalidateSetupPaths()
  return { status: "success", message: "Orden del área actualizado.", entityId: parsed.data.areaId }
}

export async function createContainerAction(
  previousState: CreateContainerActionState,
  formData: FormData
): Promise<CreateContainerActionState> {
  const parsed = createContainerSchema.safeParse({
    areaId: formData.get("areaId"),
    name: formData.get("name"),
    description: formData.get("description"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "No pudimos crear ese container.",
      fieldErrors: {
        areaId: fieldErrors.areaId,
        name: fieldErrors.name,
        description: fieldErrors.description,
      },
      resetKey: previousState.resetKey,
    }
  }

  try {
    await createContainer(parsed.data)
  } catch (error) {
    console.error("Failed to create container", error)
    return {
      status: "error",
      message: "No pudimos crear ese container.",
      resetKey: previousState.resetKey,
    }
  }

  revalidateSetupPaths()

  return {
    status: "success",
    message: "Container creado.",
    resetKey: previousState.resetKey + 1,
  }
}

export async function updateContainerDetailsAction(
  previousState: UpdateContainerActionState,
  formData: FormData
): Promise<UpdateContainerActionState> {
  const parsed = updateContainerDetailsSchema.safeParse({
    containerId: formData.get("containerId"),
    name: formData.get("name"),
    description: formData.get("description"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "No pudimos actualizar ese container.",
      fieldErrors: {
        containerId: fieldErrors.containerId,
        name: fieldErrors.name,
        description: fieldErrors.description,
      },
      resetKey: previousState.resetKey,
    }
  }

  try {
    await updateContainerDetails(parsed.data)
  } catch (error) {
    console.error("Failed to update container", error)
    return {
      status: "error",
      message: "No pudimos actualizar ese container.",
      resetKey: previousState.resetKey,
    }
  }

  revalidateSetupPaths()

  return {
    status: "success",
    message: "Container actualizado.",
    resetKey: previousState.resetKey + 1,
  }
}

export async function archiveContainerAction(formData: FormData): Promise<ActionResult> {
  const parsed = archiveContainerSchema.safeParse({
    containerId: formData.get("containerId"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos archivar ese container." }
  }

  try {
    await archiveContainer(parsed.data)
  } catch (error) {
    console.error("Failed to archive container", error)
    return { status: "error", message: "No pudimos archivar ese container." }
  }

  revalidateSetupPaths()
  return { status: "success", message: "Container archivado.", entityId: parsed.data.containerId }
}

export async function restoreContainerAction(formData: FormData): Promise<ActionResult> {
  const parsed = restoreContainerSchema.safeParse({
    containerId: formData.get("containerId"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos restaurar ese container." }
  }

  try {
    await restoreContainer(parsed.data)
  } catch (error) {
    console.error("Failed to restore container", error)
    return { status: "error", message: "No pudimos restaurar ese container." }
  }

  revalidateSetupPaths()
  return { status: "success", message: "Container restaurado.", entityId: parsed.data.containerId }
}

export async function moveContainerAction(formData: FormData): Promise<ActionResult> {
  const parsed = moveContainerSchema.safeParse({
    containerId: formData.get("containerId"),
    direction: formData.get("direction"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos mover ese container." }
  }

  try {
    await moveContainer(parsed.data)
  } catch (error) {
    console.error("Failed to move container", error)
    return { status: "error", message: "No pudimos mover ese container." }
  }

  revalidateSetupPaths()
  return { status: "success", message: "Orden del container actualizado.", entityId: parsed.data.containerId }
}
