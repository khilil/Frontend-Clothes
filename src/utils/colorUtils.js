/**
 * 🎨 Normalized Color Management Utility
 * Provides grouping logic and hex-to-main color identification.
 */

export const COLOR_CATEGORIES = [
    { id: 'BLACK', name: 'Black', hex: '#000000' },
    { id: 'WHITE', name: 'White', hex: '#FFFFFF' },
    { id: 'GREY', name: 'Grey', hex: '#808080' },
    { id: 'RED', name: 'Red', hex: '#FF0000' },
    { id: 'GREEN', name: 'Green', hex: '#008000' },
    { id: 'BLUE', name: 'Blue', hex: '#0000FF' },
    { id: 'YELLOW', name: 'Yellow', hex: '#FFFF00' },
    { id: 'ORANGE', name: 'Orange', hex: '#FFA500' },
    { id: 'PURPLE', name: 'Purple', hex: '#800080' },
    { id: 'PINK', name: 'Pink', hex: '#FFC0CB' },
    { id: 'BROWN', name: 'Brown', hex: '#A52A2A' },
    { id: 'BEIGE', name: 'Beige', hex: '#F5F5DC' },
    { id: 'MULTICOLOR', name: 'Multicolor', hex: 'linear-gradient(45deg, #FF0000, #00FF00, #0000FF)' }
];

// 🧪 Helper: Convert Hex to RGB
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// 🧪 Helper: RGB to HSL
const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * 🤖 Identifies the most appropriate Main Color category for a given Hex code.
 */
export const getMainColorFromHex = (hexCode) => {
    if (!hexCode) return 'MULTICOLOR';
    
    const hex = hexCode.startsWith('#') ? hexCode : `#${hexCode}`;
    const rgb = hexToRgb(hex);
    if (!rgb) return 'MULTICOLOR';

    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // 1. Extreme Neutrals
    if (l < 12) return 'BLACK'; // Deepest blacks
    if (l > 94 && s < 10) return 'WHITE'; // Purest whites
    
    // 2. GREY Detection (Strict for cool tones to avoid Blue Jeans mismatch)
    if (s < 10) return 'GREY'; // Truly desaturated
    if (l > 30 && l < 75 && s < 15) return 'GREY'; // Middle-ground desaturated
    if (l < 30 && s < 25 && (h < 180 || h > 260)) return 'GREY'; // Muted dark tones (non-blue)

    // 3. BROWN & BEIGE (Specific ranges for warm neutrals)
    if (h >= 10 && h < 60) {
        if (l > 60 && s < 45) return 'BEIGE';
        if (l < 35 && s < 60) return 'BROWN';
        if (s < 20) return 'GREY';
    }

    // 4. Hue Mapping
    // 🔴 RED/PINK Range
    if (h >= 345 || h < 10) {
        return (l > 75) ? 'PINK' : 'RED';
    }
    // 🟠 ORANGE Range
    if (h >= 10 && h < 45) {
        if (s < 30) return 'BEIGE';
        return 'ORANGE';
    }
    // 🟡 YELLOW Range
    if (h >= 45 && h < 65) {
        return (s < 35) ? 'BEIGE' : 'YELLOW';
    }
    // 🟢 GREEN Range
    if (h >= 65 && h < 165) {
        if (s < 15) return 'GREY';
        return 'GREEN';
    }
    // 🔵 BLUE Range (Denim Protection)
    if (h >= 165 && h < 265) {
        // Only classify as GREY if extremely desaturated (S < 15)
        // This ensures "Faded Blue" or "Light Indigo" jeans stay in the Blue family.
        if (s < 15) return 'GREY';
        return 'BLUE';
    }
    // 🟣 PURPLE/PINK Range
    if (h >= 265 && h < 315) return 'PURPLE';
    if (h >= 315 && h < 345) return 'PINK';

    return 'GREY';
};

export const normalizeHex = (hex) => {
    if (!hex) return '';
    const clean = hex.replace('#', '').toUpperCase();
    return `#${clean}`;
};

export const getColorCategoryInfo = (id) => {
    return COLOR_CATEGORIES.find(c => c.id === id) || COLOR_CATEGORIES[2];
};
