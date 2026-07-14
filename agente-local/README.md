# Agente de descarga — computadora de la exhibición (Windows)

Vigila el bucket S3 y baja cada foto aprobada a la carpeta que lee
TouchDesigner, renombrada como **buffer circular**:
`gato_001.jpg → gato_002.jpg → … → gato_999.jpg` y después de la 999 la
siguiente foto **sustituye a `gato_001.jpg`** y el ciclo se repite. Nunca
existen más de 999 archivos y los nombres siempre son los mismos — TouchDesigner
solo apunta a la carpeta.

Detalles que ya resuelve:
- Escritura atómica (`.tmp` + rename): TD nunca lee archivos a medias.
- `estado.json` recuerda el último slot y la última foto bajada — se puede
  reiniciar la máquina sin perder la numeración.
- Todo lo que llega ya es JPG real (la página lo garantiza al subir).

## Instalación en la computadora del museo (Windows)

1. Instalar [Node.js LTS](https://nodejs.org) (22.x).
2. Copiar esta carpeta `agente-local/` a la máquina (p. ej. `C:\museo\agente-local`).
3. En esa carpeta: copiar `.env.example` como `.env` y llenar las llaves AWS,
   el bucket y `CARPETA_DESTINO` (la carpeta que leerá TouchDesigner).
4. En una terminal (cmd/PowerShell) dentro de la carpeta:
   ```
   npm install
   npm start
   ```
5. Probar: subir una foto con el QR y verificar que aparezca `gato_00X.jpg`
   en la carpeta destino (revisa cada `INTERVALO_SEG` segundos).

## Dejarlo corriendo siempre (igual que la estación 2)

```
npm install -g pm2
pm2 start descarga.js --name agente-gatos --node-args="--env-file=.env"
pm2 save
```
y configurar pm2 para arrancar con Windows (pm2-installer o Programador de
tareas ejecutando `pm2 resurrect` al inicio de sesión).

## Comandos útiles

- `npm run una-vez` — una sola pasada (para probar).
- Borrar `estado.json` — reinicia la numeración desde `gato_001.jpg` y vuelve a
  bajar todo el bucket.
