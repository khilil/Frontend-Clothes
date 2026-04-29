import * as fabric from "fabric";

function createClipRect(printArea) {
    if (!printArea) return null;

    return new fabric.Rect({
        left: printArea.left,
        top: printArea.top,
        width: printArea.width,
        height: printArea.height,
        originX: printArea.originX || "center",
        originY: printArea.originY || "center",
        absolutePositioned: true
    });
}

export function applyPrintAreaClip(obj, printArea) {
    if (!obj || !printArea || obj.excludeFromExport) return;

    obj.clipPath = createClipRect(printArea);
    obj.dirty = true;
    obj.setCoords?.();
}

export function applyPrintAreaClipToCanvas(canvas) {
    if (!canvas?.printArea) return;

    canvas.getObjects().forEach((obj) => {
        if (!obj.excludeFromExport) {
            applyPrintAreaClip(obj, canvas.printArea);
        }
    });
}
