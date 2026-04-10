import * as fabric from "fabric";

export function addPrintArea(canvas) {
    const screenWidth = window.innerWidth;

    let width, height, top;

    if (screenWidth < 768) {
        // 📱 MOBILE
        width = 175;
        height = 200;
        top = 300;
    } else if (screenWidth >= 768 && screenWidth < 1024) {
        // 📇 TABLET (Middle ground between Mobile & Desktop)
        width = 190;
        height = 200;
        top = 295;
    } else {
        // 🖥️ DESKTOP
        width = 200;
        height = 190;
        top = 290;
    }

    // 🎯 COORDINATE FIX: Centered in 500x600 space
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const isCompactCanvas = canvasWidth < 420 || canvasHeight < 520;

    width = canvasWidth * (isCompactCanvas ? 0.4 : 0.38);
    height = canvasHeight * (isCompactCanvas ? 0.335 : 0.325);
    top = canvasHeight * (isCompactCanvas ? 0.5 : 0.495);

    const left = canvasWidth / 2;
    const strokeWidth = Math.max(1, Math.round(Math.min(canvasWidth, canvasHeight) * 0.0025));

    // 🛡️ MAIN BOUNDARY (High Contrast Technical Dashed)
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
        strokeWidth,
        opacity: 0.15,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: "print-area-main"
    });

    // 🌟 CORNER MARKERS (Professional Drafting Look)
    const markerSize = Math.max(10, Math.round(Math.min(width, height) * 0.06));
    const markers = [];

    const createMarker = (x, y, angle) => new fabric.Polyline([
        { x: 0, y: markerSize },
        { x: 0, y: 0 },
        { x: markerSize, y: 0 }
    ], {
        left: x,
        top: y,
        stroke: "#000000",
        strokeWidth: strokeWidth + 0.5,
        fill: "transparent",
        opacity: 0.25,
        angle,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        originX: "center",
        originY: "center"
    });

    // Add 4 corners
    const halfW = width / 2;
    const halfH = height / 2;

    markers.push(createMarker(left - halfW, top - halfH, 0));      // TL
    markers.push(createMarker(left + halfW, top - halfH, 90));     // TR
    markers.push(createMarker(left + halfW, top + halfH, 180));    // BR
    markers.push(createMarker(left - halfW, top + halfH, 270));    // BL

    canvas.add(rect, ...markers);

    // Group them mentally but keep them separate for coordinate sync
    canvas.printArea = rect;
    canvas.printAreaMarkers = markers;

    return rect;
}
