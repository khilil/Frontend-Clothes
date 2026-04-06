export function clampToPrintArea(obj, printArea) {
    if (!obj || !printArea) return;

    obj.setCoords();

    const objBounds = obj.getBoundingRect();
    const areaBounds = printArea.getBoundingRect();

    let deltaLeft = 0;
    let deltaTop = 0;

    // ⬅️ LEFT BOUNDARY
    if (objBounds.left < areaBounds.left) {
        deltaLeft = areaBounds.left - objBounds.left;
    }

    // ➡️ RIGHT BOUNDARY
    if (objBounds.left + objBounds.width > areaBounds.left + areaBounds.width) {
        deltaLeft = (areaBounds.left + areaBounds.width) - (objBounds.left + objBounds.width);
    }

    // ⬆️ TOP BOUNDARY
    if (objBounds.top < areaBounds.top) {
        deltaTop = areaBounds.top - objBounds.top;
    }

    // ⬇️ BOTTOM BOUNDARY
    if (objBounds.top + objBounds.height > areaBounds.top + areaBounds.height) {
        deltaTop = (areaBounds.top + areaBounds.height) - (objBounds.top + objBounds.height);
    }

    // Apply the correction directly to current position
    // This works regardless of originX/originY
    if (deltaLeft !== 0 || deltaTop !== 0) {
        obj.set({
            left: obj.left + deltaLeft,
            top: obj.top + deltaTop
        });
        obj.setCoords();
    }
}
