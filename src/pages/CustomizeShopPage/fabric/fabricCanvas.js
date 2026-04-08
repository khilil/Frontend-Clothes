// fabricCanvas.js
import { Canvas } from "fabric";
import { addPrintArea } from "./printArea";

export function initFabric(
    canvasEl,
    printAreaRef,
    activeTextRef,
    syncLayers,
    isMobile = false
) {
    if (!canvasEl) return null;

    const canvas = new Canvas(canvasEl, {
        preserveObjectStacking: true,
        selection: true,
        selectionColor: 'rgba(212, 196, 177, 0.1)',
        selectionBorderColor: '#D4C4B1',
        selectionLineWidth: 1
    });

    // Custom Luxury Selection Style
    const configureObjectSelection = (obj) => {
        obj.set({
            cornerColor: '#fcfbf9',
            cornerStrokeColor: '#D4C4B1',
            cornerStyle: 'circle',
            cornerSize: 8,
            transparentCorners: false,
            borderColor: '#D4C4B1',
            borderScaleFactor: 1.5,
            borderDashArray: [4, 4],
            padding: 8,
            // 🖋️ Premium Render Defaults
            opacity: 0.95,
            shadow: {
                color: 'rgba(0,0,0,0.2)',
                blur: 6,
                offsetX: 0,
                offsetY: 2
            }
        });
    };

    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();

    const printArea = addPrintArea(canvas, isMobile);
    printAreaRef.current = printArea;
    canvas.printArea = printArea;

    canvas.on("object:added", (e) => {
        const obj = e.target;
        if (obj && !obj.id) {
            obj.id = `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // 📐 Auto-Center ONLY if it's a truly new user-added object
            // We skip centering if 'isRestoring' is true (e.g. during side switch or undo/redo)
            if (!obj.excludeFromExport && !canvas.isRestoring) {
                canvas.centerObject(obj);
                obj.setCoords();
            }
        }
        if (obj && !obj.excludeFromExport) {
            configureObjectSelection(obj);
        }
        syncLayers && syncLayers(canvas);
        canvas.requestRenderAll();
    });
    canvas.on("object:removed", () => syncLayers && syncLayers(canvas));
    canvas.on("object:modified", () => syncLayers && syncLayers(canvas));

    return canvas;
}
