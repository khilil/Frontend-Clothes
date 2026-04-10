import * as fabric from "fabric";

export function addPrintArea(canvas) {
    const screenWidth = window.innerWidth;

    let width;
    let height;
    let top;

    if (screenWidth < 768) {
        // Mobile: start near chest and stop a little above the bottom hem.
        width = 199;
        height = 250;
        top = 355;
    } else if (screenWidth < 1024) {
        // Tablet: keep the same vertical intent with a slightly wider safe zone.
        width = 198;
        height = 224;
        top = 318;
    } else {
        // Desktop: preserve the original print area exactly as before.
        width = 200;
        height = 190;
        top = 290;
    }

    const left = 250;

    const rect = new fabric.Rect({
        left,
        top,
        width,
        height,
        originX: "center",
        originY: "center",
        fill: "transparent",
        stroke: "#000000",
        strokeDashArray: [6, 4],
        strokeWidth: 1,
        opacity: 0.15,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: "print-area-main"
    });

    const markerSize = 12;
    const markers = [];

    const createMarker = (x, y, angle) =>
        new fabric.Polyline(
            [
                { x: 0, y: markerSize },
                { x: 0, y: 0 },
                { x: markerSize, y: 0 }
            ],
            {
                left: x,
                top: y,
                stroke: "#000000",
                strokeWidth: 1.5,
                fill: "transparent",
                opacity: 0.25,
                angle,
                selectable: false,
                evented: false,
                excludeFromExport: true,
                originX: "center",
                originY: "center"
            }
        );

    const halfW = width / 2;
    const halfH = height / 2;

    markers.push(createMarker(left - halfW, top - halfH, 0));
    markers.push(createMarker(left + halfW, top - halfH, 90));
    markers.push(createMarker(left + halfW, top + halfH, 180));
    markers.push(createMarker(left - halfW, top + halfH, 270));

    canvas.add(rect, ...markers);

    canvas.printArea = rect;
    canvas.printAreaMarkers = markers;

    return rect;
}
