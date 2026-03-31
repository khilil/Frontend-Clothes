export const TOPWEAR_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
export const BOTTOMWEAR_SIZES = ['28', '30', '32', '34', '36', '38', '40'];

export const isBottomwear = (slug = '', type = '') => {
    const bottomwearIdentifiers = ['jean', 'trouser', 'pant', 'short', 'cargo', 'bottom', 'lower', 'denim', 'jogger', 'legging', 'tracksuit', 'pajama'];
    const s = slug.toLowerCase();
    const t = type.toLowerCase();
    return bottomwearIdentifiers.some(id => s.includes(id) || t.includes(id));
};
