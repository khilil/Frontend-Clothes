import api from "./api";

/**
 * Customization Service
 * Handles fetching and managing graphics and front styles
 */

// GRAPHICS
export const getGraphics = async () => {
    const response = await api.get("/customizations/graphics");
    return response.data.data;
};

export const addGraphic = async (formData) => {
    return await api.post("/customizations/graphics", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const deleteGraphic = async (id) => {
    return await api.delete(`/customizations/graphics/${id}`);
};


// FONTS
export const getFonts = async () => {
    const response = await api.get("/customizations/fonts");
    return response.data.data;
};

export const addFont = async (fontData) => {
    return await api.post("/customizations/fonts", fontData);
};

export const deleteFont = async (id) => {
    return await api.delete(`/customizations/fonts/${id}`);
};

// SETTINGS
export const getSettings = async () => {
    const response = await api.get("/customizations/settings");
    return response.data.data;
};

export const updateSettings = async (settingsData) => {
    const response = await api.patch("/customizations/settings", settingsData);
    return response.data.data;
};

const customizationService = {
    getGraphics,
    addGraphic,
    deleteGraphic,
    getFonts,
    addFont,
    deleteFont,
    getSettings,
    updateSettings
};

export default customizationService;
