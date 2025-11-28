
import React from 'react';
import { User, Building2, ChevronRight } from 'lucide-react';

interface Props {
  onSelect: (type: 'PF' | 'PJ') => void;
}

const Step0Selection: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="animate-fade-in py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
        {/* Pessoa Física Card */}
        <button
          onClick={() => onSelect('PF')}
          className="group h-full w-full min-h-[180px] relative flex flex-col items-center justify-between p-4 bg-slate-800 border-2 border-slate-700 rounded-xl hover:border-brand-500 hover:bg-slate-800/80 transition-all duration-300 shadow-md hover:shadow-brand-900/20"
        >
          <div className="flex flex-col items-center w-full">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-brand-500/50">
              <User className="w-6 h-6 text-brand-500" />
            </div>
            
            <h3 className="text-base font-bold text-white mb-1">Pessoa Física</h3>
            <p className="text-[10px] text-slate-400 text-center mb-3 leading-tight h-8 flex items-center justify-center">
              Cadastro para corretores autônomos com CPF.
            </p>
          </div>
          
          <div className="flex items-center text-brand-400 text-xs font-medium">
            Iniciar <ChevronRight className="w-3 h-3 ml-0.5" />
          </div>
        </button>

        {/* Pessoa Jurídica Card */}
        <button
          onClick={() => onSelect('PJ')}
          className="group h-full w-full min-h-[180px] relative flex flex-col items-center justify-between p-4 bg-slate-800 border-2 border-slate-700 rounded-xl hover:border-brand-500 hover:bg-slate-800/80 transition-all duration-300 shadow-md hover:shadow-brand-900/20"
        >
          <div className="flex flex-col items-center w-full">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-brand-500/50">
              <Building2 className="w-6 h-6 text-brand-500" />
            </div>
            
            <h3 className="text-base font-bold text-white mb-1">Pessoa Jurídica</h3>
            <p className="text-[10px] text-slate-400 text-center mb-3 leading-tight h-8 flex items-center justify-center">
              Cadastro para imobiliárias ou corretores com CNPJ.
            </p>
          </div>
          
          <div className="flex items-center text-brand-400 text-xs font-medium">
            Iniciar <ChevronRight className="w-3 h-3 ml-0.5" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Step0Selection;