"use client";

import { useRouter } from "next/navigation";
import { ElegirIdentidad } from "@/components/ElegirIdentidad";

/**
 * Pantalla de registro de entrada. Una vez conectado Firestore, aquí es donde
 * cae alguien que acaba de entrar con Google y todavía no tiene identidad; de
 * momento sirve para verla y probarla.
 */
export default function SoyPage() {
  const router = useRouter();

  return (
    <ElegirIdentidad
      // Provisional: simula que alguien ya reclamó ese nombre.
      tomadas={["marcelo"]}
      onElegir={() => router.push("/")}
    />
  );
}
