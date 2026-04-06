import * as fabric from "fabric";

export function addPrintArea(canvas, isMobile = false) {
    // 📏 DYNAMIC DIMENSIONS (v7.23 Zoom-Max Framing)
    // Increased size to match the new 3D scale (5.4x Desktop, 4.6x Mobile)
    const width = isMobile ? 200 : 240; 
    const height = isMobile ? 280 : 350;
    
    // 🎯 COORDINATE FIX: Centered in 500x600 space
    const left = 250; 
    // Vertical alignment shift for the new shifted 3D positions (-7.8 / -6.6)
    const top = isMobile ? 305 : 258;

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
        strokeWidth: 1,
        opacity: 0.15,
        selectable: false,
        evented: false,
        excludeFromExport: true,
        id: "print-area-main"
    });

    // 🌟 CORNER MARKERS (Professional Drafting Look)
    const markerSize = 12;
    const markers = [];

    const createMarker = (x, y, angle) => new fabric.Polyline([
        { x: 0, y: markerSize }, 
        { x: 0, y: 0 }, 
        { x: markerSize, y: 0 }
    ], {
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
