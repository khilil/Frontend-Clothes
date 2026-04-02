import { BASE_URL } from '../services/api';

export const ensureAbsoluteUrl = (url) => {
    if (!url) return "/images/product_placeholder.png";

    // If it's already an absolute URL, return it
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    // Use centralized backend root
    const backendRoot = BASE_URL;

    // If it starts with / we assume it's from the backend root
    if (url.startsWith("/")) {
        return `${backendRoot}${url}`;
    }

    // Default: assume it's an uploaded file path or static asset from backend
    return `${backendRoot}/${url}`;
};
