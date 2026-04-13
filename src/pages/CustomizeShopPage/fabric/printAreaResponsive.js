import * as fabric from "fabric";

export function addPrintArea(canvas, isMobile = false) {
    const zoom = canvas.getZoom() || 1;
    const logicalWidth = canvas.getWidth() / zoom || 500;
    const logicalHeight = canvas.getHeight() / zoom || 600;

    let width;
    let height;
    let top;

    // Syncing with TShirtModel.jsx logic (1024px breakpoint)
    if (isMobile) {
        // One shared mobile print area across all phones.
        // Keep dimensions fixed in logical stage units so tall/short devices look consistent.
        width = 208;
        height = 252;
        top = (logicalHeight / 2) + 28;
    } else {
        // Desktop calibrated: keep original stable layout
        width = 200;
        height = 240;
        top = 310;
    }

    const left = logicalWidth / 2;

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
