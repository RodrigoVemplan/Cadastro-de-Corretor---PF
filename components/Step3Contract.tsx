
import React, { useRef, useState, useEffect } from 'react';
import { PenTool, CheckSquare, ArrowDownCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  onFinish: (signatureData: string) => void;
  contractHtml: string;
}

const Step3Contract: React.FC<Props> = ({ onBack, onFinish, contractHtml }) => {
  const [agreed, setAgreed] = useState(false);
  const [signatureMatch, setSignatureMatch] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [signature, setSignature] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Setup Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = 240; // Increased height
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#f8fafc'; // White for dark mode visibility
      }
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Check if scrolled to bottom (with small tolerance)
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      setHasReadContract(true);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).nativeEvent.offsetX;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).nativeEvent.offsetY;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      e.preventDefault(); // Prevent scrolling on touch
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).nativeEvent.offsetX;
      const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).nativeEvent.offsetY;
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
        setSignature(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      setSignature('');
      ctx.beginPath(); // Reset path
    }
  };

  const handleFinish = () => {
    if (!canvasRef.current) return;
    
    const originalCanvas = canvasRef.current;
    const { width, height } = originalCanvas;
    
    // Create a temporary canvas to process the signature for PDF (Black ink)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // Draw the original image (white stroke) onto temp canvas
      tempCtx.drawImage(originalCanvas, 0, 0);
      
      // Get image data to manipulate pixels
      const imageData = tempCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Loop through pixels and change color to black while preserving alpha
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          data[i] = 0;     // R -> 0
          data[i + 1] = 0; // G -> 0
          data[i + 2] = 0; // B -> 0
        }
      }
      
      // Put modified data back
      tempCtx.putImageData(imageData, 0, 0);
      
      // Get the black signature data URL
      const blackSignature = tempCanvas.toDataURL();
      onFinish(blackSignature);
    } else {
        // Fallback
        onFinish(signature); 
    }
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Contrato de Prestação de Serviço</h2>
      
      <div 
        onScroll={handleScroll}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-96 overflow-y-auto custom-scrollbar mb-6 shadow-inner text-sm text-slate-300 leading-relaxed text-justify relative"
      >
        <div 
          className="contract-content space-y-2"
          dangerouslySetInnerHTML={{ __html: contractHtml }}
        />
        <p className="mt-6 font-bold text-center text-slate-200">São Paulo, {currentDate}</p>
      </div>

      <div className="space-y-4">
        {/* Checkbox 1: Termos */}
        <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200
          ${hasReadContract 
            ? 'hover:bg-slate-800 border-transparent hover:border-slate-700 cursor-pointer' 
            : 'opacity-50 border-transparent cursor-not-allowed'}`}>
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => {
              setAgreed(e.target.checked);
              // If unchecking agreed, also uncheck the signature match
              if (!e.target.checked) setSignatureMatch(false);
            }}
            disabled={!hasReadContract}
            className="w-5 h-5 text-brand-600 rounded border-slate-600 focus:ring-brand-500 bg-slate-800 disabled:cursor-not-allowed"
          />
          <div className="flex flex-col">
            <span className="text-slate-300 font-medium">Li e aceito os termos deste contrato</span>
            {!hasReadContract && (
              <span className="text-xs text-brand-400 font-normal flex items-center gap-1 mt-1">
                <ArrowDownCircle className="w-3 h-3" />
                Role o contrato até o fim para habilitar
              </span>
            )}
          </div>
        </label>

        {/* Checkbox 2: Assinatura Igual */}
        <label className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200
          ${agreed 
            ? 'hover:bg-slate-800 border-transparent hover:border-slate-700 cursor-pointer' 
            : 'opacity-40 border-transparent cursor-not-allowed grayscale'}`}>
          <input 
            type="checkbox" 
            checked={signatureMatch} 
            onChange={(e) => setSignatureMatch(e.target.checked)}
            disabled={!agreed}
            className="w-5 h-5 text-brand-600 rounded border-slate-600 focus:ring-brand-500 bg-slate-800 disabled:cursor-not-allowed"
          />
          <div className="flex flex-col">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              Vou usar a mesma assinatura que foi usada no CNH ou RG.
            </span>
          </div>
        </label>

        {/* Signature Area - Enabled only if signatureMatch is true */}
        <div className={`border border-slate-700 rounded-lg p-4 bg-slate-900 relative transition-all duration-300
          ${!signatureMatch ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Assinatura Digital (Desenhe abaixo)
          </label>
          <div className="border-2 border-dashed border-slate-600 bg-slate-800 rounded touch-none relative" style={{ height: '240px' }}>
             <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair rounded"
             />
             {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 opacity-50">
                    Assine aqui
                </div>
             )}
          </div>
          <button 
            onClick={clearSignature}
            className="text-xs text-red-400 hover:text-red-300 mt-2 font-medium underline pointer-events-auto"
          >
            Limpar Assinatura
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
         <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-semibold text-slate-400 hover:bg-slate-800 transition-all"
        >
          &lt; Voltar
        </button>
        <button
          onClick={handleFinish}
          disabled={!agreed || !signatureMatch || !hasDrawn}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg flex items-center gap-2
            ${(agreed && signatureMatch && hasDrawn)
              ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-900/50 hover:-translate-y-0.5 cursor-pointer' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'}`}
        >
          <CheckSquare className="w-5 h-5" />
          Concluir
        </button>
      </div>
    </div>
  );
};

export default Step3Contract;
