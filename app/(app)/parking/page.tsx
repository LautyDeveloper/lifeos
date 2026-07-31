import type { Metadata } from "next"

import { ParkingView } from "@/features/parking/components/parking-view"
import { getParkingProjects } from "@/features/parking/repository"

export const metadata: Metadata = {
  title: "Estacionados",
}

export default async function ParkingPage() {
  const projects = await getParkingProjects()

  return <ParkingView projects={projects} />
}
