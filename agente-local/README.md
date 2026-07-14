# Agente de descarga — Comparte tu Gato

Baja las fotos aprobadas de la nube a la carpeta `fotos_td` con los nombres
`gato_001.jpg`, `gato_002.jpg`, … `gato_999.jpg`. Después de la 999 vuelve a
empezar sustituyendo la `gato_001.jpg` (buffer circular). TouchDesigner solo
tiene que leer esa carpeta.

## Echarlo a andar en una computadora nueva (una sola vez)

1. **Instala Node.js**: entra a <https://nodejs.org>, botón verde (LTS),
   abre el instalador y dale **Siguiente a todo**.
2. **Copia esta carpeta completa** (`agente-local`) a la computadora,
   por ejemplo a `C:\museo\agente-local`.
   - Debe incluir el archivo **`.env`** (ahí van las llaves). Es un archivo
     oculto: activa "Ver → Elementos ocultos" en el Explorador para
     comprobar que se copió. Si no lo tienes, copia `.env.example` como
     `.env` y pide las llaves.
3. **Doble clic a `iniciar-agente.bat`**. La primera vez instala solo lo que
   necesita (requiere internet) y arranca. Si falta algo, la ventana te dice
   exactamente qué.
4. **Prueba**: sube una foto con el QR. En unos segundos debe aparecer
   `gato_001.jpg` (o el número que siga) dentro de `fotos_td`.

## Uso diario

- **Arrancar**: doble clic a `iniciar-agente.bat` y dejar la ventana abierta.
  Ahí mismo se ve cada foto que va bajando.
- **Detener**: cerrar esa ventana.
- **Reinicio total** (deja todo en ceros): cerrar la ventana del agente →
  doble clic a `reiniciar-fotos.bat` → escribir `SI` y Enter → volver a abrir
  `iniciar-agente.bat`. Esto borra las fotos de la nube y de `fotos_td`, y la
  numeración vuelve a empezar en `gato_001.jpg`. No se puede deshacer.

## TouchDesigner

Apuntar TouchDesigner a la carpeta `fotos_td` que está dentro de esta carpeta.
Si TD tiene que leer otra carpeta distinta, abre `.env` con el Bloc de notas,
quita el `#` a la línea `CARPETA_DESTINO=` y pon ahí la ruta.

## Importante

- El archivo `.env` contiene llaves privadas: **no compartirlo ni subirlo a
  ningún lado**.
- Solo debe haber **una** ventana del agente abierta a la vez.

## Para el instalador técnico (opcional)

- Dejarlo corriendo siempre, aunque la compu se reinicie (igual que la
  estación 2):
  ```
  npm install -g pm2
  pm2 start descarga.js --name agente-gatos --node-args="--env-file=.env"
  pm2 save
  ```
  y configurar pm2 para arrancar con Windows (pm2-installer o Programador de
  tareas ejecutando `pm2 resurrect` al inicio de sesión).
- `npm run una-vez` — una sola pasada, para probar.
- Cómo funciona por dentro: revisa el bucket cada `INTERVALO_SEG` segundos
  (default 10) y baja lo nuevo con escritura atómica (`.tmp` + rename) para
  que TD nunca lea archivos a medias. El progreso vive en `estado.json`
  (último slot + última foto); borrarlo solo, sin vaciar la carpeta, renumera
  desde 001 y re-baja todo el bucket — para un reset limpio usa
  `reiniciar-fotos.bat`.
