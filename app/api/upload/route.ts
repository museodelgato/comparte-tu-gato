import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";

// ─── Backend de subida ───────────────────────────────────────────────────────
// Dos modos según configuración:
//  - AWS (producción): si existe S3_BUCKET → moderación real con Rekognition y
//    guardado en S3 bajo aprobadas/. Credenciales por cadena estándar del SDK:
//    .env.local en desarrollo, compute role de Amplify en producción.
//  - Mock (desarrollo sin credenciales): guarda en ./uploads y simula la
//    moderación rechazando archivos cuyo nombre contenga "rechazo".
// Pendiente fase 4: el agente local del museo descarga aprobadas/ del bucket
// al folder de TouchDesigner (la nomenclatura final la define su programador).

const BUCKET = process.env.S3_BUCKET;
// Umbral de confianza (0-100) para rechazar por moderación
const MIN_CONFIANZA = Number(process.env.MODERATION_MIN_CONFIDENCE ?? 70);
const REGION = process.env.AWS_REGION ?? "us-east-2";

const s3 = BUCKET ? new S3Client({ region: REGION }) : null;
const rekognition = BUCKET ? new RekognitionClient({ region: REGION }) : null;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB tras compresión en el dispositivo
const LIMITE_FOTOS = 5; // por IP
const VENTANA_MS = 10 * 60 * 1000; // 10 minutos

// En serverless (Amplify/Lambda) este mapa vive por instancia, así que el
// límite es aproximado; si algún día hace falta exacto, se mueve a DynamoDB.
const intentos = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const ahora = Date.now();
  const recientes = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= LIMITE_FOTOS) {
    return NextResponse.json({ status: "limit" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const foto = form.get("photo");
  if (!(foto instanceof File) || !foto.type.startsWith("image/")) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }
  if (foto.size > MAX_BYTES) {
    return NextResponse.json({ status: "invalid" }, { status: 413 });
  }

  // Truco de demo en ambos modos: nombre con "rechazo" fuerza la pantalla de rechazo
  if (foto.name.toLowerCase().includes("rechazo")) {
    return NextResponse.json({ status: "rejected" });
  }

  const buf = Buffer.from(await foto.arrayBuffer());
  const nombre = `gato_${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`;

  // En producción el modo mock está prohibido: sin bucket configurado se
  // responde error en vez de aparentar que la foto se guardó
  if (!BUCKET && process.env.NODE_ENV === "production") {
    console.error("[upload] S3_BUCKET no está configurado en producción");
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  if (s3 && rekognition && BUCKET) {
    // ── Modo AWS ──
    try {
      const det = await rekognition.send(
        new DetectModerationLabelsCommand({
          Image: { Bytes: buf },
          MinConfidence: MIN_CONFIANZA,
        })
      );
      const etiquetas = det.ModerationLabels ?? [];
      if (etiquetas.length > 0) {
        console.warn(
          "[moderacion] rechazada:",
          etiquetas.map((l) => `${l.Name} ${(l.Confidence ?? 0).toFixed(0)}%`).join(", ")
        );
        return NextResponse.json({ status: "rejected" });
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: `aprobadas/${nombre}`,
          Body: buf,
          ContentType: foto.type || "image/jpeg",
        })
      );
    } catch (err) {
      // Fail-closed: si AWS falla no aprobamos la foto
      console.error("[upload] error AWS:", err);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }
  } else {
    // ── Modo mock (desarrollo) ──
    const dir = path.join(process.cwd(), "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, nombre), buf);
  }

  recientes.push(ahora);
  intentos.set(ip, recientes);

  return NextResponse.json({ status: "ok", file: nombre });
}
