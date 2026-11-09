/** Converte arquivo de imagem em data URL comprimida (cabível no localStorage). */
export async function fileToCompressedDataUrl(file: File, maxWidth = 1600, quality = 0.78): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione uma imagem (JPG, PNG ou WEBP)");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Imagem muito grande (máx. 12 MB)");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const dataUrl = canvas.toDataURL(mime, mime === "image/png" ? undefined : quality);
  if (dataUrl.length > 2_800_000) {
    // tenta de novo mais leve
    return canvas.toDataURL("image/jpeg", 0.62);
  }
  return dataUrl;
}
