
export interface Documents {
  cnhRgFront: File | null;
  cnhRgBack: File | null;
  creciFront: File | null;
  creciBack: File | null;
  residence: File | null;
}

export interface PartnerDocs {
  id: string;
  partnerDocFront: File | null;
  partnerDocBack: File | null;
  creciFront: File | null;
  creciBack: File | null;
  residence: File | null;
  creciCert: File | null;
}

export interface PJDocuments {
  socialContract: File | null;
  cnpjCard: File | null;
  addressProof: File | null;
  creciCertPJ: File | null;
  partners: PartnerDocs[];
}

export interface PersonalInfo {
  fullName: string;
  nickname: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  rg: string;
  cpf: string;
  zipCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
}

export interface ProfessionalInfo {
  creciNumber: string;
  managerName: string;
  workMode: string;
  actuationZone: string[]; 
  experienceTime: string;
  hasOtherIncome: string;
  cellphone: string;
  email: string;
  usesSocialMedia: string;
  instagram: string;
}

export interface PJCompanyInfo {
  businessName: string;
  tradeName: string;
  cnpj: string;
  creci: string;
  zipCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  phone: string;
  email: string;
  actuationZone: string[];
}

export interface PJPartnerInfo {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  educationLevel: string;
  rg: string;
  zipCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  phone: string;
  email: string;
}

export interface FormData {
  documents: Documents;
  personal: PersonalInfo;
  professional: ProfessionalInfo;
  contractSigned: boolean;
  signatureData: string | null;
  type?: 'PF' | 'PJ';
  pjDocuments?: PJDocuments;
  pjCompany?: PJCompanyInfo;
  pjPartners?: PJPartnerInfo[];
}

export enum Step {
  Selection = 0,
  Documents = 1,
  Form = 2,
  Contract = 3,
  Success = 4
}

export interface Manager {
  id: string;
  name: string;
  phone: string;
}

export interface AdminUser {
  id: string;
  login: string;
  password: string;
}

export interface ReportSettings {
  reportTitle: string;
  primaryColor: string;
  logoUrl: string;
  footerText: string;
  headerHeight: number;
  footerHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}
