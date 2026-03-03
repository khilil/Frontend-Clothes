import CanvasArea from "./components/CanvasArea";
import PreviewButton from "./components/Preview/PreviewButton";
import TextEditorSidebar from './TextEditorSidebar'

export default function TextEditorPage() {
    return (
        <div className="text-white">
            <TextEditorSidebar />
            <PreviewButton />
        </div>
    );
}
