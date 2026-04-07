import { Image as FabricImage } from "fabric";

export async function addBaseImage(canvas, imageURL) {
  if (!imageURL) return;

  const img = await FabricImage.fromURL(imageURL, {
    crossOrigin: "anonymous",
  });

  // Determine a scale multiplier based on canvas width for better mobile fit
  const scaleMultiplier = canvas.width < 400 ? 0.8 : 0.9;

  const scale = Math.min(
    canvas.width / img.width,
    canvas.height / img.height
  ) * scaleMultiplier;

  img.scale(scale);

  img.set({
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
    hasControls: true,
    hasBorders: false,
    hoverCursor: "default",
    excludeFromExport: true,
    isBaseImage: true, // v7.20.1 Stability Flag
    opacity: 0 // Hide in editor, as React layers handle visualization
  });

  canvas.add(img);
  canvas.moveObjectTo(img, 0);
  canvas.renderAll();

  return img;
}
