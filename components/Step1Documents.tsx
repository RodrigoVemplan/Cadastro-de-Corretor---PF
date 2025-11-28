
import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, X, AlertTriangle, Loader2, Check, ShieldCheck } from 'lucide-react';
import { Documents } from '../types';

interface Props {
  data: Documents;
  updateData: (key: keyof Documents, file: File | null) => void;
  onNext: () => void;
  isAnalyzing?: boolean;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const Step1Documents: React.FC<Props> = ({ data, updateData, onNext, isAnalyzing = false }) => {
  const cnhFrontInputRef = useRef<HTMLInputElement>(null);
  const cnhBackInputRef = useRef<HTMLInputElement>(null);
  const creciFrontInputRef = useRef<HTMLInputElement>(null);
  const creciBackInputRef = useRef<HTMLInputElement>(null);
  const residenceInputRef = useRef<HTMLInputElement>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Captcha State
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [verifyingCaptcha, setVerifyingCaptcha] = useState(false);

  const handleFileChange = (key: keyof Documents, e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_SIZE_BYTES) {
        setErrorMessage(`O arquivo "${file.name}" excede o limite de ${MAX_SIZE_MB}MB.`);
        e.target.value = ''; // Reset input
        return;
      }
      updateData(key, file);
    }
  };

  const removeFile = (key: keyof Documents) => {
    setErrorMessage(null);
    updateData(key, null);
    // Reset specific input references
    if (key === 'cnhRgFront' && cnhFrontInputRef.current) cnhFrontInputRef.current.value = '';
    if (key === 'cnhRgBack' && cnhBackInputRef.current) cnhBackInputRef.current.value = '';
    if (key === 'creciFront' && creciFrontInputRef.current) creciFrontInputRef.current.value = '';
    if (key === 'creciBack' && creciBackInputRef.current) creciBackInputRef.current.value = '';
    if (key === 'residence' && residenceInputRef.current) residenceInputRef.current.value = '';
    
    // Reset captcha if a file is removed
    setCaptchaVerified(false);
  };

  // Validate that ALL fields are present
  const isFormValid = 
    data.cnhRgFront && 
    data.cnhRgBack && 
    data.creciFront && 
    data.creciBack && 
    data.residence;

  const handleCaptchaClick = () => {
    if (!isFormValid) return; // Prevent click if form is incomplete
    if (captchaVerified || verifyingCaptcha) return;
    
    setVerifyingCaptcha(true);
    // Simulate verification delay
    setTimeout(() => {
        setVerifyingCaptcha(false);
        setCaptchaVerified(true);
    }, 1500);
  };

  const UploadField = ({ 
    label, 
    fileKey, 
    currentFile, 
    inputRef 
  }: { 
    label: string, 
    fileKey: keyof Documents, 
    currentFile: File | null,
    inputRef: React.RefObject<HTMLInputElement>
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-300 mb-2">{label} <span className="text-red-500">*</span></label>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 flex flex-col items-center justify-center text-center
          ${currentFile ? 'border-green-600 bg-green-900/10' : 'border-slate-700 hover:border-brand-500 hover:bg-slate-800'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleFileChange(fileKey, e)}
        />
        
        {currentFile ? (
          <div className="flex items-center gap-3 w-full justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{currentFile.name}</span>
            </div>
            <button 
              onClick={() => removeFile(fileKey)}
              className="p-1 hover:bg-red-900/30 rounded-full text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="cursor-pointer w-full" onClick={() => inputRef.current?.click()}>
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">Clique para selecionar</p>
            <p className="text-xs text-slate-500 mt-1">Máx. {MAX_SIZE_MB}MB (PDF ou Imagem)</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Documentos Necessários</h2>
        <p className="text-slate-400">Para agilizar o seu cadastro, por favor, anexe os arquivos digitais de <strong>TODOS</strong> os seguintes documentos:</p>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-red-900/20 border border-red-800/50 rounded-lg p-4 flex items-start gap-3 text-red-200 shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <span className="font-bold block mb-1">Atenção</span>
            {errorMessage}
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300">
             <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <UploadField label="01. CNH ou RG - Frente" fileKey="cnhRgFront" currentFile={data.cnhRgFront} inputRef={cnhFrontInputRef} />
        <UploadField label="02. CNH ou RG - Verso" fileKey="cnhRgBack" currentFile={data.cnhRgBack} inputRef={cnhBackInputRef} />
        
        <div className="border-t border-slate-700 my-4"></div>
        
        <UploadField label="03. CRECI - Frente" fileKey="creciFront" currentFile={data.creciFront} inputRef={creciFrontInputRef} />
        <UploadField label="04. CRECI - Verso" fileKey="creciBack" currentFile={data.creciBack} inputRef={creciBackInputRef} />
        
        <div className="border-t border-slate-700 my-4"></div>

        <UploadField label="05. Comprovante de Residência" fileKey="residence" currentFile={data.residence} inputRef={residenceInputRef} />
      </div>

      <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4 flex items-start gap-3 mt-6">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200">
          <strong>Atenção:</strong> Todos os campos são obrigatórios. Certifique-se de que as fotos estejam legíveis.
        </p>
      </div>

      {/* CAPTCHA SECTION */}
      <div className="mt-8 flex justify-end">
          <div className={`bg-[#f9f9f9] border border-[#d3d3d3] rounded shadow-sm p-3 pr-4 flex items-center gap-3 w-fit select-none transition-all
              ${!isFormValid ? 'opacity-50 grayscale cursor-not-allowed' : 'opacity-100'}`}>
              <div 
                  onClick={handleCaptchaClick}
                  className={`w-7 h-7 border-2 rounded-sm flex items-center justify-center transition-all bg-white
                  ${!isFormValid ? 'cursor-not-allowed border-[#e0e0e0]' : 'cursor-pointer'}
                  ${captchaVerified ? 'border-transparent' : 'border-[#c1c1c1] hover:border-[#b2b2b2]'}`}
              >
                  {verifyingCaptcha ? (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : captchaVerified ? (
                      <Check className="w-6 h-6 text-green-500" />
                  ) : null}
              </div>
              
              <div className="text-[14px] font-normal text-[#222]">
                  Não sou um robô
              </div>

              <div className="flex flex-col items-center justify-center ml-4 pl-2 h-full gap-0.5">
                  <ShieldCheck className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                  <span className="text-[9px] text-slate-500 leading-none">reCAPTCHA</span>
                  <div className="text-[8px] text-slate-400 leading-none">
                      Privacidade - Termos
                  </div>
              </div>
          </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isFormValid || isAnalyzing || !captchaVerified}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg flex items-center gap-2
            ${(isFormValid && !isAnalyzing && captchaVerified)
              ? 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-900/50 hover:-translate-y-0.5 cursor-pointer' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'}`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analisando Documentos...
            </>
          ) : (
            'Avançar >>>'
          )}
        </button>
      </div>
    </div>
  );
};

export default Step1Documents;
