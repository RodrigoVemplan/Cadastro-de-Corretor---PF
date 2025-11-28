
import React, { useEffect, useState } from 'react';
import { PersonalInfo, ProfessionalInfo, Manager } from '../types';
import { Loader2 } from 'lucide-react';

interface Props {
  personalData: PersonalInfo;
  professionalData: ProfessionalInfo;
  updatePersonal: (data: Partial<PersonalInfo>) => void;
  updateProfessional: (data: Partial<ProfessionalInfo>) => void;
  onNext: () => void;
  onBack: () => void;
  managers: Manager[];
}

// --- Helper Functions ---

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const validateCPF = (cpf: string) => {
  const strCPF = cpf.replace(/[^\d]+/g, '');
  if (strCPF === '') return false;
  // Checks for length and repeated digits (111.111.111-11)
  if (strCPF.length !== 11 || /^(\d)\1{10}$/.test(strCPF)) return false;

  let soma;
  let resto;
  soma = 0;
  
  // Digit 1
  for (let i = 1; i <= 9; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(strCPF.substring(9, 10))) return false;
  
  // Digit 2
  soma = 0;
  for (let i = 1; i <= 10; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(strCPF.substring(10, 11))) return false;
  
  return true;
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
  onBlur,
  error
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  placeholder?: string,
  type?: string,
  required?: boolean,
  className?: string,
  maxLength?: number,
  onBlur?: () => void,
  error?: string | null
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
      className={`w-full px-4 py-2 bg-slate-800 border rounded-lg focus:ring-2 focus:ring-brand-600 transition-all outline-none text-slate-100 placeholder-slate-500
        ${error ? 'border-red-500 focus:border-red-500 bg-red-900/10' : 'border-slate-700 focus:border-brand-600'}`}
    />
    {error && <p className="text-xs text-red-400 mt-1 font-medium">{error}</p>}
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

const RadioGroup = ({
  label,
  value,
  onChange,
  options,
  required = true
}: {
  label: string,
  value: string,
  onChange: (val: string) => void,
  options: string[],
  required?: boolean
}) => (
  <div className="mb-4 col-span-1 md:col-span-2">
    <label className="block text-sm font-medium text-slate-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <label key={opt} className="flex items-center space-x-2 cursor-pointer group">
          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${value === opt ? 'border-brand-500' : 'border-slate-600 group-hover:border-brand-400'}`}>
            {value === opt && <div className="w-3 h-3 rounded-full bg-brand-500" />}
          </div>
          <input 
            type="radio" 
            name={label} 
            value={opt} 
            checked={value === opt} 
            onChange={() => onChange(opt)} 
            className="hidden" 
          />
          <span className="text-slate-300">{opt}</span>
        </label>
      ))}
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


const Step2Form: React.FC<Props> = ({ 
  personalData, 
  professionalData, 
  updatePersonal, 
  updateProfessional, 
  onNext, 
  onBack,
  managers
}) => {
  const [isValid, setIsValid] = useState(false);
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Validation Logic
  useEffect(() => {
    const p = personalData;
    const pro = professionalData;

    const isCpfValid = validateCPF(p.cpf);

    const personalComplete = 
      p.fullName && p.nickname && p.birthDate && p.gender && 
      p.maritalStatus && p.nationality && p.rg && isCpfValid && 
      p.zipCode && p.address && p.number && p.neighborhood && p.city;

    const professionalComplete = 
      pro.creciNumber && pro.managerName && pro.workMode && 
      pro.actuationZone.length > 0 && pro.experienceTime && pro.hasOtherIncome &&
      pro.cellphone && pro.email && pro.usesSocialMedia;

    setIsValid(!!(personalComplete && professionalComplete));
    
    // Set CPF visual error if needed (only if field has content)
    if (p.cpf && p.cpf.length === 14 && !isCpfValid) {
        setCpfError('CPF Inválido');
    } else if (p.cpf && p.cpf.length < 14 && p.cpf.length > 0) {
        // Optional: warn if incomplete but not strictly invalid yet
        setCpfError(null);
    } else {
        setCpfError(null);
    }

  }, [personalData, professionalData]);

  const handleChange = (section: 'personal' | 'professional', field: string, value: string) => {
    if (section === 'personal') {
      let finalValue = value;
      if (field === 'cpf') finalValue = maskCPF(value);
      if (field === 'zipCode') finalValue = maskCEP(value);
      
      updatePersonal({ [field]: finalValue });
    } else {
      let finalValue = value;
      if (field === 'cellphone') finalValue = maskPhone(value);
      updateProfessional({ [field]: finalValue });
    }
  };

  const handleActuationZoneChange = (zones: string[]) => {
    updateProfessional({ actuationZone: zones as any }); // TS workaround for simple prop passing, strictly it's correct in state
  };

  const handleCepBlur = async () => {
    const cep = personalData.zipCode.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          updatePersonal({
            address: data.logradouro,
            neighborhood: data.bairro,
            city: `${data.localidade}/${data.uf}`,
            // We usually don't fill number or complement from generic CEP
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const managerOptions = [
    ...managers.map(m => ({ value: m.name, label: m.name })),
  ];

  return (
    <div className="animate-fade-in">
      {/* Personal Info */}
      <SectionTitle title="Informações Pessoais" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input 
          label="Nome Completo" 
          value={personalData.fullName} 
          onChange={(v) => handleChange('personal', 'fullName', v)} 
          className="md:col-span-2"
        />
        <Input 
          label="Apelido" 
          value={personalData.nickname} 
          onChange={(v) => handleChange('personal', 'nickname', v)} 
        />
        <Input 
          label="Data de Nascimento" 
          type="date"
          value={personalData.birthDate} 
          onChange={(v) => handleChange('personal', 'birthDate', v)} 
          placeholder="dd/mm/aaaa"
        />
        <Select
          label="Sexo"
          value={personalData.gender}
          onChange={(v) => handleChange('personal', 'gender', v)}
          options={[
            { value: 'Masculino', label: 'Masculino' },
            { value: 'Feminino', label: 'Feminino' },
            { value: 'Outro', label: 'Outro' }
          ]}
        />
        <Select
          label="Estado Civil"
          value={personalData.maritalStatus}
          onChange={(v) => handleChange('personal', 'maritalStatus', v)}
          options={[
            { value: 'Solteiro(a)', label: 'Solteiro(a)' },
            { value: 'Casado(a)', label: 'Casado(a)' },
            { value: 'Divorciado(a)', label: 'Divorciado(a)' },
            { value: 'Viúvo(a)', label: 'Viúvo(a)' }
          ]}
        />
        <Input 
          label="Nacionalidade" 
          value={personalData.nationality} 
          onChange={(v) => handleChange('personal', 'nationality', v)} 
        />
        <Input 
          label="RG" 
          value={personalData.rg} 
          onChange={(v) => handleChange('personal', 'rg', v)} 
        />
        <Input 
          label="CPF" 
          value={personalData.cpf} 
          onChange={(v) => handleChange('personal', 'cpf', v)} 
          placeholder="000.000.000-00"
          maxLength={14}
          error={cpfError}
        />
      </div>

      {/* Address */}
      <div className="mt-4">
        <label className="block text-sm font-semibold text-slate-300 mb-2">Endereço</label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 relative">
          <div className="md:col-span-1 relative">
             <Input 
                label="CEP" 
                value={personalData.zipCode} 
                onChange={(v) => handleChange('personal', 'zipCode', v)} 
                onBlur={handleCepBlur}
                placeholder="00000-000"
                maxLength={9}
             />
             {isLoadingCep && <div className="absolute right-3 top-9 text-brand-500 animate-spin"><Loader2 size={16} /></div>}
          </div>
          <Input 
            label="Endereço (Rua/Av)" 
            value={personalData.address} 
            onChange={(v) => handleChange('personal', 'address', v)} 
            className="md:col-span-3"
          />
          <Input 
            label="Número" 
            value={personalData.number} 
            onChange={(v) => handleChange('personal', 'number', v)} 
            className="md:col-span-1"
          />
          <Input 
            label="Complemento" 
            value={personalData.complement} 
            onChange={(v) => handleChange('personal', 'complement', v)} 
            required={false}
            className="md:col-span-1"
          />
          <Input 
            label="Bairro" 
            value={personalData.neighborhood} 
            onChange={(v) => handleChange('personal', 'neighborhood', v)} 
            className="md:col-span-1"
          />
           <Input 
            label="Cidade/UF" 
            value={personalData.city} 
            onChange={(v) => handleChange('personal', 'city', v)} 
            className="md:col-span-1"
            placeholder="Cidade/UF"
          />
        </div>
      </div>

      {/* Professional Info */}
      <SectionTitle title="Informações Profissionais" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input 
          label="Nº do Creci" 
          value={professionalData.creciNumber} 
          onChange={(v) => handleChange('professional', 'creciNumber', v)} 
        />
        <Select 
          label="Nome do seu Gerente" 
          value={professionalData.managerName} 
          onChange={(v) => handleChange('professional', 'managerName', v)}
          options={managerOptions} 
        />
        
        <RadioGroup
          label="Como prefere atuar?"
          value={professionalData.workMode}
          onChange={(v) => handleChange('professional', 'workMode', v)}
          options={['Corretor em plantões', 'Corretor parceiro, apenas levando cliente']}
        />

        <CheckboxGroup
          label="Região de Atuação (Multipla escolha)"
          values={professionalData.actuationZone}
          onChange={handleActuationZoneChange}
          options={['Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste']}
        />

        <RadioGroup
          label="Tempo de experiência como corretor"
          value={professionalData.experienceTime}
          onChange={(v) => handleChange('professional', 'experienceTime', v)}
          options={['Até 1 ano', 'de 1 a 3 anos', 'de 3 a 5 anos', '6 anos ou mais']}
        />

        <RadioGroup
          label="Possui outra fonte de renda?"
          value={professionalData.hasOtherIncome}
          onChange={(v) => handleChange('professional', 'hasOtherIncome', v)}
          options={['Sim', 'Não']}
        />
      </div>

      {/* Contact Info */}
      <SectionTitle title="Contato e Redes Sociais" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input 
          label="Celular" 
          value={professionalData.cellphone} 
          onChange={(v) => handleChange('professional', 'cellphone', v)} 
          placeholder="(XX) XXXXX-XXXX"
          className="md:col-span-2"
          maxLength={15}
        />
        <Input 
          label="E-mail" 
          type="email"
          value={professionalData.email} 
          onChange={(v) => handleChange('professional', 'email', v)} 
          className="md:col-span-2"
        />
        <RadioGroup
          label="Utiliza redes sociais profissionalmente?"
          value={professionalData.usesSocialMedia}
          onChange={(v) => handleChange('professional', 'usesSocialMedia', v)}
          options={['Sim', 'Não']}
        />
        <Input 
          label="Instagram" 
          value={professionalData.instagram} 
          onChange={(v) => handleChange('professional', 'instagram', v)} 
          placeholder="@seu.perfil"
          required={false}
          className="md:col-span-2"
        />
      </div>

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

export default Step2Form;
