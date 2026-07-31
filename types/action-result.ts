export type ActionResult = {
  status: "success" | "error"
  message: string
  entityId?: string
}
