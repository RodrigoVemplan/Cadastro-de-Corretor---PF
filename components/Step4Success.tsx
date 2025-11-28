import React from 'react';
import { CheckCircle, MessageCircle, Download } from 'lucide-react';

interface Props {
  pdfData: { blob: Blob, fileName: string } | null;
  managerPhone?: string;
}

const Step4Success: React.FC<Props> = ({ pdfData, managerPhone }) => {
  const handleWhatsAppClick = async () => {
    if (!pdfData) {
      alert("O arquivo PDF ainda não foi gerado ou houve um erro.");
      return;
    }

    const message = "Olá, finalizei meu cadastro. Segue em anexo a ficha cadastral.";
    
    // Prepare phone number for WhatsApp link
    // Remove non-digit characters
    const cleanPhone = managerPhone ? managerPhone.replace(/\D/g, '') : '';
    // If it looks like a BR number (10 or 11 digits) and doesn't start with 55, add it.
    // Otherwise use it as is (or if empty, standard link opens contact selector)
    let formattedPhone = cleanPhone;
    if (formattedPhone && formattedPhone.length >= 10 && formattedPhone.length <= 11) {
        formattedPhone = `55${formattedPhone}`;
    }

    const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    // Try to use the Web Share API if supported (mostly mobile)
    const file = new File([pdfData.blob], pdfData.fileName, { type: 'application/pdf' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Ficha Cadastral',
          text: message
        });
        return; // Success, exit
      } catch (error) {
        console.error("Error sharing:", error);
        // Continue to fallback if share was cancelled or failed
      }
    }

    // Fallback for Desktop or if Share API fails/is cancelled
    // 1. Download the file programmatically
    const url = window.URL.createObjectURL(pdfData.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // 2. Open WhatsApp Web and instruct user
    alert("Como você está num dispositivo que não suporta o envio direto de arquivos (Desktop), o PDF foi baixado automaticamente.\n\nPor favor, anexe-o na conversa do WhatsApp que será aberta a seguir.");
    window.open(waLink, '_blank');
  };

  const handleDownloadClick = () => {
    if (!pdfData) {
      alert("O arquivo PDF não está disponível.");
      return;
    }
    const url = window.URL.createObjectURL(pdfData.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setTimeout(() => {
      alert("Documento salvo com sucesso!");
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
      <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-slate-100 mb-4">Eba! Você gerou sua Ficha de Cadastro</h2>
      
      <p className="text-slate-300 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
        Seus dados e documentos foram criados com sucesso, para finalizar o cadastro envie a ficha para seu gerente clicando no botão enviar via Whatsapp.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
        <button 
          onClick={handleWhatsAppClick}
          className="px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-3 transform hover:-translate-y-1"
        >
            <MessageCircle className="w-6 h-6" />
            Enviar via WhatsApp
        </button>
        
        <button 
          onClick={handleDownloadClick}
          className="px-6 py-4 border border-slate-700 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Salvar Ficha de Cadastro
        </button>
      </div>
    </div>
  );
};

export default Step4Success;