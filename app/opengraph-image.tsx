import { ImageResponse } from "next/og"

export const alt = "Life OS — Capturá, decidí y avanzá"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 88,
        color: "#edf2ef",
        background: "linear-gradient(135deg, #121615 0%, #0b0d0c 58%, #18231f 100%)",
      }}
    >
      <div style={{ color: "#92b7a8", fontSize: 24, letterSpacing: 7, textTransform: "uppercase" }}>
        Life OS
      </div>
      <div style={{ maxWidth: 900, marginTop: 30, fontSize: 76, fontWeight: 700, lineHeight: 1.08 }}>
        Capturá. Decidí. Avanzá.
      </div>
      <div style={{ maxWidth: 760, marginTop: 30, color: "#aeb8b3", fontSize: 30, lineHeight: 1.45 }}>
        Un sistema personal para organizar contexto y ejecutar con foco.
      </div>
    </div>,
    size
  )
}
