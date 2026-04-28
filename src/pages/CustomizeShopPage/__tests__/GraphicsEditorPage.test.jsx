import { screen, waitFor, fireEvent } from '../../../test-utils.jsx';
import { render } from '../../../test-utils.jsx';
import GraphicsEditorPage from '../GraphicsEditorPage.jsx';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock services
vi.mock('../../../services/customizationService', () => ({
  getGraphics: vi.fn(() => Promise.resolve([
    { name: 'Flame', url: '/flame.svg' },
    { name: 'Skull', url: '/skull.svg' }
  ]))
}));

// Mock Fabric Context
vi.mock('../../../context/FabricContext', () => ({
  useFabric: vi.fn(() => ({
    fabricCanvas: { current: { setBackgroundColor: vi.fn(), renderAll: vi.fn() } },
    printAreaRef: { current: {} }
  }))
}));

// Mock child components
vi.mock('../components/ElementLibrary', () => ({ default: () => <div data-testid="element-library">Element Library</div> }));
vi.mock('../components/LayersPanel', () => ({ default: () => <div data-testid="layers-panel">Layers Panel</div> }));
vi.mock('../components/Preview/PreviewButton', () => ({ default: () => <div data-testid="preview-button">Preview Button</div> }));

// Mock addSVGToCanvas
vi.mock('../fabric/Graphic/addSVGGraphic', () => ({
    addSVGToCanvas: vi.fn()
}));

describe('GraphicsEditorPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches graphics', async () => {
    render(<GraphicsEditorPage />);
    
    expect(screen.getByText(/02. Graphic Library/i)).toBeInTheDocument();
    
    await waitFor(() => {
        expect(screen.getByAltText('Flame')).toBeInTheDocument();
        expect(screen.getByAltText('Skull')).toBeInTheDocument();
    });
  });

  it('calls addSVGToCanvas when a graphic is clicked', async () => {
    render(<GraphicsEditorPage />);
    
    const { addSVGToCanvas } = await import('../fabric/Graphic/addSVGGraphic');

    await waitFor(() => {
        const flameBtn = screen.getByAltText('Flame').parentElement;
        fireEvent.click(flameBtn);
        expect(addSVGToCanvas).toHaveBeenCalled();
    });
  });

  it('handles fabric color change', async () => {
    const { useFabric } = await import('../../../context/FabricContext');
    const mockSetBackgroundColor = vi.fn();
    vi.mocked(useFabric).mockReturnValue({
        fabricCanvas: { current: { setBackgroundColor: mockSetBackgroundColor, renderAll: vi.fn() } },
        printAreaRef: { current: {} }
    });

    render(<GraphicsEditorPage />);
    
    // Find a color button (e.g., Black #000000)
    const blackBtn = screen.getAllByRole('button').find(btn => 
        btn.querySelector('div')?.style.backgroundColor === 'rgb(0, 0, 0)'
    );
    
    if (blackBtn) {
        fireEvent.click(blackBtn);
        expect(mockSetBackgroundColor).toHaveBeenCalledWith('#000000', expect.any(Function));
    }
  });
});
