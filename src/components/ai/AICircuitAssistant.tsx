import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  Settings, 
  Check, 
  Layers, 
  AlertCircle, 
  Radio, 
  Lock, 
  BookOpen, 
  Send, 
  RefreshCw, 
  Search, 
  X, 
  Cpu, 
  MessageSquare, 
  Copy, 
  Trash2, 
  Code, 
  Zap, 
  CheckCheck,
  Plus,
  Wifi,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { 
  AISchematicRecipe, 
  UserAISettings, 
  CircuitComponent, 
  Wire, 
  AIChatMessage,
  AgentTurn
} from '../../types/circuit';
import { 
  synthesizeCircuitFromPrompt, 
  askCircuitAIChat,
  buildCircuitContextSummary,
  PREBUILT_RECIPES, 
  AI_PROVIDERS_CONFIG 
} from '../../services/aiEngine';
import { AISettingsModal } from './AISettingsModal';

interface Props {
  onApplyRecipe: (recipe: AISchematicRecipe) => void;
  aiSettings: UserAISettings;
  onUpdateAISettings: (settings: UserAISettings) => void;
  components?: CircuitComponent[];
  wires?: Wire[];
}

// Helper render formatted markdown & code blocks with copy action
const FormattedChatMessage: React.FC<{ content: string }> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const parts = useMemo(() => {
    // Tách code block ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
    const result: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      result.push({
        type: 'code',
        language: match[1] || 'cpp',
        content: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return result;
  }, [content]);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="chat-content-flow">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          const isCopied = copiedIndex === index;
          return (
            <div key={index} className="chat-code-block-wrapper my-2">
              <div className="chat-code-header">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
                    {part.language || 'ARDUINO C++'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(part.content, index)}
                  className="chat-copy-code-btn"
                  title="Sao chép toàn bộ mã nguồn"
                >
                  {isCopied ? (
                    <>
                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-cyan-400" />
                      <span>Sao chép Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="chat-code-pre">
                <code>{part.content}</code>
              </pre>
            </div>
          );
        }

        // Render formatted text
        const textLines = part.content.split('\n');
        return (
          <div key={index} className="chat-text-chunk">
            {textLines.map((line, lineIdx) => {
              if (!line.trim()) {
                return <div key={lineIdx} className="h-1.5" />;
              }

              // Bold format **text**
              const formattedLine = line.replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="text-cyan-300 font-semibold">$1</strong>'
              );

              // Heading check ###
              if (line.startsWith('### ')) {
                return (
                  <h4
                    key={lineIdx}
                    className="text-xs font-bold text-slate-100 mt-2 mb-1 flex items-center gap-1"
                    dangerouslySetInnerHTML={{ __html: formattedLine.replace('### ', '') }}
                  />
                );
              }

              // Bullet points
              if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                return (
                  <div
                    key={lineIdx}
                    className="text-xs text-slate-200 pl-3 relative my-0.5 leading-relaxed"
                  >
                    <span className="absolute left-0 text-cyan-400">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-•]\s*/, '') }} />
                  </div>
                );
              }

              return (
                <p
                  key={lineIdx}
                  className="text-xs text-slate-200 leading-relaxed my-0.5"
                  dangerouslySetInnerHTML={{ __html: formattedLine }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export const AICircuitAssistant: React.FC<Props> = ({
  onApplyRecipe,
  aiSettings,
  onUpdateAISettings,
  components = [],
  wires = [],
}) => {
  // 3 Chế độ chính: 'agents' (Thực thi theo prompt), 'library' (Thư viện mẫu), 'chat' (Hỏi đáp & tìm hiểu)
  const [activeMode, setActiveMode] = useState<'agents' | 'library' | 'chat'>('agents');

  // States cho Chế độ Agents (Multi-turn Agent)
  const [promptInput, setPromptInput] = useState('');
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [agentStep, setAgentStep] = useState<number>(0);
  const [currentRecipe, setCurrentRecipe] = useState<AISchematicRecipe | null>(null);
  const [agentTurns, setAgentTurns] = useState<AgentTurn[]>([]);
  const [expandedStepsMap, setExpandedStepsMap] = useState<Record<string, boolean>>({});
  const agentScrollRef = useRef<HTMLDivElement>(null);
  const [loadedRecipeId, setLoadedRecipeId] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States cho Chế độ Chat
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào! Tôi là **AI Circuit Mentor**.

Tôi luôn đồng bộ theo thời gian thực với sơ đồ mạch trên Canvas của bạn. Bạn có thể:
- Hỏi về **nguyên lý hoạt động** hoặc cách nối các chân.
- Yêu cầu **viết code Arduino C++** hoàn chỉnh để nạp vào mạch.
- **Kiểm tra an toàn điện áp**, tính toán điện trở hạn dòng LED.
- Xin **gợi ý linh kiện** để mở rộng tính năng cho dự án.`,
      timestamp: Date.now(),
    },
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // States cho Thư viện mẫu
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState('');

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const providerMeta = AI_PROVIDERS_CONFIG[aiSettings.provider] || AI_PROVIDERS_CONFIG['gemini'];
  const hasCustomKey = Boolean(aiSettings.apiKey?.trim() || aiSettings.provider === 'custom');

  // Cuộn xuống tin nhắn mới nhất trong Chat
  useEffect(() => {
    if (activeMode === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isLoadingChat, activeMode]);

  // Cuộn xuống lượt mới nhất trong Chế độ Agents
  useEffect(() => {
    if (activeMode === 'agents' && agentScrollRef.current) {
      agentScrollRef.current.scrollTop = agentScrollRef.current.scrollHeight;
    }
  }, [agentTurns, isLoadingAgent, activeMode]);

  // Thông tin tóm tắt mạch trên bàn vẽ
  const activeMcu = useMemo(() => {
    return components.find((c) => c.type.startsWith('arduino_') || c.type === 'esp32');
  }, [components]);

  // Xử lý thực thi Prompt trong Chế độ Agents (Multi-turn Agent)
  const handleExecuteAgent = async (overridePrompt?: string) => {
    const textToRun = (overridePrompt || promptInput).trim();
    if (!textToRun || isLoadingAgent) return;

    const turnId = `turn_${Date.now()}`;
    const newTurn: AgentTurn = {
      id: turnId,
      userPrompt: textToRun,
      timestamp: Date.now(),
      status: 'running',
    };

    setAgentTurns((prev) => [...prev, newTurn]);
    setPromptInput('');
    setIsLoadingAgent(true);
    setAppliedSuccess(false);
    setErrorMsg(null);
    setAgentStep(1);

    const stepTimer1 = setTimeout(() => setAgentStep(2), 450);
    const stepTimer2 = setTimeout(() => setAgentStep(3), 900);

    // Xác định mạch nền tảng (base circuit) cho lượt thực thi này
    let baseCircuit: { components: any[]; wires: any[]; title?: string } | undefined = undefined;
    if (currentRecipe && currentRecipe.components && currentRecipe.components.length > 0) {
      baseCircuit = currentRecipe;
    } else if (components && components.length > 0) {
      baseCircuit = {
        title: 'Mạch trên Canvas hiện tại',
        components: components.map((c) => ({
          id: c.id,
          type: c.type,
          name: c.name,
          x: c.x,
          y: c.y,
          properties: c.properties || c.attributes,
        })),
        wires: wires.map((w) => ({
          fromCompId: w.fromCompId,
          fromPinId: w.fromPinId,
          toCompId: w.toCompId,
          toPinId: w.toPinId,
          color: w.color,
        })),
      };
    }

    try {
      const recipe = await synthesizeCircuitFromPrompt(textToRun, aiSettings, baseCircuit);
      setCurrentRecipe(recipe);

      // Tự động nạp cập nhật mạch lên bàn vẽ (như Coding Agent tự apply code)
      onApplyRecipe(recipe);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 2200);

      setAgentTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                status: 'success',
                recipe,
                changeSummary:
                  recipe.changeSummary && recipe.changeSummary.length > 0
                    ? recipe.changeSummary
                    : ['+ Cập nhật sơ đồ mạch hoàn tất'],
              }
            : t
        )
      );
    } catch (e: any) {
      console.error(e);
      const errorText = e.message || 'Không thể tổng hợp mạch điện. Vui lòng kiểm tra lại API Key hoặc kết nối mạng!';
      setErrorMsg(errorText);
      setAgentTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                status: 'error',
                errorMessage: errorText,
              }
            : t
        )
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoadingAgent(false);
      setAgentStep(0);
    }
  };

  const handleNewAgentSession = () => {
    setAgentTurns([]);
    setCurrentRecipe(null);
    setErrorMsg(null);
  };

  const handleImportCanvasToAgent = () => {
    if (!components || components.length === 0) return;
    const mcu = components.find((c) => c.type.startsWith('arduino_') || c.type === 'esp32');
    const canvasRecipe: AISchematicRecipe = {
      id: `canvas_import_${Date.now()}`,
      title: 'Mạch nạp từ Canvas',
      category: 'Đang thiết kế',
      promptSample: 'Mạch hiện tại trên Canvas',
      description: `Mạch có ${components.length} linh kiện và ${wires.length} dây nối đang có trên bàn vẽ.`,
      components: components.map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name,
        x: c.x,
        y: c.y,
        properties: c.properties || c.attributes,
      })),
      wires: wires.map((w) => ({
        fromCompId: w.fromCompId,
        fromPinId: w.fromPinId,
        toCompId: w.toCompId,
        toPinId: w.toPinId,
        color: w.color,
      })),
      steps: ['Đã đồng bộ sơ đồ từ Canvas hiện tại.'],
      changeSummary: [`+ Nhận diện bo ${mcu?.name || 'MCU'}`, `+ Nạp ${components.length} linh kiện và ${wires.length} dây nối làm mạch gốc`],
    };
    setCurrentRecipe(canvasRecipe);
    const baselineTurn: AgentTurn = {
      id: `turn_init_${Date.now()}`,
      userPrompt: 'Đồng bộ từ bàn vẽ Canvas',
      timestamp: Date.now(),
      status: 'success',
      recipe: canvasRecipe,
      changeSummary: [`+ Nhận diện bo điều khiển: ${mcu?.name || 'Vi điều khiển'}`, `+ Nạp ${components.length} linh kiện & ${wires.length} dây nối làm mạch gốc`],
    };
    setAgentTurns([baselineTurn]);
  };

  const handleApplyCurrent = (recipeToApply?: AISchematicRecipe) => {
    const target = recipeToApply || currentRecipe;
    if (!target) return;
    onApplyRecipe(target);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2500);
  };

  // Xử lý gửi tin nhắn trong Chế độ Chat
  const handleSendChatMessage = async (presetQuestion?: string) => {
    const textToSend = (presetQuestion || chatInput).trim();
    if (!textToSend || isLoadingChat) return;

    const userMessage: AIChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const updatedHistory = [...chatMessages, userMessage];
    setChatMessages(updatedHistory);
    if (!presetQuestion) {
      setChatInput('');
    }
    setIsLoadingChat(true);

    try {
      const circuitContext = buildCircuitContextSummary(components, wires);
      const replyText = await askCircuitAIChat(updatedHistory, circuitContext, aiSettings);

      const assistantMessage: AIChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      console.error(e);
      const errorMessage: AIChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Lỗi kết nối AI:** ${e.message || 'Không thể nhận phản hồi từ mô hình. Vui lòng kiểm tra API Key hoặc mạng internet.'}`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: 'Cuộc trò chuyện đã được làm mới. Hãy đặt câu hỏi tiếp theo về mạch điện của bạn!',
        timestamp: Date.now(),
      },
    ]);
  };

  // Filter recipes for library
  const filteredRecipes = useMemo(() => {
    return PREBUILT_RECIPES.filter((recipe) => {
      const matchCat = selectedCategory === 'all' || recipe.category === selectedCategory;
      const term = librarySearch.trim().toLowerCase();
      const matchSearch =
        !term ||
        recipe.title.toLowerCase().includes(term) ||
        recipe.description.toLowerCase().includes(term) ||
        recipe.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, librarySearch]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    PREBUILT_RECIPES.forEach((r) => set.add(r.category));
    return ['all', ...Array.from(set)];
  }, []);

  const getRecipeMcu = (recipe: AISchematicRecipe) => {
    const hasMega = recipe.components.some((c) => c.type === 'arduino_mega');
    if (hasMega) {
      return {
        label: 'Mega 2560',
        model: 'Arduino Mega 2560',
        icon: Cpu,
        iconColor: 'text-indigo-400',
        badgeClass: 'badge-mega',
      };
    }
    const hasEsp32 = recipe.components.some((c) => c.type === 'esp32');
    if (hasEsp32) {
      return {
        label: 'ESP32',
        model: 'ESP32 DevKit V1',
        icon: Wifi,
        iconColor: 'text-emerald-400',
        badgeClass: 'badge-esp32',
      };
    }
    const hasNano = recipe.components.some((c) => c.type === 'arduino_nano');
    if (hasNano) {
      return {
        label: 'Nano V3',
        model: 'Arduino Nano V3',
        icon: Cpu,
        iconColor: 'text-blue-400',
        badgeClass: 'badge-nano',
      };
    }
    return {
      label: 'Uno R3',
      model: 'Arduino Uno R3',
      icon: Cpu,
      iconColor: 'text-sky-400',
      badgeClass: 'badge-uno',
    };
  };

  const handleApplyRecipeCard = (recipe: AISchematicRecipe) => {
    setCurrentRecipe(recipe);
    handleApplyCurrent(recipe);
    setLoadedRecipeId(recipe.id);
  };

  // Chat preset questions
  const chatQuickQuestions = [
    '📝 Viết code Arduino cho mạch này',
    '❓ Mạch này hoạt động như thế nào?',
    '⚡ Kiểm tra an toàn điện & điện áp',
    '💡 Gợi ý nâng cấp tính năng cho mạch',
  ];

  return (
    <div className="ai-assistant-container glass-panel">
      {/* 1. Header: AI Assistant Meta & Provider Badge */}
      <div className="ai-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="ai-icon-bubble">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-100 text-sm">
                AI Circuit Studio
              </h3>
              <span 
                className="badge-ai-model cursor-pointer hover:opacity-90 transition flex items-center gap-1"
                onClick={() => setShowSettingsModal(true)}
                title="Bấm để đổi nhà cung cấp AI & Model"
                style={{ 
                  backgroundColor: `${providerMeta.color}20`,
                  color: providerMeta.color,
                  borderColor: `${providerMeta.color}60`
                }}
              >
                <Radio className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate max-w-[110px]">{providerMeta.badge}: {aiSettings.model}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-slate-400 truncate">
                {activeMode === 'agents' ? 'Thực thi tạo mạch theo prompt' : 'Hỏi đáp & tìm hiểu về mạch'}
              </p>
              <span className={`ai-status-badge ${hasCustomKey ? 'live' : 'heuristic'}`}>
                {hasCustomKey ? (
                  <>
                    <Lock className="w-2.5 h-2.5" />
                    <span>Live AI</span>
                  </>
                ) : (
                  <span>○ Heuristic (Chưa có Key)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="btn-icon-settings"
          title="Cài đặt Nhà Cung Cấp AI & API Key (OpenAI, Gemini, Claude, DeepSeek, Kimi...)"
        >
          <Settings className="w-4 h-4 text-slate-300 hover:text-cyan-400 transition" />
        </button>
      </div>

      {/* 2. Mode Switcher: AGENTS vs THƯ VIỆN vs CHAT */}
      <div className="ai-mode-tabs">
        <button
          className={`ai-mode-tab-btn ${activeMode === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveMode('agents')}
          title="Chế độ Agents: Nhận lệnh prompt của người dùng để phân tích và tự động tạo sơ đồ mạch"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Agents (Thực thi)</span>
        </button>

        <button
          className={`ai-mode-tab-btn ${activeMode === 'library' ? 'active' : ''}`}
          onClick={() => setActiveMode('library')}
          title="Thư viện mạch mẫu kinh điển có sẵn"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span>Thư viện mẫu ({PREBUILT_RECIPES.length})</span>
        </button>

        <button
          className={`ai-mode-tab-btn ${activeMode === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveMode('chat')}
          title="Chế độ Chat: Trò chuyện, hỏi đáp nguyên lý, xin code Arduino C++ và tìm hiểu về mạch với AI"
        >
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span>Chat AI & Code</span>
        </button>
      </div>

      {/* Settings Modal Component */}
      <AISettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentSettings={aiSettings}
        onSaveSettings={onUpdateAISettings}
      />

      {/* Error alert if any */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: AGENTS - THỰC THI THIẾT KẾ MẠCH THEO PROMPT (MULTI-TURN AGENT)     */}
      {/* ========================================================================= */}
      {activeMode === 'agents' && (
        <div className="agent-thread-container">
          {/* Agent Session Header Bar */}
          <div className="agent-thread-header">
            <div className="agent-session-info">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {agentTurns.length === 0
                  ? 'Phiên Agent mới (Chưa có lệnh nào)'
                  : `Phiên Agent • ${agentTurns.length} lượt thực thi`}
              </span>
              {currentRecipe && (
                <span className="text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-mono">
                  {currentRecipe.components.length} linh kiện • {currentRecipe.wires.length} dây
                </span>
              )}
            </div>

            <div className="agent-header-actions">
              {components.length > 0 && agentTurns.length === 0 && (
                <button
                  onClick={handleImportCanvasToAgent}
                  className="agent-action-btn-sm"
                  title="Đồng bộ mạch đang có trên Canvas để Agent chỉnh sửa tiếp"
                >
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>Nạp từ Canvas</span>
                </button>
              )}
              {agentTurns.length > 0 && (
                <button
                  onClick={handleNewAgentSession}
                  className="agent-action-btn-sm"
                  title="Bắt đầu một phiên thiết kế Agent mới từ đầu"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Làm mới phiên</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Agent Thread */}
          <div ref={agentScrollRef} className="agent-thread-scroll">
            {/* If empty: Welcome & Instructions */}
            {agentTurns.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 shadow-xl my-auto animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 shadow-inner">
                  <Bot className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-100 tracking-tight">
                  AI Circuit Coding Agent
                </h4>
                <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                  Nhập một prompt để khởi tạo mạch mới, sau đó tiếp tục ra lệnh để <strong>chỉnh sửa, thêm linh kiện, bớt linh kiện, đổi chân pin hoặc đổi bo MCU</strong> tương tự như AI Agent trong IDE.
                </p>
                <div className="mt-4 px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Mẹo: Bạn có thể nhập bất kỳ yêu cầu phần cứng nào bên dưới</span>
                </div>
              </div>
            )}

            {/* List of Turns */}
            {agentTurns.map((turn, tIdx) => (
              <div key={turn.id} className="agent-turn-wrapper">
                {/* 1. User Prompt bubble */}
                <div className="agent-turn-user">
                  <span className="agent-turn-num">#{tIdx + 1}</span>
                  <span className="agent-turn-prompt-text">{turn.userPrompt}</span>
                </div>

                {/* 2. Agent Response & Action Card */}
                <div className="agent-turn-card">
                  {/* Card Top: Status & Title */}
                  <div className="agent-turn-status-bar">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {turn.status === 'running'
                          ? 'Agent đang phân tích & định tuyến...'
                          : (turn.recipe?.title || 'Phản hồi từ Agent')}
                      </span>
                    </div>

                    <span className={`agent-turn-badge ${turn.status}`}>
                      {turn.status === 'running' && <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />}
                      {turn.status === 'success' && <Check className="w-3 h-3 text-emerald-400" />}
                      {turn.status === 'error' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                      <span>
                        {turn.status === 'running'
                          ? 'Đang chạy...'
                          : (turn.status === 'success' ? 'Hoàn thành' : 'Lỗi')}
                      </span>
                    </span>
                  </div>

                  {/* If Running: Live Timeline */}
                  {turn.status === 'running' && (
                    <div className="flex flex-col gap-1.5 pl-2 text-[11px] text-slate-300 py-1">
                      <div className={`flex items-center gap-2 transition-colors ${agentStep >= 1 ? 'text-amber-300 font-semibold' : 'text-slate-500'}`}>
                        <span>{agentStep > 1 ? '✓' : '①'}</span>
                        <span>Đối chiếu mạch gốc & phân tích yêu cầu delta</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${agentStep >= 2 ? 'text-amber-300 font-semibold' : 'text-slate-500'}`}>
                        <span>{agentStep > 2 ? '✓' : '②'}</span>
                        <span>Bổ sung / điều chỉnh / loại bỏ linh kiện & tính điện trở</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-colors ${agentStep >= 3 ? 'text-amber-300 font-semibold' : 'text-slate-500'}`}>
                        <span>{agentStep > 3 ? '✓' : '③'}</span>
                        <span>Định tuyến lại dây nối và tự động áp dụng lên bàn vẽ</span>
                      </div>
                    </div>
                  )}

                  {/* If Error */}
                  {turn.status === 'error' && (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                      {turn.errorMessage}
                    </div>
                  )}

                  {/* If Success: Change Summary Diff list */}
                  {turn.status === 'success' && turn.changeSummary && turn.changeSummary.length > 0 && (
                    <div className="agent-diff-list">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                        Thực thi thay đổi:
                      </div>
                      {turn.changeSummary.map((diff, dIdx) => {
                        const isAdd = diff.startsWith('+');
                        const isRemove = diff.startsWith('-');
                        const isMod = diff.startsWith('~');
                        const diffType = isAdd ? 'add' : (isRemove ? 'remove' : (isMod ? 'modify' : 'info'));
                        return (
                          <div key={dIdx} className={`agent-diff-item ${diffType}`}>
                            <span className="agent-diff-symbol">{isAdd ? '+' : (isRemove ? '−' : (isMod ? '~' : '•'))}</span>
                            <span>{diff.replace(/^[+\-~•]\s*/, '')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* If Success: Current Circuit Snapshot */}
                  {turn.status === 'success' && turn.recipe && (
                    <div className="agent-snapshot-box">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Mạch hiện tại ({turn.recipe.components.length} linh kiện • {turn.recipe.wires.length} dây)</span>
                        </div>
                        <button
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                          onClick={() => setExpandedStepsMap((prev) => ({ ...prev, [turn.id]: !prev[turn.id] }))}
                        >
                          <span>{expandedStepsMap[turn.id] ? 'Thu gọn' : 'Xem chi tiết dây'}</span>
                          {expandedStepsMap[turn.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {turn.recipe.components.map((c) => (
                          <span key={c.id} className="comp-tag text-[10.5px]">
                            {c.name}
                          </span>
                        ))}
                      </div>

                      {expandedStepsMap[turn.id] && (
                        <div className="mt-2 flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                          {turn.recipe.steps.map((st, sIdx) => (
                            <div key={sIdx} className="recipe-step-item text-[11px]">
                              <span className="step-num text-[9px]">{sIdx + 1}</span>
                              <span className="text-slate-300">{st}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Turn Footer Actions */}
                  {turn.status === 'success' && turn.recipe && (
                    <div className="agent-turn-footer">
                      <button
                        onClick={() => {
                          setActiveMode('chat');
                          handleSendChatMessage('Viết mã nguồn Arduino C++ đầy đủ điều khiển cho mạch này');
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-1.5 transition cursor-pointer"
                        title="Chuyển sang Chat để nhận mã Arduino C++ cho mạch này"
                      >
                        <Code className="w-3 h-3" />
                        <span>Xem Code Arduino C++</span>
                      </button>

                      <button
                        onClick={() => handleApplyCurrent(turn.recipe)}
                        className={`agent-btn-apply ${appliedSuccess ? 'applied' : ''}`}
                      >
                        {appliedSuccess ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Đã nạp lên Canvas!</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 fill-current" />
                            <span>Nạp lại lên Canvas</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Bottom Agent Input Bar */}
          <div className="p-3 bg-slate-950/80 backdrop-blur border-t border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all shadow-lg">
              <Zap className="w-4 h-4 text-amber-400 ml-2 shrink-0" />
              <input
                type="text"
                placeholder={
                  agentTurns.length === 0
                    ? 'Nhập yêu cầu mạch (vd: Tạo mạch đèn giao thông với Arduino Uno...)'
                    : 'Nhập lệnh sửa đổi tiếp (vd: Thêm còi buzzer ở D12, đổi sang ESP32, gỡ LED vàng...)'
                }
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleExecuteAgent();
                  }
                }}
                className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder-slate-500 focus:outline-none px-2 py-1"
                disabled={isLoadingAgent}
              />
              <Button
                onClick={() => handleExecuteAgent()}
                disabled={isLoadingAgent || !promptInput.trim()}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3 py-1 h-8 rounded-lg shadow-md transition-all shrink-0"
              >
                {isLoadingAgent ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span className="text-xs">Chạy Agent</span>
                    <Send className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: CHAT - HỎI ĐÁP, GIẢI THÍCH NGUYÊN LÝ & XIN CODE VỚI AI           */}
      {/* ========================================================================= */}
      {activeMode === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0 gap-2.5">
          {/* Canvas Live Context Pill */}
          <div className="chat-context-bar">
            <div className="flex items-center gap-1.5 min-w-0 text-slate-300">
              <span className="live-pulse-dot-sm" />
              <span className="chat-context-mcu truncate">
                Mạch: {activeMcu ? activeMcu.name : 'Chưa có MCU'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 truncate text-[11px]">
                {components.length} linh kiện, {wires.length} dây
              </span>
            </div>
            <button
              onClick={handleClearChat}
              className="chat-clear-btn"
              title="Xóa lịch sử chat và bắt đầu phiên mới"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick preset questions */}
          <div className="chat-preset-bar">
            {chatQuickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChatMessage(q)}
                disabled={isLoadingChat}
                className="chat-preset-btn"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Scroll View */}
          <div 
            ref={chatScrollRef}
            className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1 py-1"
          >
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                  )}

                  <div className={isUser ? 'chat-msg-user' : 'chat-msg-assistant'}>
                    {isUser ? (
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    ) : (
                      <FormattedChatMessage content={msg.content} />
                    )}
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        isUser ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-cyan-300">U</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Streaming Indicator */}
            {isLoadingChat && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </div>
                <div className="chat-msg-assistant flex items-center gap-2 text-slate-300">
                  <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="animate-pulse">AI đang phân tích mạch và soạn câu trả lời...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Hỏi AI về linh kiện, viết code, giải thích mạch..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              disabled={isLoadingChat}
              className="chat-input-field"
            />
            <button
              onClick={() => handleSendChatMessage()}
              disabled={isLoadingChat || !chatInput.trim()}
              className="chat-send-btn"
              title="Gửi câu hỏi"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: THƯ VIỆN MẠCH MẪU (CHUẨN SHADCN & MODERN DARK DESIGN)              */}
      {/* ========================================================================= */}
      {activeMode === 'library' && (
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden pr-0.5">
          {/* Search bar */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Tìm mạch mẫu (esp32, siêu âm, rơ-le, oled...)..."
              className="bg-slate-900/80 border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 pl-9 pr-8 h-9 rounded-xl focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50"
            />
            {librarySearch && (
              <button
                onClick={() => setLibrarySearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 transition"
                title="Xoá tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all shrink-0 border ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả' : cat}
                </button>
              );
            })}
          </div>

          {/* Results Count Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5 shrink-0">
            <span>{filteredRecipes.length} mạch mẫu có sẵn</span>
            <span className="text-[10px] text-slate-500">Nhấp để nạp thẳng lên Canvas</span>
          </div>

          {/* Scrollable Component List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
            {filteredRecipes.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-400 my-auto">
                <p className="text-sm font-medium text-slate-300">Không tìm thấy mạch mẫu</p>
                <p className="text-xs text-slate-500 mt-1">
                  Thử tìm kiếm với từ khóa khác như "esp32", "siêu âm", "giao thông", "servo"...
                </p>
              </div>
            ) : (
              filteredRecipes.map((recipe) => {
                const mcu = getRecipeMcu(recipe);
                const Icon = mcu.icon;
                const isLoaded = loadedRecipeId === recipe.id && appliedSuccess;

                return (
                  <Card
                    key={recipe.id}
                    onClick={() => handleApplyRecipeCard(recipe)}
                    className={`group bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-cyan-950/20 p-3 rounded-xl relative overflow-hidden ${
                      isLoaded ? 'border-emerald-500/50 bg-emerald-950/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <Icon className={`w-4 h-4 ${mcu.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                            {recipe.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                            <span className="font-medium text-slate-300">{mcu.model}</span>
                            <span>•</span>
                            <span className="text-slate-400">{recipe.category}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-slate-700/60 bg-slate-800/40 text-slate-300 shrink-0 font-normal"
                      >
                        {recipe.components.length} linh kiện
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {recipe.wires.length} dây nối
                      </span>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyRecipeCard(recipe);
                        }}
                        className={`h-7 px-2.5 text-xs rounded-lg transition-all ${
                          isLoaded
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {isLoaded ? (
                          <>
                            <Check className="w-3 h-3 mr-1 text-emerald-400" />
                            <span>Đã nạp</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            <span>Nạp vào Canvas</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
