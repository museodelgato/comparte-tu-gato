import Link from "next/link";

export const metadata = {
  title: "Aviso de privacidad — Comparte tu Gato",
};

// BORRADOR generado a partir del funcionamiento real de la página.
// Antes de inaugurar, el museo debe llenar los datos entre [corchetes] y
// validar el texto con su responsable legal (LFPDPPP).

const ACTUALIZACION = "14 de julio de 2026";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-extrabold text-orange-600">{titulo}</h2>
      <div className="flex flex-col gap-2 text-amber-900/80 leading-snug">{children}</div>
    </section>
  );
}

export default function Aviso() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-orange-600">Aviso de privacidad</h1>
        <p className="text-sm text-amber-800/60">Última actualización: {ACTUALIZACION}</p>
      </header>

      <Seccion titulo="¿Quién es responsable?">
        <p>
          [Denominación o razón social del Museo del Gato], con domicilio en
          [domicilio completo del museo, Ciudad de México], es responsable del
          tratamiento de los datos que proporcionas a través de la experiencia
          “Comparte tu Gato”.
        </p>
      </Seccion>

      <Seccion titulo="¿Qué datos recabamos?">
        <p>
          Únicamente la <strong>fotografía que tú decides subir</strong>. No te
          pedimos nombre, correo, teléfono ni ningún otro dato personal.
        </p>
        <p>
          De forma temporal se registra tu dirección IP con el único fin de
          limitar el número de fotos que puede enviar cada dispositivo y
          proteger el servicio de abusos.
        </p>
      </Seccion>

      <Seccion titulo="¿Para qué usamos tu foto?">
        <p>
          Con la única finalidad de <strong>mostrarla en la pantalla de la
          exhibición dentro del museo</strong>, junto con las fotos de otros
          visitantes. No se usa para publicidad, no se vende ni se comparte con
          terceros ajenos a la operación de la exhibición.
        </p>
      </Seccion>

      <Seccion titulo="Revisión automática">
        <p>
          Antes de aceptarse, cada foto pasa por una revisión automática
          (Amazon Rekognition) que verifica que aparezca un gato y que no
          contenga material inapropiado. Las fotos que no pasan esta revisión
          <strong> se descartan de inmediato y no se guardan</strong>.
        </p>
        <p>
          El procesamiento y almacenamiento se realiza en servicios de Amazon
          Web Services fuera de México (región Ohio, EE. UU.), que operan bajo
          sus propias medidas de seguridad.
        </p>
      </Seccion>

      <Seccion titulo="Recomendaciones al subir tu foto">
        <p>Al subir una foto confirmas que tienes derecho a compartirla.</p>
        <p>
          Te pedimos que en la foto <strong>solo aparezca tu gato</strong>: evita que
          salgan personas (sobre todo menores de edad), documentos o información
          personal visible.
        </p>
      </Seccion>

      <Seccion titulo="¿Cuánto tiempo se conserva?">
        <p>
          Las fotos se conservan mientras dure la exhibición. En la pantalla se
          muestran únicamente las fotos más recientes (las nuevas van
          reemplazando a las anteriores). Al concluir la exhibición, las
          fotografías se eliminan.
        </p>
      </Seccion>

      <Seccion titulo="Tus derechos (ARCO)">
        <p>
          Puedes solicitar en cualquier momento que tu fotografía se elimine o
          dejar sin efecto tu consentimiento, escribiendo a
          [correo de contacto del museo] o directamente en la recepción del
          museo. Solo necesitamos que nos indiques la fecha y hora aproximada
          en que la subiste para localizarla.
        </p>
      </Seccion>

      <Seccion titulo="Cambios a este aviso">
        <p>
          Cualquier modificación a este aviso se publicará en esta misma
          página.
        </p>
      </Seccion>

      <Link href="/" className="mt-2 font-bold text-orange-600 underline">
        ← Volver
      </Link>
    </main>
  );
}
