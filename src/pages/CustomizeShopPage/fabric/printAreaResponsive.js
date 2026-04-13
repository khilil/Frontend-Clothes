import * as fabric from "fabric";

export function addPrintArea(canvas, isMobile = false) {
    const canvasWidth = canvas.getWidth();
    const zoom = canvas.getZoom();

    // Unified logical width (matching CanvasArea's baseWidth)
    const baseWidth = 500;

    let width;
    let height;
    let top;

    // Syncing with TShirtModel.jsx logic (1024px breakpoint)
    if (isMobile) {
        // Mobile calibrated: Matching desktop chest placement
        width = 240;
        height = 320;
        top = 600; // Stabilized chest position for expanded canvas
    } else {
        // Desktop calibrated: Pulled down to chest area
        width = 200;
        height = 240;
        top = 310;
    }

    const left = baseWidth / 2;

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
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hoverCursor: "default",
        moveCursor: "default",
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
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                hoverCursor: "default",
                moveCursor: "default",
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
