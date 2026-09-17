import React, { useState } from 'react';
import { Sparkles, Bot, ArrowRight, Settings, Check, HelpCircle, Layers } from 'lucide-react';
import type { AISchematicRecipe } from '../../types/circuit';
import { synthesizeCircuitFromPrompt } from '../../services/aiEngine';

interface Props {
  onApplyRecipe: (recipe: AISchematicRecipe) => void;
  apiKey: string;
  onUpdateApiKey: (key: string) => void;
}

export const AICircuitAssistant: React.FC<Props> = ({
  onApplyRecipe,
  apiKey,
  onUpdateApiKey,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<AISchematicRecipe | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Handle prompt submit
  const handleGenerate = async (queryText?: string) => {
    const text = queryText || promptInput;
    if (!text.trim()) return;

    setIsLoading(true);
    setAppliedSuccess(false);

    try {
      const recipe = await synthesizeCircuitFromPrompt(text, apiKey);
      setCurrentRecipe(recipe);
    } catch (e) {
      console.error(e);
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
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-100 text-sm">
                AI Circuit Assistant
              </h3>
              <span className="badge-ai-model">Gemini Engine</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Tạo sơ đồ nối chân tự động theo prompt</p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn-icon-settings"
          title="Cài đặt API Key AI"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Settings Modal Bar (if opened) */}
      {showSettings && (
        <div className="ai-settings-banner">
          <div className="flex justify-between items-center mb-1.5 flex-wrap gap-1">
            <span className="text-xs font-semibold text-slate-200">Cấu hình API Key (Tuỳ chọn)</span>
            <span className="text-[10px] text-emerald-400 font-medium">Engine tích hợp sẵn</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Nhập Gemini API Key hoặc OpenAI API Key..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="ai-api-input"
            />
            <button
              onClick={() => {
                onUpdateApiKey(tempApiKey);
                setShowSettings(false);
              }}
              className="ai-api-save-btn"
            >
              Lưu
            </button>
          </div>
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
              <span className="text-xs font-bold animate-pulse">⚡ Tạo...</span>
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
