import { Layers3, SlidersHorizontal } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { EmptyState } from "@/components/ui/empty-state"
import { AreaSettingsCard } from "@/features/settings/components/area-settings-card"
import { ContainerSettingsCard } from "@/features/settings/components/container-settings-card"
import { CreateContainerForm } from "@/features/settings/components/create-container-form"
import type { SystemSetup } from "@/features/settings/repository"

export function SettingsView({ setup }: { setup: SystemSetup | null }) {
  if (!setup) {
    return (
      <PageShell
        eyebrow="Configuración"
        title="Un setup mínimo para un sistema administrable."
        description="Cuando no hay base de datos, Life OS sigue mostrando estructura, pero todavía no puede administrarla."
      >
        <section className="surface-1 rounded-[28px] border p-6 sm:p-8">
          <EmptyState
            icon={SlidersHorizontal}
            title="Configurá la base de datos para administrar el sistema."
            description="Settings necesita una conexión activa para editar áreas y containers reales."
          />
        </section>
      </PageShell>
    )
  }

  const totalContainers = setup.areas.reduce((sum, area) => sum + area.containers.length, 0)

  return (
    <PageShell
      eyebrow="Configuración"
      title="Setup mínimo para que el sistema deje de depender de seeds."
      description="Administrá áreas y containers sin convertir esto en un panel gigante."
      actions={
        <div className="meta-row">
          <span className="meta-item"><b className="text-white">{setup.areas.length}</b> áreas</span>
          <span className="meta-item"><b className="text-white">{totalContainers}</b> containers</span>
        </div>
      }
    >
      <section className="surface-1 rounded-[30px] border p-5 sm:p-7">
        <div className="mb-5">
          <p className="eyebrow">Áreas</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Metadata y orden visibles del sistema</h3>
        </div>
        <div className="space-y-4">
          {setup.areas.map((area, index) => (
            <AreaSettingsCard
              key={area.id}
              area={area}
              canMoveUp={index > 0}
              canMoveDown={index < setup.areas.length - 1}
            />
          ))}
        </div>
      </section>

      <section className="surface-1 rounded-[30px] border p-5 sm:p-7">
        <div className="mb-5">
          <p className="eyebrow">Containers</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Espacios administrables dentro de cada área</h3>
        </div>

        <div className="space-y-6">
          {setup.areas.map((area) => {
            const activeContainers = area.containers.filter((container) => !container.archived)
            const archivedContainers = area.containers.filter((container) => container.archived)

            return (
              <section key={area.id} className="surface-2 rounded-[24px] border p-4 sm:p-5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                  <div>
                    <p className="content-title">{area.name}</p>
                    <p className="context-line mt-1">
                      Containers activos y archivados dentro de esta área.
                    </p>
                  </div>
                  <CreateContainerForm areaId={area.id} />
                </div>

                <div className="mt-5 space-y-4">
                  <div className="space-y-3">
                    <div className="meta-row">
                      <span className="meta-item">Activos</span>
                      <span className="meta-item">{activeContainers.length}</span>
                    </div>
                    {activeContainers.length ? (
                      activeContainers.map((container, index) => (
                        <ContainerSettingsCard
                          key={container.id}
                          container={container}
                          canMoveUp={index > 0}
                          canMoveDown={index < activeContainers.length - 1}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Todavía no hay containers activos en esta área.</p>
                    )}
                  </div>

                  <div className="space-y-3 border-t border-white/[0.08] pt-4">
                    <div className="meta-row">
                      <span className="meta-item">Archivados</span>
                      <span className="meta-item">{archivedContainers.length}</span>
                    </div>
                    {archivedContainers.length ? (
                      archivedContainers.map((container, index) => (
                        <ContainerSettingsCard
                          key={container.id}
                          container={container}
                          canMoveUp={index > 0}
                          canMoveDown={index < archivedContainers.length - 1}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay containers archivados en esta área.</p>
                    )}
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        {!setup.areas.length ? (
          <div className="mt-8">
            <EmptyState
              icon={Layers3}
              title="Todavía no hay áreas configuradas."
              description="Cuando exista una base mínima de áreas, desde acá vas a poder administrar sus containers."
            />
          </div>
        ) : null}
      </section>
    </PageShell>
  )
}
