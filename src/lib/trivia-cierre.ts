import type { GameStatus } from "./trivia";

/**
 * A cuántas personas hay que esperar antes de cerrar la pregunta sola.
 *
 * Hay tres fuentes posibles y el orden importa:
 *
 * 1. Lo que el anfitrión fijó a mano, si lo fijó. Gana siempre, incluso el
 *    cero: poner cero es su manera de decir «yo cierro las preguntas».
 * 2. La sala de espera, que es la respuesta correcta: son los inscritos.
 * 3. Cuántos tienen puntaje, como red de seguridad. Un puntaje solo nace al
 *    calificar, así que esto vale cero en la primera pregunta y no sirve para
 *    cerrarla; está para el caso de que alguien juegue desde una pestaña vieja,
 *    cargada antes de que la sala existiera, y por eso no se haya inscrito.
 */
export function cuantosEsperar(fuentes: {
  /** Cuántos hay en la sala de espera. */
  enLaSala: number;
  /** Cuántos tienen documento de puntaje en esta ronda. */
  conPuntaje: number;
  /** Lo que el anfitrión fijó a mano, o null si lo dejó automático. */
  manual: number | null;
}): number {
  const { enLaSala, conPuntaje, manual } = fuentes;
  if (manual !== null) return manual;
  if (enLaSala > 0) return enLaSala;
  return conPuntaje;
}

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
