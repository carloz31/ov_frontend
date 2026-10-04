export type FollowUpTurn = {
  orden: 1 | 2
  pregunta: string
  respuesta?: string
  omitida: boolean
  creadaEn: string
  respondidaEn?: string
}

export type FollowUpInput = {
  activityId: string
  nodeId: string
  premisa: string
  ayuda?: string
  texto: string
  minCaracteres?: number
  turnosPrevios: FollowUpTurn[]
}

export interface FollowUpService {
  evaluate(input: FollowUpInput): Promise<{ pregunta?: string }>
}

export const mockFollowUpService: FollowUpService = {
  async evaluate(input) {
    await new Promise<void>((resolve) => setTimeout(resolve, 700))
    if (input.turnosPrevios.length === 0)
      return input.texto.length < Math.max(80, (input.minCaracteres ?? 0) * 2)
        ? {
            pregunta:
              '¿Podrías contarme un poco más? Por ejemplo, un momento concreto o la razón detrás de lo que escribiste.',
          }
        : {}
    const first = input.turnosPrevios[0]
    return input.turnosPrevios.length === 1 &&
      !first.omitida &&
      first.respuesta !== undefined &&
      first.respuesta.length < 40
      ? { pregunta: '¿Hay algo más que te gustaría agregar antes de seguir?' }
      : {}
  },
}

export async function evaluateFollowUp(
  service: FollowUpService,
  input: FollowUpInput,
): Promise<{ pregunta?: string }> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      service.evaluate(input),
      new Promise<{ pregunta?: string }>((resolve) => {
        timer = setTimeout(() => resolve({}), 10_000)
      }),
    ])
  } catch {
    return {}
  } finally {
    clearTimeout(timer)
  }
}
