import type { GameStatus } from "./trivia";

/**
 * ¿Hay que cerrar la pregunta abierta sin esperar al cronómetro?
 *
 * Vive aparte y sin dependencias a propósito: es la única pieza de la cabina
 * que no se puede probar a mano sin seis celulares y una partida en curso, así
 * que conviene poder probarla sola. Ver trivia-cierre.test.ts.
 */
export function debeCerrarPregunta(estado: {
  /** El estado del juego. Solo se cierra una pregunta que esté abierta. */
  status: GameStatus;
  /** Id de la pregunta abierta, o null si no hay ninguna. */
  questionId: string | null;
  /** Cuántos respondieron la pregunta abierta. */
  respondieron: number;
  /**
   * A cuántos hay que esperar. Cero significa «no se sabe todavía» —pasa en la
   * primera pregunta de la ronda, cuando nadie tiene puntaje—, y entonces no
   * se cierra sola: cerrar con cero esperados dispararía el cierre antes de
   * que alguien alcance a responder.
   */
  esperados: number;
  /** La pregunta que ya se cerró automáticamente, para no cerrarla dos veces. */
  yaCerrada: string | null;
  /** Si hay otra operación en curso (calificar, abrir, sembrar). */
  ocupado: boolean;
}): boolean {
  const { status, questionId, respondieron, esperados, yaCerrada, ocupado } = estado;

  if (ocupado) return false;
  if (status !== "question") return false;
  if (!questionId) return false;
  if (esperados <= 0) return false;
  if (yaCerrada === questionId) return false;

  // `>=` y no `===`: si alguien entra a la ronda a mitad y responde, pueden
  // llegar más respuestas que jugadores detectados. Con `===` ese caso se
  // saltaría el cierre y habría que esperar al cronómetro igual.
  return respondieron >= esperados;
}
