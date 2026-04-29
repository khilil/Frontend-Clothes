export function clampToPrintArea(obj, printArea) {
    if (!obj || !printArea) return;

    obj.setCoords();

    const coords = obj.getCoords?.() || [];
    const hasCoords = Array.isArray(coords) && coords.length >= 4;

    const objBounds = hasCoords
        ? {
            left: Math.min(...coords.map((point) => point.x)),
            top: Math.min(...coords.map((point) => point.y)),
            width: Math.max(...coords.map((point) => point.x)) - Math.min(...coords.map((point) => point.x)),
            height: Math.max(...coords.map((point) => point.y)) - Math.min(...coords.map((point) => point.y))
        }
        : (() => {
            const rawBounds = obj.getBoundingRect();
            const padding = Number(obj.padding || 0);

            return {
                left: rawBounds.left + padding,
                top: rawBounds.top + padding,
                width: Math.max(0, rawBounds.width - padding * 2),
                height: Math.max(0, rawBounds.height - padding * 2)
            };
        })();

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

export function fitImageScaleToPrintArea(obj, printArea) {
    if (!obj || !printArea) return;

    const isImageLike = obj.type === "image";
    if (!isImageLike || !obj.width || !obj.height) return;

    const center = obj.getCenterPoint?.();
    const areaBounds = printArea.getBoundingRect();

    if (!center) return;

    const maxWidth = 2 * Math.min(
        center.x - areaBounds.left,
        areaBounds.left + areaBounds.width - center.x
    );
    const maxHeight = 2 * Math.min(
        center.y - areaBounds.top,
        areaBounds.top + areaBounds.height - center.y
    );

    if (maxWidth <= 0 || maxHeight <= 0) return;

    const maxScaleX = maxWidth / obj.width;
    const maxScaleY = maxHeight / obj.height;
    const maxUniformScale = Math.max(0.05, Math.min(maxScaleX, maxScaleY));
    const currentUniformScale = Math.max(obj.scaleX || 1, obj.scaleY || 1);

    if (currentUniformScale > maxUniformScale) {
        obj.set({
            scaleX: maxUniformScale,
            scaleY: maxUniformScale
        });
        obj.setCoords();
    }
}
