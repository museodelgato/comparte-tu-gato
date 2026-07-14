import Link from "next/link";

export const metadata = {
  title: "Aviso de privacidad — Comparte tu Gato",
};

export default function Aviso() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-extrabold text-orange-600">Aviso de privacidad</h1>
      <p className="text-amber-900/80">
        [Texto pendiente — lo entrega el Museo del Gato.]
      </p>
      <p className="text-amber-900/80">
        Debe cubrir: uso de la fotografía dentro de la exhibición, tiempo de
        retención de las imágenes, y contacto para solicitar su eliminación.
      </p>
      <Link href="/" className="mt-4 font-bold text-orange-600 underline">
        ← Volver
      </Link>
    </main>
  );
}
