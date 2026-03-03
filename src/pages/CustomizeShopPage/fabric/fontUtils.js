export function loadGoogleFont(fontFamily) {
    const linkId = `font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(linkId)) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

export function waitForFont(fontFamily) {
    return new Promise((resolve) => {
        if (document.fonts.check(`16px "${fontFamily}"`)) {
            resolve();
        } else {
            document.fonts.load(`16px "${fontFamily}"`).then(resolve);
        }
    });
}
