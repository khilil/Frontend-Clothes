// fabricCanvas.js
import { Canvas } from "fabric";
import { addPrintArea } from "./printArea";

export function initFabric(
    canvasEl,
    printAreaRef,
    activeTextRef,
    syncLayers
) {
    if (!canvasEl) return null;

    const canvas = new Canvas(canvasEl, {
        preserveObjectStacking: true,
        selection: true,
    });

    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();

    const printArea = addPrintArea(canvas);
    printAreaRef.current = printArea;
    canvas.printArea = printArea;

    canvas.on("object:added", (e) => {
        const obj = e.target;
        if (obj && !obj.id) {
            obj.id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        syncLayers && syncLayers(canvas);
    });
    canvas.on("object:removed", () => syncLayers && syncLayers(canvas));
    canvas.on("object:modified", () => syncLayers && syncLayers(canvas));

    return canvas;
}
