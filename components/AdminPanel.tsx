
import React, { useState, useRef, useEffect } from 'react';
import { Manager, AdminUser, ReportSettings } from '../types';
import { Lock, User, Plus, Trash2, Save, X, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, CheckCircle2, FileText, Palette, Ruler, Settings } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  users: AdminUser[];
  
  // Settings Props
  contractHtml: string;
  reportSettings?: ReportSettings;
  onSaveContract: (html: string) => void;
  onSaveReportSettings?: (settings: ReportSettings) => void;

  onAddManager: (name: string, phone: string) => void;
  onRemoveManager: (id: string) => void;
  onAddUser: (login: string, pass: string) => void;
  onRemoveUser: (id: string) => void;
}

type Tab = 'managers' | 'users' | 'settings';

const AdminPanel: React.FC<Props> = ({ 
  isOpen, onClose, 
  managers, 
  users, 
  contractHtml,
  reportSettings,
  onAddManager, onRemoveManager,
  onAddUser, onRemoveUser,
  onSaveContract,
  onSaveReportSettings
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('managers');
  
  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Forms State
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerPhone, setNewManagerPhone] = useState('');
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newUserPass, setNewUserPass] = useState('');

  // Local Config
  const [localReportSettings, setLocalReportSettings] = useState<ReportSettings>({
    reportTitle: '',
    primaryColor: '#dc2626',
    logoUrl: '',
    footerText: '',
    headerHeight: 20,
    footerHeight: 15,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15
  });

  // Save Feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reportSaveSuccess, setReportSaveSuccess] = useState(false);

  // Contract Editor State
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync Data on Tab Change
  useEffect(() => {
    if (activeTab === 'settings' && editorRef.current) {
       if (editorRef.current.innerHTML !== contractHtml) {
          editorRef.current.innerHTML = contractHtml;
       }
    }
    if (reportSettings) {
        setLocalReportSettings(prev => ({...prev, ...reportSettings}));
    }
  }, [activeTab, isLoggedIn, contractHtml, reportSettings]);

  if (!isOpen) return null;

  const handleLogin = () => {
    const validUser = users.find(u => u.login === loginUser && u.password === loginPass);
    // Also allow default login if no users exist or as a fallback
    if (validUser || (loginUser === 'Rodrigo' && loginPass === '@Vpn2701')) {
      setIsLoggedIn(true);
      setLoginError('');
      // Reset Login Form
      setLoginUser('');
      setLoginPass('');
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };

  // --- Managers ---
  const handleAddManagerClick = () => {
    if (!newManagerName) return;
    onAddManager(newManagerName, newManagerPhone);
    setNewManagerName('');
    setNewManagerPhone('');
  };

  // --- Users ---
  const handleAddUserClick = () => {
    if (!newUserLogin || !newUserPass) return;
    onAddUser(newUserLogin, newUserPass);
    setNewUserLogin('');
    setNewUserPass('');
  };

  // --- Contract Editor ---
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSaveContractClick = () => {
    if (editorRef.current) {
        onSaveContract(editorRef.current.innerHTML);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // --- Report Settings ---
  const handleSaveReportSettingsClick = () => {
      if (onSaveReportSettings) {
          onSaveReportSettings(localReportSettings);
          setReportSaveSuccess(true);
      }
      setTimeout(() => setReportSaveSuccess(false), 3000);
  };

  // Render Login
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
              <Lock className="w-8 h-8 text-brand-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Área Administrativa</h2>
            <p className="text-slate-400 text-sm">Entre com suas credenciais</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Login</label>
              <input 
                type="text" 
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <input 
                type="password" 
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brand-500 outline-none"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            
            <button 
              onClick={handleLogin}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-950/50 rounded-t-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-brand-500" /> Painel de Controle
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('managers')}
            className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'managers' ? 'text-brand-500 border-b-2 border-brand-500 bg-slate-800' : 'text-slate-400 hover:text-white'}`}
          >
            Gerentes
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'users' ? 'text-brand-500 border-b-2 border-brand-500 bg-slate-800' : 'text-slate-400 hover:text-white'}`}
          >
            Usuários
          </button>
           <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'settings' ? 'text-brand-500 border-b-2 border-brand-500 bg-slate-800' : 'text-slate-400 hover:text-white'}`}
          >
            <Settings size={16} /> Configurações
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          
          {/* MANAGERS TAB */}
          {activeTab === 'managers' && (
            <div className="space-y-6">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h3 className="text-white font-semibold mb-4">Adicionar Novo Gerente</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nome</label>
                    <input 
                      type="text" 
                      placeholder="Nome do Gerente"
                      value={newManagerName}
                      onChange={(e) => setNewManagerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Telefone</label>
                    <input 
                      type="text" 
                      placeholder="Telefone/Celular"
                      value={newManagerPhone}
                      onChange={(e) => setNewManagerPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                    />
                  </div>
                  <button onClick={handleAddManagerClick} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 mt-2">
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-medium">
                    <tr>
                      <th className="p-3 text-sm">Nome</th>
                      <th className="p-3 text-sm">Telefone</th>
                      <th className="p-3 text-sm text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {managers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-700/50">
                        <td className="p-3 text-sm">{m.name}</td>
                        <td className="p-3 text-sm">{m.phone}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => onRemoveManager(m.id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {managers.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-500">Nenhum gerente cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h3 className="text-white font-semibold mb-4">Adicionar Novo Usuário</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Login</label>
                    <input 
                      type="text" 
                      placeholder="Login"
                      value={newUserLogin}
                      onChange={(e) => setNewUserLogin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Senha</label>
                    <input 
                      type="text" 
                      placeholder="Senha"
                      value={newUserPass}
                      onChange={(e) => setNewUserPass(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                    />
                  </div>
                  <button onClick={handleAddUserClick} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 mt-2">
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-medium">
                    <tr>
                      <th className="p-3 text-sm">Login</th>
                      <th className="p-3 text-sm">Senha</th>
                      <th className="p-3 text-sm text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-700/50">
                        <td className="p-3 text-sm">{u.login}</td>
                        <td className="p-3 font-mono text-xs opacity-60">{u.password}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => onRemoveUser(u.id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* SETTINGS TAB (Combined Report + Contract) */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                 
                 {/* 1. REPORT PARAMETERS */}
                 <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-6 border-b border-slate-700 pb-2 flex items-center gap-2">
                        <FileText className="text-brand-500" /> Parâmetros do Relatório PDF
                    </h3>
                    
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Título do Relatório</label>
                                <input 
                                    type="text" 
                                    value={localReportSettings.reportTitle}
                                    onChange={(e) => setLocalReportSettings(prev => ({...prev, reportTitle: e.target.value}))}
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Cor Primária</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        value={localReportSettings.primaryColor}
                                        onChange={(e) => setLocalReportSettings(prev => ({...prev, primaryColor: e.target.value}))}
                                        className="h-10 w-20 rounded cursor-pointer bg-slate-900 border border-slate-600 p-1"
                                    />
                                    <span className="text-slate-400 font-mono text-sm">{localReportSettings.primaryColor}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">URL do Logo (Topo do Relatório)</label>
                            <input 
                                type="text" 
                                value={localReportSettings.logoUrl}
                                onChange={(e) => setLocalReportSettings(prev => ({...prev, logoUrl: e.target.value}))}
                                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                                placeholder="https://..."
                            />
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Texto do Rodapé</label>
                            <input 
                                type="text" 
                                value={localReportSettings.footerText}
                                onChange={(e) => setLocalReportSettings(prev => ({...prev, footerText: e.target.value}))}
                                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                            />
                        </div>
                        
                        <div className="border-t border-slate-700 my-4 pt-4">
                           <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                             <Ruler size={18} className="text-brand-400" /> Dimensões e Margens (mm)
                           </h4>
                           
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Cabeçalho</label>
                                <input 
                                    type="number" 
                                    value={localReportSettings.headerHeight || 20}
                                    onChange={(e) => setLocalReportSettings(prev => ({...prev, headerHeight: Number(e.target.value)}))}
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Rodapé</label>
                                <input 
                                    type="number" 
                                    value={localReportSettings.footerHeight || 15}
                                    onChange={(e) => setLocalReportSettings(prev => ({...prev, footerHeight: Number(e.target.value)}))}
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Mg. Superior</label>
                                <input 
                                    type="number" 
                                    value={localReportSettings.marginTop || 10}
                                    onChange={(e) => setLocalReportSettings(prev => ({...prev, marginTop: Number(e.target.value)}))}
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Mg. Inferior</label>
                                <input 
                                    type="number" 
                                    value={localReportSettings.marginBottom || 10}
                                    onChange={(e) => setLocalReportSettings(prev => ({...prev, marginBottom: Number(e.target.value)}))}
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Mg. Esquerda</label>
                                <input 
                                    type="number" 
                                    value={localReportSettings.marginLeft || 15}
                                    onChange={(e) => setLocalReportSettings(prev => ({...prev, marginLeft: Number(e.target.value)}))}
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Mg. Direita</label>
                                <input 
                                    type="number" 
                                    value={localReportSettings.marginRight || 15}
                                    onChange={(e) => setLocalReportSettings(prev => ({...prev, marginRight: Number(e.target.value)}))}
                                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-brand-500"
                                />
                              </div>
                           </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-4">
                        {reportSaveSuccess && (
                            <span className="text-green-500 font-medium animate-fade-in flex items-center gap-1">
                                <CheckCircle2 size={18} /> Configurações salvas!
                            </span>
                        )}
                        <button 
                          onClick={handleSaveReportSettingsClick}
                          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-brand-900/40"
                        >
                          Salvar Parâmetros
                        </button>
                    </div>
                 </div>

                 {/* 2. CONTRACT EDITOR */}
                 <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col h-[700px]">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Palette className="text-brand-500" /> Editar Texto do Contrato
                        </h3>
                        <div className="flex items-center gap-4">
                            {saveSuccess && (
                                <span className="text-green-500 font-medium animate-fade-in flex items-center gap-1">
                                    <CheckCircle2 size={18} /> Contrato salvo!
                                </span>
                            )}
                            <button 
                                onClick={handleSaveContractClick}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded flex items-center gap-2 font-medium"
                            >
                                <Save size={18} /> Salvar Contrato
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 bg-slate-900/50 p-2 rounded-lg border border-slate-700 flex-wrap">
                        <button onClick={() => execCmd('bold')} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Negrito"><Bold size={18} /></button>
                        <button onClick={() => execCmd('italic')} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Itálico"><Italic size={18} /></button>
                        <button onClick={() => execCmd('underline')} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Sublinhado"><Underline size={18} /></button>
                        
                        <div className="w-px h-6 bg-slate-600 mx-2"></div>
                        
                        <button onClick={() => execCmd('justifyLeft')} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Esquerda"><AlignLeft size={18} /></button>
                        <button onClick={() => execCmd('justifyCenter')} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Centro"><AlignCenter size={18} /></button>
                        <button onClick={() => execCmd('justifyRight')} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Direita"><AlignRight size={18} /></button>
                        <button onClick={() => execCmd('justifyFull')} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white" title="Justificado"><AlignJustify size={18} /></button>
                        
                        <div className="w-px h-6 bg-slate-600 mx-2"></div>

                        <select onChange={(e) => execCmd('fontName', e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded px-2 py-1 text-sm outline-none mr-1">
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Inter">Inter</option>
                        </select>

                        <select onChange={(e) => execCmd('fontSize', e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded px-2 py-1 text-sm outline-none">
                        <option value="3">Normal</option>
                        <option value="1">Pequeno</option>
                        <option value="5">Grande</option>
                        <option value="7">Extra Grande</option>
                        </select>
                    </div>

                    <div 
                        className="flex-1 bg-white text-black p-8 rounded-lg shadow-inner overflow-y-auto"
                    >
                        <div
                            ref={editorRef}
                            contentEditable
                            className="outline-none min-h-full prose max-w-none"
                            style={{ fontFamily: 'Times New Roman, serif', lineHeight: '1.5' }}
                        />
                    </div>
                 </div>

              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
