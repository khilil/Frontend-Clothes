import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSettings } from "../services/customizationService";

const FabricContext = createContext(null);

// PRINTING_TYPES are now fetched from settings

export function FabricProvider({ children }) {
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const printAreaRef = useRef(null);
    const activeTextRef = useRef(null);
    const activeShapeRef = useRef(null);
    const activeObjectRef = useRef(null);
    const productDataRef = useRef(null);
    const uploadedAssetsMetadataRef = useRef({}); // Stores technical data for user uploads

    // Canva Studio States
    const [activeTab, setActiveTab] = useState("elements");
    const [selectedObject, setSelectedObject] = useState(null);
    const [printingType, setPrintingType] = useState("dtf");
    const [frontPrice, setFrontPrice] = useState(0);
    const [backPrice, setBackPrice] = useState(0);
    const [pricingSettings, setPricingSettings] = useState({
        basePrice: 100,
        textPricePerElement: 20,
        printingMethods: [
            { id: "dtf", label: "DTF Printing", price: 150, description: "Direct to Film - Vibrant & Durable" },
            { id: "screen", label: "Screen Print", price: 100, description: "Classic & Long-lasting" },
            { id: "embroidery", label: "Embroidery", price: 250, description: "Premium Stitched Design" },
            { id: "sublimation", label: "Sublimation", price: 120, description: "Full Color & Breathable" }
        ]
    });

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const settings = await getSettings();
                if (settings) setPricingSettings(settings);
            } catch (error) {
                console.error("Failed to fetch pricing settings:", error);
            }
        };
        fetchPricing();
    }, []);

    const calculateCustomizationPrice = (canvas) => {
        if (!canvas) return 0;
        const objects = canvas.getObjects().filter(obj => !obj.excludeFromExport);
        if (objects.length === 0) return 0;

        let total = 0;

        objects.forEach(obj => {
            if (obj.type === 'textbox') {
                total += pricingSettings.textPricePerElement;
            } else if (obj.price) {
                total += Number(obj.price);
            }
        });

        return total;
    };

    const updatePrice = (canvas) => {
        const price = calculateCustomizationPrice(canvas);
        if (viewSideRef.current === "front") {
            setFrontPrice(price);
        } else {
            setBackPrice(price);
        }
    };

    const currentMethod = pricingSettings.printingMethods?.find(m => m.id === printingType) || pricingSettings.printingMethods?.[0];
    const methodPrice = currentMethod?.price || 0;

    const customizationPrice = (frontPrice > 0 || backPrice > 0)
        ? (frontPrice + backPrice + pricingSettings.basePrice + methodPrice)
        : 0;

    // History Management
    const historyRef = useRef([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const saveHistory = (canvas) => {
        if (!canvas) return;
        const json = JSON.stringify(canvas.toJSON());
        const newHistory = historyRef.current.slice(0, historyIndex + 1);
        newHistory.push(json);

        // Limit history to 20 steps
        if (newHistory.length > 20) newHistory.shift();

        historyRef.current = newHistory;
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = async () => {
        if (historyIndex <= 0 || !fabricCanvas.current) return;
        const newIndex = historyIndex - 1;
        const json = historyRef.current[newIndex];
        await fabricCanvas.current.loadFromJSON(JSON.parse(json));

        // Re-add base image if it's missing (it should be in JSON though if not excluded)
        // But our base image is usually excluded. Let's ensure it stays.
        const baseImageURL = viewSideRef.current === "front"
            ? productDataRef.current?.frontImage
            : productDataRef.current?.backImage;

        const { addBaseImage } = await import("../pages/CustomizeShopPage/fabric/baseImage");
        await addBaseImage(fabricCanvas.current, baseImageURL);

        fabricCanvas.current.renderAll();
        setHistoryIndex(newIndex);
        syncLayers(fabricCanvas.current);
    };

    const redo = async () => {
        if (historyIndex >= historyRef.current.length - 1 || !fabricCanvas.current) return;
        const newIndex = historyIndex + 1;
        const json = historyRef.current[newIndex];
        await fabricCanvas.current.loadFromJSON(JSON.parse(json));

        const baseImageURL = viewSideRef.current === "front"
            ? productDataRef.current?.frontImage
            : productDataRef.current?.backImage;

        const { addBaseImage } = await import("../pages/CustomizeShopPage/fabric/baseImage");
        await addBaseImage(fabricCanvas.current, baseImageURL);

        fabricCanvas.current.renderAll();
        setHistoryIndex(newIndex);
        syncLayers(fabricCanvas.current);
    };

    // 🔥 Store JSON instead of PNG
    const frontDesignRef = useRef(null);
    const backDesignRef = useRef(null);

    const initialVariantIdRef = useRef(null);
    const initialSizeRef = useRef(null);
    const initialColorRef = useRef(null);

    const layersRef = useRef([]);
    const designStateRef = useRef(null);
    const viewSideRef = useRef("front");
    const isCanvasReadyRef = useRef(false);

    function syncLayers(canvas) {
        if (!canvas) return;
        layersRef.current = canvas
            .getObjects()
            .filter(obj => !obj.excludeFromExport);
    }

    return (
        <FabricContext.Provider
            value={{
                canvasRef,
                fabricCanvas,
                printAreaRef,
                activeTextRef,
                activeShapeRef,
                activeObjectRef,
                layersRef,
                designStateRef,
                isCanvasReadyRef,
                syncLayers,
                viewSideRef,
                frontDesignRef,
                backDesignRef,
                productDataRef,
                // Studio States
                activeTab,
                setActiveTab,
                selectedObject,
                setSelectedObject,
                printingType,
                setPrintingType,
                // History Management
                saveHistory,
                undo,
                redo,
                canUndo: historyIndex > 0,
                canRedo: historyIndex < historyRef.current.length - 1,
                // Pricing
                customizationPrice,
                updatePrice,
                pricingSettings,
                printingMethods: pricingSettings.printingMethods,
                // Initial Selection Preservation
                initialVariantIdRef,
                initialSizeRef,
                initialColorRef,
                // Production Metadata
                uploadedAssetsMetadataRef
            }}
        >
            {children}
        </FabricContext.Provider>
    );
}

export function useFabric() {
    const ctx = useContext(FabricContext);
    if (!ctx) {
        throw new Error("useFabric must be used inside FabricProvider");
    }
    return ctx;
}
