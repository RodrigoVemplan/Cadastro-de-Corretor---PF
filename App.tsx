
import React, { useState, useEffect } from 'react';
import { Check, User, FileText, Settings, Building2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import * as pdfjsLibProxy from 'pdfjs-dist';
import html2canvas from 'html2canvas';
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, getDoc } from "firebase/firestore";

import Step1Documents from './components/Step1Documents';
import Step2Form from './components/Step2Form';
import Step3Contract from './components/Step3Contract';
import Step4Success from './components/Step4Success';
import AdminPanel from './components/AdminPanel';
import { FormData, Step, Documents, PersonalInfo, ProfessionalInfo, Manager, AdminUser, ReportSettings } from './types';
import { db } from './firebase';

// Robustly handle ESM export structure (some CDNs put library on .default)
const pdfjsLib = (pdfjsLibProxy as any).default || pdfjsLibProxy;

// Initialize PDF.js worker
if (pdfjsLib.GlobalWorkerOptions) {
  // Use unpkg for the worker to ensure raw script loading (esm.sh might wrap in module which breaks importScripts)
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

const initialData: FormData = {
  // Updated documents structure
  documents: { 
    cnhRgFront: null, 
    cnhRgBack: null, 
    creciFront: null, 
    creciBack: null, 
    residence: null 
  },
  personal: {
    fullName: '', nickname: '', birthDate: '', gender: '', maritalStatus: '',
    nationality: '', rg: '', cpf: '', zipCode: '', address: '', number: '',
    complement: '', neighborhood: '', city: ''
  },
  professional: {
    creciNumber: '', managerName: '', workMode: '', actuationZone: [], 
    experienceTime: '', hasOtherIncome: '', cellphone: '', email: '', usesSocialMedia: '',
    instagram: ''
  },
  contractSigned: false,
  signatureData: null
};

const DEFAULT_REPORT_SETTINGS: ReportSettings = {
  reportTitle: "Cadastro de Corretor",
  primaryColor: "#dc2626", // Brand Red
  logoUrl: "https://www.vemplan.com.br/wp-content/uploads/2025/11/logotrans-f5188c99d4790c00b8fbdb45b07d2575a2ed53e8.gif",
  footerText: "Vemplan - Creci 21294J",
  headerHeight: 25,
  footerHeight: 15,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 15,
  marginRight: 15
};

const DEFAULT_CONTRACT_HTML = `
<div style="text-align: center; font-weight: bold; font-size: 1.2em; margin-bottom: 20px;">INSTRUMENTO PARTICULAR DE CONTRATO DE ASSOCIAÇÃO ENTRE CORRETOR E IMOBILIÁRIA</div>

<p>Pelo presente instrumento particular, as partes:</p>

<p><strong>I) Imobiliária:</strong> Vemplan - Creci 21294J (nome fantasia Vemplan), inscrita no CNPJ/MF sob no.: 11.321.867/0001-65, estabelecida na Avenida Pedroso de Morais, 2701, Pinheiros, São Paulo/SP, doravante denominada simplesmente IMOBILIÁRIA,</p>

<p><strong>II) Corretor Autônomo</strong> devidamente identificado e qualificado no preâmbulo do Formulário = Ficha Cadastro = o qual faz parte integrante deste instrumento, doravante denominado simplesmente CORRETOR ASSOCIADO.</p>

<h4 style="font-weight: bold; margin-top: 15px;">DO OBJETO</h4>
<p>1.1. IMOBILIÁRIA e CORRETOR ASSOCIADO coordenam, entre si, o desempenho de funções correlatas à intermediação imobiliária, tal como definidas no caput no artigo 3º da Lei 6.530/78, e ajustam critérios para a partilha dos resultados da atividade de corretagem.</p>
<p>1.2. Cada parte executará a intermediação imobiliária com liberdade e autonomia profissional, assim como por conta e riscos próprios, organizando seus critérios de atuação e harmonizando suas metodologias de trabalho, já que, por lei, tanto o CORRETOR ASSOCIADO, como a IMOBILIARIA são sujeitos aos mesmos direitos e obrigações no exercício profissional.</p>
<p>1.3. Esta associação não implica troca de serviços, pagamentos ou remunerações entre a IMOBILIÁRIA e o CORRETOR ASSOCIADO, sendo o resultado das partes alcançado somente na finalização útil da intermediação imobiliária, nos termos do artigo 725 do Código Civil, de modo que cada parte, isoladamente, responderá pela quitação dos tributos, taxas e emolumentos relativos ao seu quinhão no rateio dos resultados.</p>
<p>1.4. Consequentemente, assumem as partes que a relação entre si é de associação, diversa da relação de emprego ou da prestação de serviços, correndo cada parte, IMOBILIÁRIA e CORRETOR ASSOCIADO, os seus próprios riscos profissionais.</p>

<h4 style="font-weight: bold; margin-top: 15px;">DAS OBRIGAÇÕES</h4>
<p>2.1. IMOBILIÁRIA e CORRETOR ASSOCIADO estão obrigados a, igualmente:</p>
<ul style="list-style-type: disc; margin-left: 20px;">
  <li>2.1.1. Manter sigilo quanto às informações de seus clientes ou terceiros que ainda não estejam em domínio público e que, eventualmente, venham a ter conhecimento durante a associação;</li>
  <li>2.1.2. Não promover publicidade sem a devida autorização prévia do detentor de direitos da marca ou produto;</li>
  <li>2.1.3. Não concorrer de forma desleal entre si, desviando negócios a concorrentes, ou sem observar o rateio de resultados previamente combinado para cada negócio concluído;</li>
  <li>2.1.4. Observar o Código de Ética da profissão de corretor de imóveis.</li>
</ul>
<p>2.2. As partes estão cientes de que devem executar a atividade objeto desta associação com diligência e prudência.</p>
<p>2.3. A vigência deste acordo não impede que o CORRETOR ASSOCIADO possa exercer sua atividade profissional em caráter particular ou associado à outra imobiliária, desde que não configurada a concorrência desleal.</p>

<h4 style="font-weight: bold; margin-top: 15px;">RATEIO DE RESULTADOS</h4>
<p>3.1. Os honorários decorretagem serão determinados com observância à “Tabela de Honorários de Corretagem Imobiliária”.</p>
<p>3.2. O percentual dos honorários a ser atribuído ao CORRETOR ASSOCIADO e à IMOBILIÁRIA resultará de cada negócio imobiliário concluído.</p>
<p style="font-weight: bold;">Corretor de Imóveis</p>
<p>3.2.1. Fica estipulado que em decorrência da presente associação, ao CORRETOR ASSOCIADO caberá desempenhar a aproximação útil entre potenciais proprietários, compradores e incorporadores.</p>
<p>3.3. CORRETOR ASSOCIADO e IMOBILIARIA são livres para dispor sobre sua própria cota parte resultante de rateio.</p>
<p>3.4. Cada PARTE realizará a gestão e cobrança de seus próprios recebíveis dos respectivos clientes.</p>

<h4 style="font-weight: bold; margin-top: 15px;">REGISTRO, PRAZO E FORO</h4>
<p>3.6. Firmam este contrato de associação pelo prazo determinado de 01 (um) ano, que poderá ser renovado automaticamente.</p>
<p>3.7. Qualquer aditamento ou alteração deste contrato somente será válida se firmada por escrito.</p>
<p>3.10. As partes elegem o Foro da sede da IMOBILIÁRIA.</p>
<p>3.11. Por fim, declara o CORRETOR ASSOCIADO estar em dia com todas as obrigações legais para o exercício da profissão.</p>
`;

// Helper to convert File to Base64 for Gemini (with MIME wrapper)
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file or file is empty"));
      }
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Helper to get raw Base64 for PDF generation
const fileToRawBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to convert Image URL to PNG Base64 (handles CORS and GIFs)
const imageUrlToPngBase64 = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
        console.warn("Failed to load logo image (CORS or invalid URL)");
        resolve(null);
    };
    img.src = url;
  });
};

// Helper to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Helper to convert PDF file pages to images
const pdfToImages = async (file: File): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const images: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const scale = 1.5; // Good balance for quality/size
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      images.push(canvas.toDataURL('image/jpeg', 0.85));
    }
    
    return images;
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw error;
  }
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Documents);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [finalPdf, setFinalPdf] = useState<{ blob: Blob, fileName: string } | null>(null);

  // Admin State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Database State (Firestore)
  const [managers, setManagers] = useState<Manager[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  
  // Settings
  const [contractHtml, setContractHtml] = useState(DEFAULT_CONTRACT_HTML);
  const [reportSettings, setReportSettings] = useState<ReportSettings>(DEFAULT_REPORT_SETTINGS);

  // Initialize data from Firestore Listeners
  useEffect(() => {
    // 1. Managers Listener
    const unsubscribeManagers = onSnapshot(collection(db, "managers"), (snapshot) => {
      const loadedManagers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Manager));
      setManagers(loadedManagers);
    });

    // 2. Users Listener
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const loadedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AdminUser));
      setAdminUsers(loadedUsers);
    });

    // 3. Contract Listener
    const docRef = doc(db, "settings", "contract");
    const unsubscribeContract = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.html) {
          setContractHtml(data.html);
        }
      } else {
        setDoc(docRef, { html: DEFAULT_CONTRACT_HTML });
      }
    });

    // 4. Report Settings Listener
    const reportRef = doc(db, "settings", "report");
    const unsubscribeReport = onSnapshot(reportRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<ReportSettings>;
        setReportSettings(prev => ({ ...DEFAULT_REPORT_SETTINGS, ...data }));
      } else {
        setDoc(reportRef, DEFAULT_REPORT_SETTINGS);
      }
    });

    return () => {
      unsubscribeManagers();
      unsubscribeUsers();
      unsubscribeContract();
      unsubscribeReport();
    };
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Admin Handlers - Firestore Ops
  const handleAddManager = async (name: string, phone: string) => {
    try {
      await addDoc(collection(db, "managers"), { name, phone });
    } catch (e) {
      console.error("Error adding manager: ", e);
      alert("Erro ao adicionar gerente. Tente novamente.");
    }
  };

  const handleRemoveManager = async (id: string) => {
    try {
      await deleteDoc(doc(db, "managers", id));
    } catch (e) {
      console.error("Error removing manager: ", e);
      alert("Erro ao remover gerente.");
    }
  };

  const handleAddUser = async (login: string, pass: string) => {
    try {
      await addDoc(collection(db, "users"), { login, password: pass });
    } catch (e) {
      console.error("Error adding user: ", e);
      alert("Erro ao adicionar usuário.");
    }
  };

  const handleRemoveUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (e) {
      console.error("Error removing user: ", e);
      alert("Erro ao remover usuário.");
    }
  };

  const handleSaveContract = async (html: string) => {
    try {
      await setDoc(doc(db, "settings", "contract"), { html }, { merge: true });
    } catch (e) {
      console.error("Error saving contract: ", e);
      alert("Erro ao salvar contrato.");
    }
  };

  const handleSaveReportSettings = async (settings: ReportSettings) => {
    try {
      await setDoc(doc(db, "settings", "report"), settings, { merge: true });
    } catch (e) {
      console.error("Error saving report settings: ", e);
      alert("Erro ao salvar configurações do relatório.");
    }
  };

  const updateDocuments = (key: keyof Documents, file: File | null) => {
    setFormData(prev => ({ ...prev, documents: { ...prev.documents, [key]: file } }));
  };
  
  const updatePersonal = (data: Partial<PersonalInfo>) => {
    setFormData(prev => ({ ...prev, personal: { ...prev.personal, ...data } }));
  };

  const updateProfessional = (data: Partial<ProfessionalInfo>) => {
    setFormData(prev => ({ ...prev, professional: { ...prev.professional, ...data } }));
  };

  const generatePDF = async (signature: string): Promise<{ blob: Blob, fileName: string } | null> => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const settingsToUse = reportSettings;
      const contractHtmlToUse = contractHtml;

      // Use configured settings
      const { 
        primaryColor, reportTitle, logoUrl,
        marginTop, marginBottom, marginLeft, marginRight,
        headerHeight, footerHeight 
      } = settingsToUse;

      // Track processed files to avoid duplicates
      const processedFileIds = new Set<string>();

      // Preload Logo
      let logoData: string | null = null;
      if (logoUrl) {
        logoData = await imageUrlToPngBase64(logoUrl);
      }

      // Helper to draw Common Header (Logo + Title)
      const drawCommonHeader = () => {
         const { r, g, b } = hexToRgb(primaryColor);
         
         // Draw Logo if exists
         if (logoData) {
             try {
                const imgProps = doc.getImageProperties(logoData);
                
                const maxH = headerHeight - 4;
                const maxW = 60; // Max width for logo in mm
                
                let w = imgProps.width;
                let h = imgProps.height;
                
                // 1. Scale to fit height
                const scaleH = maxH / h;
                w = w * scaleH;
                h = maxH;
                
                // 2. If width is still too big, scale down by width
                if (w > maxW) {
                    const scaleW = maxW / w;
                    w = maxW;
                    h = h * scaleW;
                }

                // Draw logo
                doc.addImage(logoData, 'PNG', marginLeft, marginTop + 2, w, h);
             } catch(e) {
                 console.warn("Could not draw logo", e);
             }
         }
         
         // Draw Title
         doc.setFontSize(14);
         doc.setTextColor(r, g, b);
         doc.setFont("helvetica", "bold");
         doc.text(reportTitle, pageWidth - marginRight, marginTop + (headerHeight/2) + 2, { align: 'right' });
         
         // Line
         doc.setDrawColor(200, 200, 200);
         doc.setLineWidth(0.5);
         doc.line(marginLeft, marginTop + headerHeight, pageWidth - marginRight, marginTop + headerHeight);
         
         // Reset for body
         doc.setTextColor(0, 0, 0);
         doc.setFontSize(10);
         doc.setFont("helvetica", "normal");
      };

      const drawFooter = (doc: jsPDF, pageNum: number) => {
          const footerY = pageHeight - marginBottom - (footerHeight / 2);
          doc.setDrawColor(200);
          doc.setLineWidth(0.5);
          doc.line(marginLeft, pageHeight - marginBottom - footerHeight + 2, pageWidth - marginRight, pageHeight - marginBottom - footerHeight + 2);
          doc.setFontSize(12);
          doc.setTextColor(220, 38, 38); // Red
          doc.text(settingsToUse.footerText, marginLeft, footerY);
          
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Página ${pageNum}`, pageWidth - marginRight, footerY, { align: 'right' });
      };

      let y = marginTop + headerHeight + 10;
      const contentWidth = pageWidth - marginLeft - marginRight;
      const maxY = pageHeight - marginBottom - footerHeight;
      const { r, g, b } = hexToRgb(primaryColor);

      const checkPageBreak = (heightNeeded: number) => {
        if (y + heightNeeded > maxY) {
          doc.addPage();
          drawCommonHeader();
          drawFooter(doc, doc.getNumberOfPages());
          y = marginTop + headerHeight + 10;
        }
      };

      const addSectionTitle = (title: string) => {
        checkPageBreak(15);
        y += 2;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(r, g, b); 
        doc.text(title, marginLeft, y);
        y += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
      };

      // Updated addField for strict vertical layout
      const addField = (label: string, value: string) => {
        checkPageBreak(8);
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, marginLeft, y);
        
        doc.setFont("helvetica", "normal");
        const splitVal = doc.splitTextToSize(value || "-", contentWidth - 50);
        doc.text(splitVal, marginLeft + 50, y);
        
        // Optimize spacing (6mm per line typically)
        y += (Math.max(1, splitVal.length) * 6);
      };

      // --- PAGE 1: DADOS CADASTRAIS ---
      
      // Draw Header for Page 1
      drawCommonHeader();
      drawFooter(doc, 1);
      
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - marginRight, y, { align: "right" });
      y += 6;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Tipo de Cadastro: Pessoa Física`, marginLeft, y);
      y += 8;

      addSectionTitle("1. Informações Pessoais");
      
      addField("Nome Completo", formData.personal.fullName);
      addField("Apelido", formData.personal.nickname);
      
      let formattedBirthDate = formData.personal.birthDate;
      if (formattedBirthDate && formattedBirthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = formattedBirthDate.split('-');
        formattedBirthDate = `${day}/${month}/${year}`;
      }
      addField("Data de Nascimento", formattedBirthDate);
      addField("Sexo", formData.personal.gender);
      addField("Estado Civil", formData.personal.maritalStatus);
      addField("Nacionalidade", formData.personal.nationality);
      addField("RG", formData.personal.rg);
      addField("CPF", formData.personal.cpf);
      
      addSectionTitle("Endereço");
      addField("Logradouro", formData.personal.address);
      addField("Número", formData.personal.number);
      addField("Complemento", formData.personal.complement);
      addField("Bairro", formData.personal.neighborhood);
      addField("Cidade/UF", formData.personal.city);
      addField("CEP", formData.personal.zipCode);

      addSectionTitle("2. Informações Profissionais");
      addField("CRECI", formData.professional.creciNumber);
      addField("Gerente", formData.professional.managerName);
      addField("Modo de Atuação", formData.professional.workMode);
      addField("Zonas de Atuação", formData.professional.actuationZone.join(", "));
      addField("Tempo de Experiência", formData.professional.experienceTime);
      addField("Possui Outra Renda", formData.professional.hasOtherIncome);

      addSectionTitle("3. Contato e Social");
      addField("Celular", formData.professional.cellphone);
      addField("E-mail", formData.professional.email);
      addField("Usa Redes Sociais?", formData.professional.usesSocialMedia);
      addField("Instagram", formData.professional.instagram);


      // --- ADD SIGNATURE TO PAGE 1 (Bottom Right) ---
      if (signature) {
          const currentPage = doc.getNumberOfPages();
          // Ensure we are on Page 1
          doc.setPage(1);
          
          try {
              const sigProps = doc.getImageProperties(signature);
              const sigW = 35; // Fixed width 35mm
              const sigH = (sigProps.height * sigW) / sigProps.width;
              
              // Position: Bottom Right, above footer
              const sigX = pageWidth - marginRight - sigW;
              const sigY = pageHeight - marginBottom - footerHeight - sigH - 2;

              doc.addImage(signature, 'PNG', sigX, sigY, sigW, sigH);
              
              doc.setFontSize(6);
              doc.setTextColor(120);
              doc.text("Assinatura Digital", sigX + (sigW/2), sigY + sigH + 2, { align: 'center' });
              doc.setTextColor(0, 0, 0); // Reset color
              doc.setFontSize(10);
          } catch(e) {
              console.warn("Could not add signature to page 1", e);
          }
          
          // Return to correct page context (though next steps handle new pages)
          doc.setPage(currentPage);
      }

      // --- DOCUMENTS SECTION ---
      // Requirement: 1 Document per Page, with Header, Logo, Title, Document Label

      const processImage = async (file: File | null, label: string) => {
        // Skip entirely if file is null (handles optional PJ docs)
        if (!file) return;

        // Logic to avoid duplicates (Global): Check BEFORE adding page
        const fileId = `${file.name}-${file.size}-${file.lastModified}`;
        if (processedFileIds.has(fileId)) {
            // Return early without adding page
            return;
        }
        processedFileIds.add(fileId);

        // Force new page for each document field
        doc.addPage();
        drawCommonHeader();
        drawFooter(doc, doc.getNumberOfPages());
        y = marginTop + headerHeight + 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(label, marginLeft, y);
        y += 10;

        if (file.type.includes('image')) {
          try {
            const base64Data = await fileToRawBase64(file);
            const imgProps = doc.getImageProperties(base64Data);
            
            // Calculate scale to fit page content area
            const availableW = contentWidth;
            const availableH = maxY - y;
            
            let imgW = availableW;
            let imgH = (imgProps.height * imgW) / imgProps.width;

            if (imgH > availableH) {
                imgH = availableH;
                imgW = (imgProps.width * imgH) / imgProps.height;
            }
            
            // Center image
            const xPos = marginLeft + (availableW - imgW) / 2;
            doc.addImage(base64Data, 'JPEG', xPos, y, imgW, imgH);
            
          } catch (e) {
            doc.text("[Erro ao processar imagem]", marginLeft, y);
          }
        } else if (file.type === 'application/pdf') {
          try {
            const pdfImages = await pdfToImages(file);
            if (pdfImages.length === 0) {
                 doc.text("[PDF vazio ou ilegível]", marginLeft, y);
                 return;
            }
            
            // If PDF has multiple pages, render them
            for (let i = 0; i < pdfImages.length; i++) {
                const imgData = pdfImages[i];
                // If not first page of the PDF file, we need a new sheet in the report
                if (i > 0) {
                     doc.addPage();
                     drawCommonHeader();
                     drawFooter(doc, doc.getNumberOfPages());
                     y = marginTop + headerHeight + 10;
                     doc.setFont("helvetica", "bold");
                     doc.setFontSize(12);
                     doc.text(`${label} (Página ${i + 1})`, marginLeft, y);
                     y += 10;
                }

                const imgProps = doc.getImageProperties(imgData);
                const availableW = contentWidth;
                const availableH = maxY - y;
                
                let imgW = availableW;
                let imgH = (imgProps.height * imgW) / imgProps.width;

                if (imgH > availableH) {
                    imgH = availableH;
                    imgW = (imgProps.width * imgH) / imgProps.height;
                }

                const xPos = marginLeft + (availableW - imgW) / 2;
                doc.addImage(imgData, 'JPEG', xPos, y, imgW, imgH);
            }
          } catch (e) {
            console.error(e);
            doc.setFont("helvetica", "italic");
            doc.text("[Erro ao renderizar arquivo PDF]", marginLeft, y);
          }
        } else {
          doc.setFont("helvetica", "italic");
          doc.text(`[Arquivo: ${file.name} - Formato não suportado para visualização]`, marginLeft, y);
        }
      };

      await processImage(formData.documents.cnhRgFront, "01. CNH ou RG - Frente");
      await processImage(formData.documents.cnhRgBack, "02. CNH ou RG - Verso");
      await processImage(formData.documents.creciFront, "03. CRECI - Frente");
      await processImage(formData.documents.creciBack, "04. CRECI - Verso");
      await processImage(formData.documents.residence, "05. Comprovante de Residência");

      // --- PAGE 3+: CONTRATO & ASSINATURA ---
      doc.addPage();
      
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.width = '700px'; 
      container.style.padding = '40px';
      container.style.backgroundColor = 'white';
      container.style.color = 'black';
      container.style.fontFamily = 'Times New Roman, serif';
      container.style.lineHeight = '1.5';
      
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = contractHtmlToUse;
      container.appendChild(contentDiv);
      
      const footerDiv = document.createElement('div');
      footerDiv.style.marginTop = '40px';
      footerDiv.style.pageBreakInside = 'avoid';
      
      const signerName = formData.personal.fullName;
      const signerDoc = formData.personal.cpf; 
      const signerLabel = 'Corretor';
      
      footerDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px; font-weight: bold; color: #000000;">
          São Paulo, ${new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <div style="text-align: center; margin-bottom: 50px;">
            ${signature ? `<img src="${signature}" style="height: 60px; display: block; margin: 0 auto 5px auto;" />` : `<div style="height: 65px;"></div>`}
            <div style="display: inline-block; border-top: 1px solid #000000; padding-top: 5px; min-width: 300px;">
                <div style="font-weight: bold; font-size: 14px; color: #000000; font-family: Helvetica, Arial, sans-serif;">${signerName || 'Nome do Responsável'}</div>
                <div style="font-size: 12px; margin-top: 2px; color: #000000; font-family: Helvetica, Arial, sans-serif;">${signerLabel} - Documento: ${signerDoc || '-'}</div>
            </div>
        </div>

        <div style="text-align: center;">
             <div style="height: 40px;"></div>
             <div style="display: inline-block; border-top: 1px solid #000000; padding-top: 5px; min-width: 300px; font-weight: bold; font-size: 14px; color: #000000; font-family: Helvetica, Arial, sans-serif;">
                VEMPLAN
             </div>
        </div>
      `;
      container.appendChild(footerDiv);

      document.body.appendChild(container);

      try {
        const canvas = await html2canvas(container, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imgWidth = contentWidth; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        
        const pageHeightAvailable = pageHeight - marginBottom - headerHeight - footerHeight;
        const contentStartY = marginTop + headerHeight;
        let pageNum = doc.getNumberOfPages(); // Resume page numbering

        while (heightLeft > 0) {
            drawCommonHeader();
            drawFooter(doc, pageNum);

            // We use 'offset' tracking
            const offset = (imgHeight - heightLeft);
            const positionY = contentStartY - offset;
            
            doc.addImage(imgData, 'JPEG', marginLeft, positionY, imgWidth, imgHeight);
            
            // Mask Top
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, pageWidth, marginTop + headerHeight - 0.5, 'F');
            drawCommonHeader(); // Redraw header on top of mask

            // Mask Bottom
            doc.setFillColor(255, 255, 255);
            doc.rect(0, pageHeight - marginBottom - footerHeight + 0.5, pageWidth, marginBottom + footerHeight, 'F');
            drawFooter(doc, pageNum);
            
            heightLeft -= pageHeightAvailable;
            
            if (heightLeft > 0) {
                doc.addPage();
                pageNum++;
            }
        }

      } catch (e) {
        console.error("Error rendering contract html", e);
        doc.text("Erro ao renderizar visualização do contrato.", marginLeft, y);
      } finally {
        document.body.removeChild(container);
      }

      const fileName = `Cadastro_Vemplan_${signerName ? signerName.replace(/\s+/g, '_') : 'Corretor'}.pdf`;
      return { blob: doc.output('blob'), fileName };

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Houve um erro ao gerar o PDF.");
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleFinishContract = async (signature: string) => {
    setFormData(prev => ({ ...prev, contractSigned: true, signatureData: signature }));
    
    // Generate PDF blob and store it, then move to success
    const pdfResult = await generatePDF(signature);
    if (pdfResult) {
      setFinalPdf(pdfResult);
      setCurrentStep(Step.Success);
    }
  };

  const handleAnalyzeDocuments = async () => {
    if (!formData.documents.cnhRgFront || !formData.documents.cnhRgBack || 
        !formData.documents.creciFront || !formData.documents.creciBack || 
        !formData.documents.residence) {
        alert("Por favor, anexe todos os documentos.");
        return;
    }

    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const parts = [];

      parts.push({
        text: `ATUE COMO UM ESPECIALISTA EM EXTRAÇÃO DE DADOS (OCR) DE DOCUMENTOS BRASILEIROS.
        Analise as imagens fornecidas. Extraia os dados com a MÁXIMA PRECISÃO.`
      });
      
      if (formData.documents.cnhRgFront) parts.push(await fileToGenerativePart(formData.documents.cnhRgFront));
      if (formData.documents.cnhRgBack) parts.push(await fileToGenerativePart(formData.documents.cnhRgBack));
      if (formData.documents.creciFront) parts.push(await fileToGenerativePart(formData.documents.creciFront));
      if (formData.documents.creciBack) parts.push(await fileToGenerativePart(formData.documents.creciBack));
      if (formData.documents.residence) parts.push(await fileToGenerativePart(formData.documents.residence));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              personal: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  birthDate: { type: Type.STRING, description: "Format YYYY-MM-DD" },
                  gender: { type: Type.STRING, enum: ["Masculino", "Feminino", "Outro"] },
                  maritalStatus: { type: Type.STRING, enum: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"] },
                  nationality: { type: Type.STRING },
                  rg: { type: Type.STRING },
                  cpf: { type: Type.STRING },
                  zipCode: { type: Type.STRING },
                  address: { type: Type.STRING },
                  number: { type: Type.STRING },
                  complement: { type: Type.STRING },
                  neighborhood: { type: Type.STRING },
                  city: { type: Type.STRING }
                }
              },
              professional: {
                type: Type.OBJECT,
                properties: {
                  creciNumber: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      const extractedText = response.text;
      
      if (extractedText) {
        const extractedData = JSON.parse(extractedText);
        
        // Helper function to merge only present/valid data (non-empty strings)
        // This prevents overwriting existing data with null/undefined/empty string if AI misses a field
        const cleanData = (data: any) => {
            if (!data) return {};
            return Object.entries(data).reduce((acc, [key, value]) => {
                if (value && typeof value === 'string' && value.trim() !== '' && value !== 'null') {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);
        };

        const cleanPersonal = cleanData(extractedData.personal);
        const cleanProfessional = cleanData(extractedData.professional);

        setFormData(prev => ({
            ...prev,
            personal: { ...prev.personal, ...cleanPersonal },
            professional: { ...prev.professional, ...cleanProfessional }
        }));
      }

    } catch (error) {
      console.error("Erro ao analisar documentos:", error);
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(Step.Form);
    }
  };

  const StepIndicator = () => {
    const steps = [
      { num: 1, icon: FileText, label: "Documentos" },
      { num: 2, icon: User, label: "Cadastro" },
      { num: 3, icon: FileText, label: "Contrato" }
    ];

    let displayStep = 0;
    if (currentStep === Step.Documents) displayStep = 1;
    if (currentStep === Step.Form) displayStep = 2;
    if (currentStep === Step.Contract) displayStep = 3;
    if (currentStep === Step.Success) displayStep = 4;

    return (
      <div className="mb-8 w-full">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 -z-10 rounded transition-all duration-500"
            style={{ width: `${((displayStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((step) => {
            const isActive = displayStep >= step.num;
            const isCurrent = displayStep === step.num;
            return (
              <div key={step.num} className="flex flex-col items-center bg-transparent">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300
                  ${isActive ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-900/50' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                >
                  {isActive && displayStep > step.num ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-sm font-medium ${isCurrent ? 'text-brand-400' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Find selected manager's phone
  const selectedManager = managers.find(m => m.name === formData.professional.managerName);
  const managerPhone = selectedManager ? selectedManager.phone : '';

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 relative">
      {/* Admin Button */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="fixed bottom-4 right-4 bg-slate-800 text-slate-500 p-2 rounded-full hover:bg-slate-700 hover:text-slate-300 transition-colors z-40"
      >
        <Settings size={20} />
      </button>

      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        managers={managers}
        users={adminUsers}
        contractHtml={contractHtml}
        reportSettings={reportSettings}
        onSaveContract={handleSaveContract}
        onSaveReportSettings={handleSaveReportSettings}
        onAddManager={handleAddManager}
        onRemoveManager={handleRemoveManager}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
      />

      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-500 mb-4"></div>
          <p className="text-lg font-semibold">Gerando seu Contrato e Relatório...</p>
          <p className="text-sm text-slate-400">Aguarde um momento.</p>
        </div>
      )}

      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 pl-2">
             <img 
               src="https://www.vemplan.com.br/wp-content/uploads/2025/11/logotrans-f5188c99d4790c00b8fbdb45b07d2575a2ed53e8.gif"
               alt="Logo Empresa" 
               className="h-16 w-auto object-contain"
             />
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              {reportSettings.reportTitle}
              <span className="block text-sm font-normal text-brand-400 mt-1">
                Pessoa Física
              </span>
            </h1>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 rounded-2xl shadow-xl shadow-black/20 border border-slate-800 overflow-hidden">
          <div className="p-8">
            {currentStep !== Step.Success && <StepIndicator />}
            
            <div className="min-h-[400px]">

              {currentStep === Step.Documents && (
                <Step1Documents 
                  data={formData.documents} 
                  updateData={updateDocuments} 
                  onNext={handleAnalyzeDocuments}
                  isAnalyzing={isAnalyzing}
                />
              )}
              
              {currentStep === Step.Form && (
                  <Step2Form 
                    personalData={formData.personal}
                    professionalData={formData.professional}
                    updatePersonal={updatePersonal}
                    updateProfessional={updateProfessional}
                    onNext={() => setCurrentStep(Step.Contract)}
                    onBack={() => setCurrentStep(Step.Documents)}
                    managers={managers}
                  />
              )}

              {currentStep === Step.Contract && (
                <Step3Contract 
                  onBack={() => setCurrentStep(Step.Form)}
                  onFinish={handleFinishContract}
                  contractHtml={contractHtml}
                />
              )}

              {currentStep === Step.Success && (
                <Step4Success 
                  pdfData={finalPdf}
                  managerPhone={managerPhone}
                />
              )}
            </div>
          </div>
          <div className="bg-slate-950 p-4 text-center border-t border-slate-800">
             <p className="text-xs text-slate-500">
               <span className="text-white font-normal">Vemplan - Creci 21294J</span>
               <span className="block mt-1 text-[10px] opacity-75">Criado por Rodrigo Miyamoto</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
