"use client";

import { useRef, useState } from "react";

// ─── Textos de la página (deck de contenido para diseño) ────────────────────
// Todos los textos visibles viven aquí para editarlos en un solo lugar.
const COPY = {
  bienvenida: {
    titulo: "Comparte tu Gato",
    subtitulo: "¡Tu michi también merece estar en el museo!",
    texto: "Sube una foto de tu gato y velo aparecer en la pantalla de la exhibición.",
    botonCamara: "Tomar foto",
    botonGaleria: "Elegir de mi galería",
    tip: "Solo fotos de gatos 🐱 — que salga bien iluminado y sin personas.",
    legalAntes: "Al subir una foto aceptas el ",
    legalLink: "aviso de privacidad",
    legalDespues: " y que se muestre en la exhibición.",
  },
  confirmar: {
    titulo: "¿Así o más guapo?",
    texto: "Esta foto se mostrará en la exhibición del museo.",
    botonEnviar: "Enviar foto",
    botonCambiar: "Cambiar foto",
  },
  subiendo: {
    texto: "Enviando a tu michi a la nube…",
    textoLento: "Un momento, está acomodándose el bigote.",
  },
  exito: {
    titulo: "¡Miau-ravilloso! 🎉",
    texto: "Recibimos tu foto. En unos momentos aparecerá en la pantalla de la exhibición… ¡no te la pierdas!",
    boton: "Subir otra foto",
  },
  rechazada: {
    titulo: "Ups, esta foto no pasó el filtro",
    texto: "Nuestro guardián automático detectó contenido que no podemos mostrar en el museo. Intenta con otra foto de tu michi.",
    boton: "Probar con otra foto",
  },
  invalida: {
    titulo: "Esa foto no la pudimos leer",
    texto: "Intenta con otra desde tu galería o tu cámara.",
    boton: "Elegir otra foto",
  },
  error: {
    titulo: "Se perdió la conexión",
    texto: "Revisa tu señal e inténtalo de nuevo.",
    boton: "Reintentar",
  },
  limite: {
    titulo: "¡Gracias por compartir!",
    texto: "Ya subiste varias fotos — deja espacio para los demás michis.",
  },
  footer: "Museo del Gato · CDMX",
};

type Estado =
  | "bienvenida"
  | "confirmar"
  | "subiendo"
  | "exito"
  | "rechazada"
  | "invalida"
  | "error"
  | "limite";

// Reduce la foto en el dispositivo antes de subirla (lado más largo ≤ 1600 px).
async function comprimir(archivo: File): Promise<Blob> {
  try {
    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" });
    } catch {
      bitmap = await createImageBitmap(archivo);
    }
    const MAX = 1600;
    const escala = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return archivo;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.82)
    );
    return blob ?? archivo;
  } catch {
    return archivo; // si el navegador no puede procesarla, se envía original
  }
}

export default function Home() {
  const [estado, setEstado] = useState<Estado>("bienvenida");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [progreso, setProgreso] = useState(0);
  const [lento, setLento] = useState(false);
  const camaraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);
  const lentoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function seleccionar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir la misma foto
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setEstado("invalida");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setArchivo(file);
    setPreview(URL.createObjectURL(file));
    setEstado("confirmar");
  }

  async function enviar() {
    if (!archivo) return;
    setEstado("subiendo");
    setProgreso(0);
    setLento(false);
    lentoTimer.current = setTimeout(() => setLento(true), 5000);

    const blob = await comprimir(archivo);
    const form = new FormData();
    form.append("photo", blob, archivo.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgreso(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      if (lentoTimer.current) clearTimeout(lentoTimer.current);
      if (xhr.status === 200) {
        try {
          const r = JSON.parse(xhr.responseText);
          setEstado(r.status === "rejected" ? "rechazada" : "exito");
        } catch {
          setEstado("error");
        }
      } else if (xhr.status === 429) {
        setEstado("limite");
      } else if (xhr.status === 400 || xhr.status === 413) {
        setEstado("invalida");
      } else {
        setEstado("error");
      }
    };
    xhr.onerror = () => {
      if (lentoTimer.current) clearTimeout(lentoTimer.current);
      setEstado("error");
    };
    xhr.send(form);
  }

  function reiniciar() {
    if (preview) URL.revokeObjectURL(preview);
    setArchivo(null);
    setPreview("");
    setProgreso(0);
    setEstado("bienvenida");
  }

  const botonPrimario =
    "w-full rounded-full bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/30 active:scale-95 transition";
  const botonSecundario =
    "w-full rounded-full border-2 border-orange-400 bg-white py-4 text-lg font-bold text-orange-600 active:scale-95 transition";

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 py-8">
      <input ref={camaraRef} type="file" accept="image/*" capture="environment" hidden onChange={seleccionar} />
      <input ref={galeriaRef} type="file" accept="image/*" hidden onChange={seleccionar} />

      <div className="flex w-full max-w-md grow flex-col items-center justify-center gap-5 text-center">
        {estado === "bienvenida" && (
          <>
            <div className="animate-flotar text-8xl" aria-hidden>😺</div>
            <h1 className="text-5xl font-extrabold text-orange-600">{COPY.bienvenida.titulo}</h1>
            <p className="text-2xl font-semibold leading-tight">{COPY.bienvenida.subtitulo}</p>
            <p className="text-lg leading-snug text-amber-900/80">{COPY.bienvenida.texto}</p>
            <div className="mt-2 flex w-full flex-col gap-3">
              <button className={botonPrimario} onClick={() => camaraRef.current?.click()}>
                {COPY.bienvenida.botonCamara}
              </button>
              <button className={botonSecundario} onClick={() => galeriaRef.current?.click()}>
                {COPY.bienvenida.botonGaleria}
              </button>
            </div>
            <p className="text-sm font-medium text-amber-800/70">{COPY.bienvenida.tip}</p>
            <p className="text-xs text-amber-800/60">
              {COPY.bienvenida.legalAntes}
              <a href="/aviso" className="underline">{COPY.bienvenida.legalLink}</a>
              {COPY.bienvenida.legalDespues}
            </p>
          </>
        )}

        {estado === "confirmar" && (
          <>
            <h1 className="text-4xl font-extrabold text-orange-600">{COPY.confirmar.titulo}</h1>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Tu foto"
              className="max-h-[45dvh] w-auto max-w-full rounded-3xl object-contain shadow-xl"
            />
            <p className="text-lg text-amber-900/80">{COPY.confirmar.texto}</p>
            <div className="flex w-full flex-col gap-3">
              <button className={botonPrimario} onClick={enviar}>{COPY.confirmar.botonEnviar}</button>
              <button className={botonSecundario} onClick={() => galeriaRef.current?.click()}>
                {COPY.confirmar.botonCambiar}
              </button>
            </div>
          </>
        )}

        {estado === "subiendo" && (
          <>
            <div className="animate-flotar text-8xl" aria-hidden>☁️</div>
            <p className="text-2xl font-semibold">{COPY.subiendo.texto}</p>
            <div className="h-4 w-full overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-orange-500 transition-[width] duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <p className="text-lg font-bold text-orange-600">{progreso}%</p>
            {lento && <p className="text-sm text-amber-800/70">{COPY.subiendo.textoLento}</p>}
          </>
        )}

        {estado === "exito" && (
          <>
            <div className="animate-flotar text-8xl" aria-hidden>😻</div>
            <h1 className="text-4xl font-extrabold text-orange-600">{COPY.exito.titulo}</h1>
            <p className="text-lg leading-snug text-amber-900/80">{COPY.exito.texto}</p>
            <button className={botonPrimario} onClick={reiniciar}>{COPY.exito.boton}</button>
          </>
        )}

        {estado === "rechazada" && (
          <>
            <div className="text-8xl" aria-hidden>🙀</div>
            <h1 className="text-3xl font-extrabold text-orange-600">{COPY.rechazada.titulo}</h1>
            <p className="text-lg leading-snug text-amber-900/80">{COPY.rechazada.texto}</p>
            <button className={botonPrimario} onClick={reiniciar}>{COPY.rechazada.boton}</button>
          </>
        )}

        {estado === "invalida" && (
          <>
            <div className="text-8xl" aria-hidden>😿</div>
            <h1 className="text-3xl font-extrabold text-orange-600">{COPY.invalida.titulo}</h1>
            <p className="text-lg leading-snug text-amber-900/80">{COPY.invalida.texto}</p>
            <button className={botonPrimario} onClick={reiniciar}>{COPY.invalida.boton}</button>
          </>
        )}

        {estado === "error" && (
          <>
            <div className="text-8xl" aria-hidden>📡</div>
            <h1 className="text-3xl font-extrabold text-orange-600">{COPY.error.titulo}</h1>
            <p className="text-lg leading-snug text-amber-900/80">{COPY.error.texto}</p>
            <button className={botonPrimario} onClick={enviar}>{COPY.error.boton}</button>
            <button className={botonSecundario} onClick={reiniciar}>{COPY.rechazada.boton}</button>
          </>
        )}

        {estado === "limite" && (
          <>
            <div className="text-8xl" aria-hidden>😽</div>
            <h1 className="text-3xl font-extrabold text-orange-600">{COPY.limite.titulo}</h1>
            <p className="text-lg leading-snug text-amber-900/80">{COPY.limite.texto}</p>
          </>
        )}
      </div>

      <footer className="mt-8 flex flex-col items-center gap-1 text-sm text-amber-800/60">
        <span className="font-semibold">{COPY.footer}</span>
        <a href="/aviso" className="underline">{COPY.bienvenida.legalLink}</a>
      </footer>
    </main>
  );
}
