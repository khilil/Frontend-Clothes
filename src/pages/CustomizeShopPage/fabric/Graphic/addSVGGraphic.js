import * as fabric from "fabric";

export const addSVGToCanvas = async (
    canvas,
    svgPath,
    printArea,
    price = 0
) => {
    if (!canvas) return;

    try {
        const { objects, options } = await fabric.loadSVGFromURL(svgPath, {
            crossOrigin: "anonymous",
        });

        const svg = fabric.util.groupSVGElements(objects, options);

        // scale inside print area
        const maxWidth = printArea.width * 0.6;
        const scale = maxWidth / svg.width;

        svg.scale(scale);

        // center inside print area
        svg.set({
            left: printArea.left + printArea.width / 2,
            top: printArea.top + printArea.height / 2,
            originX: "center",
            originY: "center",
            price: price // Attach price to object
        });

        canvas.add(svg);
        canvas.setActiveObject(svg);
        canvas.requestRenderAll();

    } catch (err) {
        console.error("SVG Load Error:", err);
    }
};
