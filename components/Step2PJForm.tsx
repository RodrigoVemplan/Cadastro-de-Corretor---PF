
import React, { useEffect, useState } from 'react';
import { PJCompanyInfo, PJPartnerInfo } from '../types';
import { Loader2 } from 'lucide-react';

interface Props {
  companyData: PJCompanyInfo;
  partnerData: PJPartnerInfo[]; // Array
  updateCompany: (data: Partial<PJCompanyInfo>) => void;
  updatePartner: (index: number, data: Partial<PJPartnerInfo>) => void;
  onNext: () => void;
  onBack: () => void;
}

// --- Helper Functions ---

const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
    .slice(0, 15);
};

// --- Components ---

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-lg font-semibold text-brand-400 border-b border-brand-900 pb-2 mb-4 mt-8 first:mt-0">
    {title}
  </h3>
);

const Input = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "", 
  type = "text", 
  required = true,
  className = "",
  maxLength,
  onBlur
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  placeholder?: string,
  type?: string,
  required?: boolean,
  className?: string,
  maxLength?: number,
  onBlur?: () => void
}) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-slate-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-all outline-none text-slate-100 placeholder-slate-500"
    />
  </div>
);

const Select = ({ 
  label, 
  value, 
  onChange, 
  options,
  required = true,
  className = "" 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  options: { value: string, label: string }[],
  required?: boolean,
  className?: string
}) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-slate-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-all outline-none appearance-none text-slate-100"
      >
        <option value="" disabled className="text-slate-500">Selecione...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

const CheckboxGroup = ({
  label,
  values,
  onChange,
  options,
  required = true
}: {
  label: string,
  values: string[],
  onChange: (vals: string[]) => void,
  options: string[],
  required?: boolean
}) => {
  const toggleOption = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter(v => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  return (
    <div className="mb-4 col-span-1 md:col-span-2">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-4">
        {options.map((opt) => {
          const isSelected = values.includes(opt);
          return (
            <label key={opt} className="flex items-center space-x-2 cursor-pointer group select-none">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-600 border-brand-600' : 'bg-slate-800 border-slate-600 group-hover:border-brand-400'}`}>
                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
              </div>
              <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => toggleOption(opt)} 
                className="hidden" 
              />
              <span className="text-slate-300">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);


const Step2PJForm: React.FC<Props> = ({ 
  companyData, 
  partnerData, 
  updateCompany, 
  updatePartner, 
  onNext, 
  onBack
}) => {
  const [isValid, setIsValid] = useState(false);
  const [loadingCompanyCep, setLoadingCompanyCep] = useState(false);
  const [loadingPartnerCep, setLoadingPartnerCep] = useState<number | null>(null); // Store index

  // Validation
  useEffect(() => {
    const c = companyData;
    
    const companyComplete = 
        c.businessName && c.tradeName && c.cnpj && c.creci && 
        c.zipCode && c.address && c.number && c.neighborhood && c.city &&
        c.phone && c.email && c.actuationZone.length > 0;

    const allPartnersComplete = partnerData.every(p => 
        p.name && p.birthDate && p.gender && p.nationality && 
        p.maritalStatus && p.educationLevel && p.rg &&
        p.zipCode && p.address && p.number && p.neighborhood && p.city &&
        p.phone && p.email
    );

    setIsValid(!!(companyComplete && allPartnersComplete));
  }, [companyData, partnerData]);

  const handleCepBlur = async (type: 'company' | 'partner', partnerIndex?: number) => {
    let cep = '';
    if (type === 'company') cep = companyData.zipCode;
    else if (partnerIndex !== undefined) cep = partnerData[partnerIndex].zipCode;

    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      if (type === 'company') setLoadingCompanyCep(true);
      else setLoadingPartnerCep(partnerIndex!);

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            const updates = {
                address: data.logradouro,
                neighborhood: data.bairro,
                city: `${data.localidade}/${data.uf}`,
            };

            if (type === 'company') updateCompany(updates);
            else if (partnerIndex !== undefined) updatePartner(partnerIndex, updates);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        if (type === 'company') setLoadingCompanyCep(false);
        else setLoadingPartnerCep(null);
      }
    }
  };

  const handleCompanyChange = (field: keyof PJCompanyInfo, value: any) => {
    let finalValue = value;
    if (field === 'cnpj') finalValue = maskCNPJ(value);
    if (field === 'zipCode') finalValue = maskCEP(value);
    if (field === 'phone') finalValue = maskPhone(value);
    updateCompany({ [field]: finalValue });
  };

  const handlePartnerChange = (index: number, field: keyof PJPartnerInfo, value: any) => {
    let finalValue = value;
    if (field === 'zipCode') finalValue = maskCEP(value);
    if (field === 'phone') finalValue = maskPhone(value);
    updatePartner(index, { [field]: finalValue });
  };

  return (
    <div className="animate-fade-in">
      {/* SECTION 1: COMPANY DATA */}
      <SectionTitle title="Dados Pessoa Jurídica" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input 
          label="Empresa (Razão Social)" 
          value={companyData.businessName} 
          onChange={(v) => handleCompanyChange('businessName', v)} 
          className="md:col-span-2"
        />
        <Input 
          label="Nome Fantasia / Apelido" 
          value={companyData.tradeName} 
          onChange={(v) => handleCompanyChange('tradeName', v)} 
        />
        <Input 
          label="CNPJ/MF" 
          value={companyData.cnpj} 
          onChange={(v) => handleCompanyChange('cnpj', v)} 
          maxLength={18}
          placeholder="00.000.000/0000-00"
        />
        <Input 
          label="Nº do CRECI" 
          value={companyData.creci} 
          onChange={(v) => handleCompanyChange('creci', v)} 
        />
        
        {/* Company Address */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-x-6 relative mt-2">
             <div className="md:col-span-1 relative">
                <Input 
                    label="CEP" 
                    value={companyData.zipCode} 
                    onChange={(v) => handleCompanyChange('zipCode', v)} 
                    onBlur={() => handleCepBlur('company')}
                    placeholder="00000-000"
                    maxLength={9}
                />
                {loadingCompanyCep && <div className="absolute right-3 top-9 text-brand-500 animate-spin"><Loader2 size={16} /></div>}
             </div>
             <Input 
                label="Endereço (Rua/Av)" 
                value={companyData.address} 
                onChange={(v) => handleCompanyChange('address', v)} 
                className="md:col-span-3"
             />
             <Input 
                label="Número" 
                value={companyData.number} 
                onChange={(v) => handleCompanyChange('number', v)} 
             />
             <Input 
                label="Complemento" 
                value={companyData.complement} 
                onChange={(v) => handleCompanyChange('complement', v)} 
                required={false}
             />
             <Input 
                label="Bairro" 
                value={companyData.neighborhood} 
                onChange={(v) => handleCompanyChange('neighborhood', v)} 
             />
             <Input 
                label="Cidade/UF" 
                value={companyData.city} 
                onChange={(v) => handleCompanyChange('city', v)} 
             />
        </div>

        <Input 
          label="Telefone/Celular" 
          value={companyData.phone} 
          onChange={(v) => handleCompanyChange('phone', v)} 
          maxLength={15}
        />
        <Input 
          label="E-mail" 
          type="email"
          value={companyData.email} 
          onChange={(v) => handleCompanyChange('email', v)} 
        />

        <CheckboxGroup
          label="Região de Atuação (Multipla escolha)"
          values={companyData.actuationZone}
          onChange={(v) => handleCompanyChange('actuationZone', v)}
          options={['Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste']}
        />
      </div>

      {/* SECTION 2: PARTNER DATA - LOOP */}
      {partnerData.map((partner, index) => (
          <div key={partner.id || index}>
            <SectionTitle title={`Dados Sócio Administrador ${index + 1}`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Input 
                label="Nome Completo" 
                value={partner.name} 
                onChange={(v) => handlePartnerChange(index, 'name', v)} 
                className="md:col-span-2"
                />
                <Input 
                label="Data de Nascimento" 
                type="date"
                value={partner.birthDate} 
                onChange={(v) => handlePartnerChange(index, 'birthDate', v)} 
                />
                <Select
                label="Sexo"
                value={partner.gender}
                onChange={(v) => handlePartnerChange(index, 'gender', v)}
                options={[
                    { value: 'Masculino', label: 'Masculino' },
                    { value: 'Feminino', label: 'Feminino' },
                    { value: 'Outro', label: 'Outro' }
                ]}
                />
                <Input 
                label="Nacionalidade" 
                value={partner.nationality} 
                onChange={(v) => handlePartnerChange(index, 'nationality', v)} 
                />
                <Select
                label="Estado Civil"
                value={partner.maritalStatus}
                onChange={(v) => handlePartnerChange(index, 'maritalStatus', v)}
                options={[
                    { value: 'Solteiro(a)', label: 'Solteiro(a)' },
                    { value: 'Casado(a)', label: 'Casado(a)' },
                    { value: 'Divorciado(a)', label: 'Divorciado(a)' },
                    { value: 'Viúvo(a)', label: 'Viúvo(a)' }
                ]}
                />
                <Select
                label="Grau de Instrução"
                value={partner.educationLevel}
                onChange={(v) => handlePartnerChange(index, 'educationLevel', v)}
                options={[
                    { value: '1º Grau Incompleto', label: '1º Grau Incompleto' },
                    { value: '1º Grau Completo', label: '1º Grau Completo' },
                    { value: '2º Grau Incompleto', label: '2º Grau Incompleto' },
                    { value: '2º Grau Completo', label: '2º Grau Completo' },
                    { value: 'Superior Incompleto', label: 'Superior Incompleto' },
                    { value: 'Superior Completo', label: 'Superior Completo' }
                ]}
                />
                <Input 
                label="RG" 
                value={partner.rg} 
                onChange={(v) => handlePartnerChange(index, 'rg', v)} 
                />

                {/* Partner Address */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-x-6 relative mt-2">
                    <div className="md:col-span-1 relative">
                        <Input 
                            label="CEP" 
                            value={partner.zipCode} 
                            onChange={(v) => handlePartnerChange(index, 'zipCode', v)} 
                            onBlur={() => handleCepBlur('partner', index)}
                            placeholder="00000-000"
                            maxLength={9}
                        />
                        {loadingPartnerCep === index && <div className="absolute right-3 top-9 text-brand-500 animate-spin"><Loader2 size={16} /></div>}
                    </div>
                    <Input 
                        label="Endereço (Rua/Av)" 
                        value={partner.address} 
                        onChange={(v) => handlePartnerChange(index, 'address', v)} 
                        className="md:col-span-3"
                    />
                    <Input 
                        label="Número" 
                        value={partner.number} 
                        onChange={(v) => handlePartnerChange(index, 'number', v)} 
                    />
                    <Input 
                        label="Complemento" 
                        value={partner.complement} 
                        onChange={(v) => handlePartnerChange(index, 'complement', v)} 
                        required={false}
                    />
                    <Input 
                        label="Bairro" 
                        value={partner.neighborhood} 
                        onChange={(v) => handlePartnerChange(index, 'neighborhood', v)} 
                    />
                    <Input 
                        label="Cidade/UF" 
                        value={partner.city} 
                        onChange={(v) => handlePartnerChange(index, 'city', v)} 
                    />
                </div>

                <Input 
                label="Telefone/Celular" 
                value={partner.phone} 
                onChange={(v) => handlePartnerChange(index, 'phone', v)} 
                maxLength={15}
                />
                <Input 
                label="E-mail" 
                type="email"
                value={partner.email} 
                onChange={(v) => handlePartnerChange(index, 'email', v)} 
                />
            </div>
          </div>
      ))}

      <div className="mt-8 flex justify-between">
         <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg font-semibold text-slate-400 hover:bg-slate-800 transition-all"
        >
          &lt; Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg
            ${isValid 
              ? 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-900/50 hover:-translate-y-0.5 cursor-pointer' 
              : 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'}`}
        >
          Avançar &gt;&gt;&gt;
        </button>
      </div>
    </div>
  );
};

export default Step2PJForm;
