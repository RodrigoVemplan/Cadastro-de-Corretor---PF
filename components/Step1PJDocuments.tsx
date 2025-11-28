
import React, { useRef, useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, X, AlertTriangle, Loader2, Plus, Trash2 } from 'lucide-react';
import { PJDocuments, PartnerDocs } from '../types';

interface Props {
  data: PJDocuments;
  updateData: (updates: Partial<PJDocuments>) => void;
  onNext: () => void;
  isAnalyzing?: boolean;
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const Step1PJDocuments: React.FC<Props> = ({ data, updateData, onNext, isAnalyzing = false }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize at least one partner if empty
  useEffect(() => {
    if (data.partners.length === 0) {
       addPartner();
    }
  }, []);

  const handleFileChange = (file: File | null, callback: (f: File | null) => void) => {
    setErrorMessage(null);
    if (file) {
      if (file.size > MAX_SIZE_BYTES) {
        setErrorMessage(`O arquivo "${file.name}" excede o limite de ${MAX_SIZE_MB}MB.`);
        return;
      }
      callback(file);
    } else {
        callback(null);
    }
  };

  const addPartner = () => {
    const newPartner: PartnerDocs = {
        id: crypto.randomUUID(),
        partnerDocFront: null,
        partnerDocBack: null,
        creciFront: null,
        creciBack: null,
        residence: null,
        creciCert: null
    };
    updateData({ partners: [...data.partners, newPartner] });
  };

  const removePartner = (id: string) => {
    if (data.partners.length <= 1) return; // Minimum 1
    updateData({ partners: data.partners.filter(p => p.id !== id) });
  };

  const updatePartner = (id: string, field: keyof PartnerDocs, file: File | null) => {
      const updatedPartners = data.partners.map(p => {
          if (p.id === id) {
              return { ...p, [field]: file };
          }
          return p;
      });
      updateData({ partners: updatedPartners });
  };

  // Validation
  const isFixedDocsValid = 
    data.socialContract && 
    data.cnpjCard && 
    data.addressProof && 
    data.creciCertPJ;

  const arePartnersValid = data.partners.every((p, index) => {
     // Always required for all partners
     const basicDocs = p.partnerDocFront && p.partnerDocBack;
     
     if (index === 0) {
         // First partner must have ALL documents
         return basicDocs && p.creciFront && p.creciBack && p.residence && p.creciCert;
     } else {
         // Additional partners only need CNH/RG Front and Back
         return basicDocs;
     }
  });
  
  const isFormValid = isFixedDocsValid && arePartnersValid;

  const UploadField = ({ 
    label, 
    currentFile, 
    onChange,
    required = true
  }: { 
    label: string, 
    currentFile: File | null,
    onChange: (f: File | null) => void,
    required?: boolean
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div 
            className={`border-2 border-dashed rounded-lg p-3 transition-colors duration-200 flex flex-col items-center justify-center text-center
            ${currentFile ? 'border-green-600 bg-green-900/10' : 'border-slate-700 hover:border-brand-500 hover:bg-slate-800'}`}
        >
            <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null, onChange)}
            />
            
            {currentFile ? (
            <div className="flex items-center gap-3 w-full justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-200 truncate max-w-[180px]">{currentFile.name}</span>
                </div>
                <button 
                onClick={() => onChange(null)}
                className="p-1 hover:bg-red-900/30 rounded-full text-red-400 transition-colors"
                >
                <X className="w-4 h-4" />
                </button>
            </div>
            ) : (
            <div className="cursor-pointer w-full flex flex-col items-center justify-center py-2" onClick={() => inputRef.current?.click()}>
                <div className="flex items-center gap-2 mb-1">
                    <Upload className="w-5 h-5 text-slate-500" />
                    <span className="text-sm text-slate-400 font-medium">Selecionar Arquivo</span>
                </div>
                <p className="text-xs text-slate-500">Máx. {MAX_SIZE_MB}MB (PDF ou Imagem)</p>
            </div>
            )}
        </div>
        </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Documentos Pessoa Jurídica</h2>
        <p className="text-slate-400 text-sm">Anexe os documentos da empresa e dos sócios.</p>
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

      {/* FIXED PJ DOCS */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6">
        <h3 className="text-brand-400 font-bold mb-4 border-b border-slate-700 pb-2">Documentos da Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
             <UploadField 
                label="01. Contrato Social / Última Alteração" 
                currentFile={data.socialContract} 
                onChange={(f) => updateData({ socialContract: f })} 
             />
             <UploadField 
                label="02. Cartão CNPJ" 
                currentFile={data.cnpjCard} 
                onChange={(f) => updateData({ cnpjCard: f })} 
             />
             <UploadField 
                label="03. Comprovante de Endereço (PJ)" 
                currentFile={data.addressProof} 
                onChange={(f) => updateData({ addressProof: f })} 
             />
             <UploadField 
                label="04. Certidão de Regularidade do Creci - (PJ)" 
                currentFile={data.creciCertPJ} 
                onChange={(f) => updateData({ creciCertPJ: f })} 
             />
        </div>
      </div>

      {/* PARTNERS DOCS */}
      <div className="space-y-6">
          {data.partners.map((partner, index) => {
             const isFirstPartner = index === 0;
             return (
             <div key={partner.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 relative">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                    <h3 className="text-brand-400 font-bold">
                        Documentos do Sócio Administrador {data.partners.length > 1 ? `#${index + 1}` : ''}
                    </h3>
                    {data.partners.length > 1 && (
                        <button 
                            onClick={() => removePartner(partner.id)}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs px-2 py-1 hover:bg-red-900/20 rounded"
                        >
                            <Trash2 className="w-3 h-3" /> Remover
                        </button>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <UploadField 
                        label="05. CNH ou RG (Sócio) - Frente" 
                        currentFile={partner.partnerDocFront} 
                        onChange={(f) => updatePartner(partner.id, 'partnerDocFront', f)} 
                    />
                    <UploadField 
                        label="06. CNH ou RG (Sócio) - Verso" 
                        currentFile={partner.partnerDocBack} 
                        onChange={(f) => updatePartner(partner.id, 'partnerDocBack', f)} 
                    />
                    <UploadField 
                        label="07. CRECI - Frente" 
                        currentFile={partner.creciFront} 
                        onChange={(f) => updatePartner(partner.id, 'creciFront', f)}
                        required={isFirstPartner}
                    />
                    <UploadField 
                        label="08. CRECI - Verso" 
                        currentFile={partner.creciBack} 
                        onChange={(f) => updatePartner(partner.id, 'creciBack', f)}
                        required={isFirstPartner}
                    />
                    <UploadField 
                        label="09. Comprovante de Endereço (PF)" 
                        currentFile={partner.residence} 
                        onChange={(f) => updatePartner(partner.id, 'residence', f)}
                        required={isFirstPartner}
                    />
                    <UploadField 
                        label="10. Certidão de Regularidade do Creci - (PJ)" 
                        currentFile={partner.creciCert} 
                        onChange={(f) => updatePartner(partner.id, 'creciCert', f)}
                        required={isFirstPartner}
                    />
                 </div>
             </div>
             );
          })}
      </div>

      <div className="mt-4 flex justify-center">
         <button 
            onClick={addPartner}
            className="flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium px-4 py-2 hover:bg-slate-800 rounded transition-colors"
         >
             <Plus className="w-5 h-5" />
             Adicionar outro Sócio
         </button>
      </div>

      <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4 flex items-start gap-3 mt-6">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200">
          <strong>Atenção:</strong> Os documentos marcados com * são obrigatórios. Para sócios adicionais, apenas RG/CNH é exigido.
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isFormValid || isAnalyzing}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg flex items-center gap-2
            ${(isFormValid && !isAnalyzing)
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

export default Step1PJDocuments;
