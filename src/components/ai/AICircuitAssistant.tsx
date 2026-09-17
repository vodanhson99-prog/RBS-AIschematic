import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Settings, 
  Check, 
  HelpCircle, 
  Layers, 
  AlertCircle,
  Radio,
  Lock
} from 'lucide-react';
import type { AISchematicRecipe, UserAISettings } from '../../types/circuit';
import { synthesizeCircuitFromPrompt, AI_PROVIDERS_CONFIG } from '../../services/aiEngine';
import { AISettingsModal } from './AISettingsModal';

interface Props {
  onApplyRecipe: (recipe: AISchematicRecipe) => void;
  aiSettings: UserAISettings;
  onUpdateAISettings: (settings: UserAISettings) => void;
}

export const AICircuitAssistant: React.FC<Props> = ({
  onApplyRecipe,
  aiSettings,
  onUpdateAISettings,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<AISchematicRecipe | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const providerMeta = AI_PROVIDERS_CONFIG[aiSettings.provider] || AI_PROVIDERS_CONFIG['gemini'];
  const hasCustomKey = Boolean(aiSettings.apiKey?.trim() || aiSettings.provider === 'custom');

  // Handle prompt submit
  const handleGenerate = async (queryText?: string) => {
    const text = queryText || promptInput;
    if (!text.trim()) return;

    setIsLoading(true);
    setAppliedSuccess(false);
    setErrorMsg(null);

    try {
      const recipe = await synthesizeCircuitFromPrompt(text, aiSettings);
      setCurrentRecipe(recipe);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Không thể tổng hợp mạch điện. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!currentRecipe) return;
    onApplyRecipe(currentRecipe);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 2500);
  };

  return (
    <div className="ai-assistant-container glass-panel">
      {/* Assistant Header */}
      <div className="ai-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="ai-icon-bubble">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-100 text-sm">
                AI Circuit Assistant
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
                <span className="truncate max-w-[120px]">{providerMeta.badge}: {aiSettings.model}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-slate-400 truncate">Tự động nối chân theo prompt</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                hasCustomKey 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {hasCustomKey ? (
                  <>
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Live API ({aiSettings.storageMode === 'session' ? 'Session' : 'Mã hóa'})</span>
                  </>
                ) : (
                  <span>○ Heuristic</span>
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

      {/* Settings Modal Component */}
      <AISettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentSettings={aiSettings}
        onSaveSettings={onUpdateAISettings}
      />

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mx-3 mt-2 p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      {/* Prompt Input Form */}
      <div className="ai-prompt-box">
        <div className="prompt-input-wrapper">
          <Bot className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Ví dụ: Mạch đèn giao thông 3 màu với Arduino Uno..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="ai-text-input"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !promptInput.trim()}
            className="btn-ai-generate"
          >
            {isLoading ? (
              <span className="text-xs font-bold animate-pulse">⚡ Đang xử lý...</span>
            ) : (
              <>
                <span>Tạo sơ đồ</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="ai-chips-list">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <HelpCircle className="w-3 h-3 shrink-0" /> Gợi ý:
          </span>
          {[
            { id: 'traffic_light', label: '🚦 Đèn giao thông', query: 'Mạch đèn giao thông 3 màu với Arduino Uno' },
            { id: 'ultrasonic_alarm', label: '📡 Đo khoảng cách', query: 'Mạch đo khoảng cách dùng cảm biến siêu âm HC-SR04 và còi Buzzer' },
            { id: 'pushbutton_led', label: '🔘 Nút bấm LED', query: 'Mạch nút nhấn điều khiển bật tắt đèn LED với Arduino Uno' },
            { id: 'servo_potentiometer', label: '⚙️ Servo & Biến trở', query: 'Điều khiển góc quay Servo SG90 bằng chiết áp biến trở' },
            { id: 'pir_motion_alarm', label: '🚨 Báo trộm PIR', query: 'Hệ thống báo động chống trộm cảm biến chuyển động PIR và còi' },
            { id: 'smart_street_light', label: '💡 Đèn thông minh LDR', query: 'Mạch đèn đường thông minh tự động bật sáng khi trời tối với quang trở LDR' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPromptInput(item.query);
                handleGenerate(item.query);
              }}
              className="ai-chip-btn"
              title={item.query}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Generated Recipe Result View */}
      {currentRecipe && (
        <div className="ai-recipe-result animate-fade-in">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h4 className="recipe-title">{currentRecipe.title}</h4>
              <p className="recipe-desc">{currentRecipe.description}</p>
            </div>
            <span className="recipe-badge">{currentRecipe.category}</span>
          </div>

          {/* Components summary */}
          <div className="recipe-components-box">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Linh kiện cần dùng ({currentRecipe.components.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentRecipe.components.map((c) => (
                <span key={c.id} className="comp-tag">
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* Wiring Instructions */}
          <div className="recipe-steps-box">
            <div className="text-xs font-semibold text-slate-300 mb-1.5">
              Sơ đồ nối chân ({currentRecipe.wires.length} dây):
            </div>
            <div className="recipe-steps-scroll">
              {currentRecipe.steps.map((step, idx) => (
                <div key={idx} className="recipe-step-item">
                  <span className="step-num">{idx + 1}</span>
                  <span className="text-xs text-slate-200" style={{ wordBreak: 'break-word', lineHeight: 1.4 }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action button: Apply to Canvas */}
          <button
            onClick={handleApply}
            className={`btn-apply-canvas ${appliedSuccess ? 'applied' : ''}`}
          >
            {appliedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Đã áp dụng vào Canvas thành công!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Áp dụng vào Canvas (Auto-Wire)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
