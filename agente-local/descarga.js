// Agente de descarga local — Comparte tu Gato (fase 4)
// Corre en la computadora de la exhibición (Windows). Vigila el bucket S3 y
// baja cada foto aprobada a la carpeta que lee TouchDesigner, renombrándola
// como buffer circular: gato_001.jpg ... gato_999.jpg y, después de la 999,
// la siguiente foto sustituye a gato_001.jpg y el ciclo se repite.
//
// Uso normal:      npm start            (revisa el bucket cada INTERVALO_SEG)
// Una sola pasada: npm run una-vez
// El progreso (último slot usado y última foto bajada) se guarda en estado.json,
// así que se puede reiniciar sin perder la numeración.

const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("node:fs");
const path = require("node:path");

const BUCKET = process.env.S3_BUCKET;
const PREFIJO = process.env.S3_PREFIJO ?? "aprobadas/";
const CARPETA = process.env.CARPETA_DESTINO ?? path.join(__dirname, "fotos_td");
const INTERVALO_MS = Number(process.env.INTERVALO_SEG ?? 10) * 1000;
const MAX_FOTOS = Number(process.env.MAX_FOTOS ?? 999);
const ESTADO_PATH = path.join(__dirname, "estado.json");

if (!BUCKET) {
  console.error("Falta S3_BUCKET (revisa el archivo .env)");
  process.exit(1);
}

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-2" });

function cargarEstado() {
  try {
    return JSON.parse(fs.readFileSync(ESTADO_PATH, "utf8"));
  } catch {
    return { ultimoSlot: 0, ultimaKey: "" };
  }
}

function guardarEstado(estado) {
  fs.writeFileSync(ESTADO_PATH, JSON.stringify(estado, null, 2));
}

// Lista todas las fotos del bucket (los nombres llevan timestamp, así que
// ordenarlas alfabéticamente = ordenarlas por fecha de subida)
async function listarKeys() {
  const keys = [];
  let token;
  do {
    const r = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: PREFIJO,
        ContinuationToken: token,
      })
    );
    for (const o of r.Contents ?? []) {
      if (o.Key && o.Key.endsWith(".jpg")) keys.push(o.Key);
    }
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  return keys.sort();
}

async function ciclo() {
  const estado = cargarEstado();
  const nuevas = (await listarKeys()).filter((k) => k > estado.ultimaKey);
  if (nuevas.length === 0) return;

  fs.mkdirSync(CARPETA, { recursive: true });
  for (const key of nuevas) {
    const r = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const buf = Buffer.from(await r.Body.transformToByteArray());

    const slot = (estado.ultimoSlot % MAX_FOTOS) + 1; // 1..999 y vuelve a 1
    const nombre = `gato_${String(slot).padStart(3, "0")}.jpg`;
    const destino = path.join(CARPETA, nombre);

    // Escritura atómica: primero a .tmp y luego rename, para que TouchDesigner
    // nunca lea un archivo a medio escribir
    const tmp = destino + ".tmp";
    fs.writeFileSync(tmp, buf);
    fs.renameSync(tmp, destino);

    estado.ultimoSlot = slot;
    estado.ultimaKey = key;
    guardarEstado(estado);
    console.log(`[${new Date().toLocaleString()}] ${key} -> ${nombre}`);
  }
}

async function main() {
  console.log(
    `Agente Comparte tu Gato · s3://${BUCKET}/${PREFIJO} -> ${CARPETA} · ${MAX_FOTOS} slots · cada ${INTERVALO_MS / 1000}s`
  );
  await ciclo().catch((e) => console.error("Error:", e.message));
  if (process.argv.includes("--una-vez")) return;
  setInterval(() => ciclo().catch((e) => console.error("Error:", e.message)), INTERVALO_MS);
}

main();
