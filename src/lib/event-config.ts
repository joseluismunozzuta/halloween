// Circo del Terror — datos de la función. Edita aquí fecha, lugar e invitados.

export const EVENT_NAME = "Circo del Terror";

// Hora local de Lima (America/Lima, UTC-5, sin horario de verano).
export const EVENT_DATE_ISO = "2026-10-31T19:00:00-05:00";
export const EVENT_DATE = new Date(EVENT_DATE_ISO);

export const EVENT_PLACE = "Casa de Alexandra";
/** Falta la dirección exacta. Al ponerla, el lugar se vuelve link a Maps. */
export const EVENT_ADDRESS: string | null = null;
export const EVENT_MAPS_URL = EVENT_ADDRESS
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT_ADDRESS)}`
  : null;

/** Los seis. El orden no significa nada. */
export const GUESTS = ["JL", "Mar", "Victor", "Alexandra", "Caro", "Marcelo"] as const;

// Ojo: este correo también está escrito literal en firestore.rules. Las reglas
// no pueden importar del código, así que si cambia hay que tocar los dos lados.
export const ADMIN_EMAIL = "joseluismunozzuta@gmail.com";
