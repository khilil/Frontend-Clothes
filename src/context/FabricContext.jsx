import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSettings } from "../services/customizationService";

const FabricContext = createContext(null);

// PRINTING_TYPES are now fetched from settings

export function FabricProvider({ children }) {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
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
    const [garmentColor, setGarmentColor] = useState("#FFFFFF"); // Default to white
    const [isPremiumMode, setIsPremiumMode] = useState(false);
    const [pricingSettings, setPricingSettings] = useState({
        basePrice: 499,
        textPricePerElement: 50,
        imagePricePerElement: 80,
        printingMethods: [
            { id: "dtf", label: "DTF Printing", price: 150, description: "Direct to Film - Vibrant & Durable" },
            { id: "embroidery", label: "Embroidery", price: 250, description: "Premium Stitched Design" }
        ]
    });

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const settings = await getSettings();
                if (settings) {
                    const filteredMethods = settings.printingMethods?.filter(m => 
                        ["dtf", "embroidery"].includes(m.id.toLowerCase())
                    );
                    setPricingSettings({
                        ...settings,
                        printingMethods: filteredMethods || []
                    });
                }
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
            if (obj.type === 'textbox' || obj.type === 'i-text') {
                total += pricingSettings.textPricePerElement;
            } else if (obj.type === 'image' || obj.type === 'group') {
                // Using image price for uploads and complex elements
                total += pricingSettings.imagePricePerElement;
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
        const json = JSON.stringify(canvas.toJSON(['id', 'price', 'excludeFromExport', 'isBaseImage']));
        const newHistory = historyRef.current.slice(0, historyIndex + 1);
        newHistory.push(json);

        // Limit history to 20 steps
        if (newHistory.length > 20) newHistory.shift();

        historyRef.current = newHistory;
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = async () => {
        if (historyIndex <= 0 || !fabricCanvas.current) return;
        const canvas = fabricCanvas.current;
        const newIndex = historyIndex - 1;

        canvas.isRestoring = true;
        await canvas.loadFromJSON(JSON.parse(historyRef.current[newIndex]));
        canvas.isRestoring = false;

        const baseImageURL = viewSideRef.current === "front"
            ? productDataRef.current?.frontImage
            : productDataRef.current?.backImage;

        const { addBaseImage } = await import("../pages/CustomizeShopPage/fabric/baseImage");
        await addBaseImage(canvas, baseImageURL);

        canvas.renderAll();
        setHistoryIndex(newIndex);
        syncLayers(canvas);
    };

    const redo = async () => {
        if (historyIndex >= historyRef.current.length - 1 || !fabricCanvas.current) return;
        const canvas = fabricCanvas.current;
        const newIndex = historyIndex + 1;

        canvas.isRestoring = true;
        await canvas.loadFromJSON(JSON.parse(historyRef.current[newIndex]));
        canvas.isRestoring = false;

        const baseImageURL = viewSideRef.current === "front"
            ? productDataRef.current?.frontImage
            : productDataRef.current?.backImage;

        const { addBaseImage } = await import("../pages/CustomizeShopPage/fabric/baseImage");
        await addBaseImage(canvas, baseImageURL);

        canvas.renderAll();
        setHistoryIndex(newIndex);
        syncLayers(canvas);
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
                wrapperRef,
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
                uploadedAssetsMetadataRef,
                // Mockup Context
                garmentColor,
                setGarmentColor,
                isPremiumMode,
                setIsPremiumMode
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
