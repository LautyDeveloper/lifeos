import OpenAI from "openai"

import { DomainError } from "@/lib/domain-errors"
import {
  suggestInboxProcessingInputSchema,
  suggestInboxProcessingResultSchema,
  type SuggestInboxProcessingInput,
} from "@/features/inbox-ai/schemas"
import { normalizeInboxSuggestion } from "@/features/inbox-ai/utils"
import { isDemoReadOnly } from "@/lib/demo-mode"

const INBOX_SUGGESTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["suggestedTarget", "suggestedTitle"],
  properties: {
    suggestedTarget: {
      type: "string",
      enum: ["project", "task", "note"],
    },
    suggestedTitle: {
      type: "string",
      minLength: 1,
      maxLength: 180,
    },
    suggestedDescription: {
      type: "string",
      maxLength: 2000,
    },
    suggestedContent: {
      type: "string",
      maxLength: 8000,
    },
    reason: {
      type: "string",
      maxLength: 240,
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
  },
} as const

const MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5.5"
const REQUEST_TIMEOUT_MS = 15_000
const MAX_ATTEMPTS = 2

let client: OpenAI | null = null

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()

  if (!apiKey) {
    throw new DomainError("service_unavailable", "OPENAI_API_KEY is not configured.")
  }

  if (!client) {
    client = new OpenAI({ apiKey })
  }

  return client
}

export function isInboxAiAvailable() {
  return !isDemoReadOnly() && Boolean(process.env.OPENAI_API_KEY?.trim())
}

function getErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return null
  }

  return typeof error.status === "number" ? error.status : null
}

function isAbortError(error: unknown) {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")
}

function isRetryableServiceError(error: unknown) {
  if (isAbortError(error)) return true
  if (error instanceof DomainError) return error.code === "invalid_service_response"

  const status = getErrorStatus(error)
  return status === 408 || status === 409 || status === 429 || (status !== null && status >= 500)
}

export async function withInboxAiRetry<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: { timeoutMs?: number; attempts?: number } = {}
) {
  const attempts = options.attempts ?? MAX_ATTEMPTS
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation(AbortSignal.timeout(timeoutMs))
    } catch (error) {
      lastError = error
      if (!isRetryableServiceError(error) || attempt === attempts - 1) break
    }
  }

  if (isAbortError(lastError)) {
    throw new DomainError("service_timeout", "OpenAI request timed out.")
  }

  if (lastError instanceof DomainError) throw lastError
  throw new DomainError("service_unavailable", "OpenAI is temporarily unavailable.")
}

export async function suggestInboxProcessing(input: SuggestInboxProcessingInput) {
  const parsedInput = suggestInboxProcessingInputSchema.parse(input)
  const openai = getOpenAiClient()

  return withInboxAiRetry(async (signal) => {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "inbox_processing_suggestion",
          strict: true,
          schema: INBOX_SUGGESTION_SCHEMA,
        },
      },
      messages: [
        {
          role: "developer",
          content:
            "Sos el asistente de Life OS. Clasificás capturas de inbox en un único destino: project, task o note. Elegí project si la captura describe una iniciativa con varios pasos o estructura futura. Elegí task si es una acción concreta y ejecutable. Elegí note si es conocimiento, idea o referencia para guardar. Devolvé un título breve, claro y accionable en español. Solo sugerí descripción cuando ayude a crear un proyecto. Solo sugerí contenido cuando el destino sea note. Mantené el tono sobrio y útil. Nunca inventes IDs, proyectos, containers ni fechas.",
        },
        {
          role: "user",
          content: `Captura:\n${parsedInput.content}`,
        },
      ],
    }, { signal })

  const responseText = completion.choices[0]?.message?.content?.trim()

  if (!responseText) {
    throw new DomainError("invalid_service_response", "OpenAI returned an empty suggestion.")
  }

  let parsedSuggestion: unknown

  try {
    parsedSuggestion = JSON.parse(responseText)
  } catch {
    throw new DomainError("invalid_service_response", "OpenAI returned invalid JSON.")
  }

  const validated = suggestInboxProcessingResultSchema.safeParse(parsedSuggestion)

  if (!validated.success) {
    throw new DomainError("invalid_service_response", "OpenAI suggestion did not match the expected schema.")
  }

    return normalizeInboxSuggestion(validated.data, parsedInput.content)
  })
}
