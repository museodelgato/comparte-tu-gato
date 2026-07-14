// Vacía las fotos del bucket (prefijo aprobadas/) — lo usa reiniciar-fotos.bat
// para el reinicio total. Solo borra archivos .jpg dentro del prefijo.
const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

const BUCKET = process.env.S3_BUCKET;
const PREFIJO = process.env.S3_PREFIJO ?? "aprobadas/";

if (!BUCKET) {
  console.error("Falta S3_BUCKET (revisa el archivo .env)");
  process.exit(1);
}

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-2" });

(async () => {
  let total = 0;
  let token;
  do {
    const r = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: PREFIJO,
        ContinuationToken: token,
      })
    );
    const keys = (r.Contents ?? [])
      .filter((o) => o.Key && o.Key.endsWith(".jpg"))
      .map((o) => ({ Key: o.Key }));
    if (keys.length > 0) {
      // DeleteObjects acepta máximo 1000 keys; cada página de List trae ≤1000
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET,
          Delete: { Objects: keys, Quiet: true },
        })
      );
      total += keys.length;
    }
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  console.log(`Bucket vaciado: ${total} foto(s) borrada(s) de s3://${BUCKET}/${PREFIJO}`);
})().catch((e) => {
  console.error("ERROR al vaciar el bucket:", e.message);
  process.exit(1);
});
