# Comparte tu Gato — Museo del Gato

Página web móvil de la estación **Comparte tu Gato** (Proyecto 3): el visitante
escanea un QR en sala, sube la foto de su gato desde el celular, la imagen pasa
por un filtro de contenido y llega a la computadora de la exhibición para
TouchDesigner.

Este repo contiene la **página de subida con todos sus estados** y un backend
de demostración. Sirve para revisar el flujo y los textos con diseño y con el
museo antes de conectar la infraestructura real.

## Correr

```bash
npm install
npm run dev
```

Abrir http://localhost:3000 (o desde el celular en la misma red:
`http://<ip-de-la-mac>:3000`).

## Estados del flujo y cómo probarlos

| Estado | Cómo verlo |
|---|---|
| Bienvenida | pantalla inicial |
| Confirmar (preview) | elegir cualquier foto |
| Subiendo (progreso) | enviar la foto |
| Éxito | enviar una foto normal |
| **Rechazada por filtro** | subir un archivo cuyo nombre contenga `rechazo` (p. ej. `rechazo.jpg`) |
| Foto inválida | subir un archivo que no sea imagen |
| Sin conexión | apagar el servidor / modo avión y enviar |
| Límite de subidas | subir 6 fotos seguidas (límite: 5 por IP cada 10 min) |

Todos los **textos** viven en el objeto `COPY` al inicio de
[app/page.tsx](app/page.tsx) — es el mismo deck de contenido que se le pasó a
la diseñadora, editable en un solo lugar.

## Modos del backend (`app/api/upload/route.ts`)

- **Modo AWS (producción)** — se activa si existe la variable `S3_BUCKET`:
  1. Moderación real con **AWS Rekognition** (`DetectModerationLabels`); si
     detecta contenido indebido (confianza ≥ `MODERATION_MIN_CONFIDENCE`,
     default 70) responde `rejected` y la foto nunca se guarda.
  2. Guardado en **S3** bajo `aprobadas/gato_<timestamp>.jpg` (la nomenclatura
     final la definirá el programador de TouchDesigner).
  - Credenciales: cadena estándar del SDK — `.env.local` en desarrollo (ver
    `.env.local.example`), compute role de Amplify en producción.
- **Modo mock (desarrollo sin credenciales)** — sin `S3_BUCKET`: guarda en
  `uploads/` local y simula la moderación (rechaza nombres con `rechazo`).
- En ambos modos: compresión en el dispositivo (lado máx. 1600 px, JPEG) y
  límite anti-abuso por IP (en serverless es aproximado, por instancia).
- **Fase 4 pendiente**: agente de descarga local en la computadora del museo
  que baja `aprobadas/` del bucket al folder de TouchDesigner (no vive en este
  repo).

## Deploy en AWS Amplify Hosting

1. Subir este repo a GitHub (cuenta `museodelgato`, remote con alias
   `git@github-museodelgato:...`).
2. Consola AWS → **Amplify → Create new app → GitHub** → autorizar la GitHub
   App de Amplify solo para este repo → elegir repo y branch `main` (detecta
   Next.js solo).
3. En **Advanced settings**, agregar la variable de entorno `S3_BUCKET` con el
   nombre del bucket. **No** configurar `AWS_ACCESS_KEY_ID`/`AWS_SECRET...`
   ahí — los prefijos `AWS_` están reservados; el acceso va por rol.
4. Tras el primer deploy: **App settings → IAM roles → Compute role** → crear
   o asignar un rol con `AmazonS3FullAccess` + `AmazonRekognitionReadOnlyAccess`
   → redeploy.
5. La URL `https://main.<id>.amplifyapp.com` es la que va al código QR (después
   se puede poner dominio propio en App settings → Domain management).

## Notas para diseño

- Mobile-first (se abre desde un QR); en desktop se centra en una columna.
- Fuente: Baloo 2 (la del museo). Paleta provisional naranja/crema — se
  sustituye por el arte final de la diseñadora, igual que los emojis 😺 que hoy
  hacen de ilustración placeholder.
