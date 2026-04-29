import * as fabric from "fabric";

/**
 * Adds an image (PNG/JPG) to the fabric canvas with professional scaling
 */
export const addImageToCanvas = async (
    canvas,
    imageURL,
    printArea,
    price = 0
) => {
    if (!canvas) return;

    try {
        const img = await fabric.FabricImage.fromURL(imageURL, {
            crossOrigin: "anonymous",
        });

        // Scale inside print area (max 60% width)
        const maxWidth = printArea.width * 0.6;
        const scale = maxWidth / img.width;

        img.set({
            scaleX: scale,
            scaleY: scale,
            left: printArea.left + printArea.width / 2,
            top: printArea.top + printArea.height / 2,
            originX: "center",
            originY: "center",
            centeredScaling: false,
            centeredRotation: true,
            minScaleLimit: 0.05,
            price: price // Critical for pricing engine
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();

    } catch (err) {
        console.error("Image Load Error:", err);
    }
};
