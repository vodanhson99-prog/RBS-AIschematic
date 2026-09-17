import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Key, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { UserAISettings, AIProvider } from '../../types/circuit';
import { 
  AI_PROVIDERS_CONFIG, 
  testAIConnection, 
  saveStoredAISettings 
} from '../../services/aiEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: UserAISettings;
  onSaveSettings: (settings: UserAISettings) => void;
}

export const AISettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings,
}) => {
  const [settings, setSettings] = useState<UserAISettings>(currentSettings);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelInput, setCustomModelInput] = useState('');

  // Sync state when modal opens or currentSettings changes
  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
      setTestResult(null);
      const meta = AI_PROVIDERS_CONFIG[currentSettings.provider];
      const isPreset = meta?.models.includes(currentSettings.model);
      setIsCustomModel(!isPreset);
      setCustomModelInput(!isPreset ? currentSettings.model : '');
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const currentProviderMeta = AI_PROVIDERS_CONFIG[settings.provider] || AI_PROVIDERS_CONFIG['gemini'];

  const handleProviderChange = (providerId: AIProvider) => {
    const meta = AI_PROVIDERS_CONFIG[providerId];
    setSettings(prev => ({
      ...prev,
      provider: providerId,
      model: meta.defaultModel,
      customBaseUrl: meta.defaultBaseUrl || '',
    }));
    setIsCustomModel(false);
    setCustomModelInput('');
    setTestResult(null);
  };

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomModel(true);
    } else {
      setIsCustomModel(false);
      setSettings(prev => ({ ...prev, model: val }));
    }
    setTestResult(null);
  };

  const handleCustomModelChange = (val: string) => {
    setCustomModelInput(val);
    setSettings(prev => ({ ...prev, model: val.trim() }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const activeSettings: UserAISettings = {
        ...settings,
        model: isCustomModel ? customModelInput.trim() : settings.model,
      };
      const result = await testAIConnection(activeSettings);
      setTestResult({
        tested: true,
        success: result.success,
        message: result.message,
        latencyMs: result.latencyMs,
      });
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Lỗi không xác định khi kết nối',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const finalSettings: UserAISettings = {
      ...settings,
      model: isCustomModel && customModelInput.trim() ? customModelInput.trim() : settings.model,
    };
    saveStoredAISettings(finalSettings);
    onSaveSettings(finalSettings);
    onClose();
  };

  const handleReset = () => {
    const meta = AI_PROVIDERS_CONFIG['gemini'];
    const defaultSet: UserAISettings = {
      provider: 'gemini',
      apiKey: '',
      model: meta.defaultModel,
      customBaseUrl: '',
    };
    setSettings(defaultSet);
    setIsCustomModel(false);
    setCustomModelInput('');
    setTestResult(null);
  };

  const modalNode = (
    <div 
      className="ai-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ai-modal-card">
        {/* Modal Header */}
        <div className="ai-modal-header">
          <div className="ai-modal-header-left">
            <div className="ai-modal-icon-badge">
              <Sparkles style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h3 className="ai-modal-title">
                Cài Đặt Nhà Cung Cấp AI & API Key
              </h3>
              <p className="ai-modal-subtitle">
                Tự do kết nối các mô hình AI hàng đầu: OpenAI, Anthropic, Gemini, DeepSeek, Kimi...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ai-modal-close-btn"
            title="Đóng cửa sổ"
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="ai-modal-body">
          
          {/* Section 1: Provider Selection Grid */}
          <div>
            <div className="ai-section-label">
              <span>1. Chọn Nhà Cung Cấp AI</span>
              <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
                Hỗ trợ 6 nhóm dịch vụ
              </span>
            </div>
            <div className="ai-provider-grid">
              {(Object.keys(AI_PROVIDERS_CONFIG) as AIProvider[]).map((pKey) => {
                const meta = AI_PROVIDERS_CONFIG[pKey];
                const isSelected = settings.provider === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => handleProviderChange(pKey)}
                    className={`ai-provider-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="ai-provider-card-top">
                      <span 
                        className="ai-provider-badge"
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.badge}
                      </span>
                      {isSelected && (
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#06b6d4',
                          boxShadow: '0 0 8px #06b6d4'
                        }} />
                      )}
                    </div>
                    <div className="ai-provider-name" title={meta.name}>
                      {meta.name.split(' (')[0]}
                    </div>
                    <div className="ai-provider-model">
                      {meta.defaultModel}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="ai-provider-desc">
              💡 {currentProviderMeta.description}
            </p>
          </div>

          {/* Section 2: Model Picker */}
          <div>
            <div className="ai-section-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu style={{ width: 14, height: 14, color: '#06b6d4' }} />
                2. Chọn Mô Hình (Model)
              </span>
              {currentProviderMeta.docUrl && (
                <a
                  href={currentProviderMeta.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 11,
                    color: '#38bdf8',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  Lấy API Key {currentProviderMeta.badge} <ExternalLink style={{ width: 11, height: 11 }} />
                </a>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isCustomModel ? '1fr 1fr' : '1fr', gap: 10 }}>
              <div>
                <select
                  value={isCustomModel ? '__custom__' : settings.model}
                  onChange={handleModelSelect}
                  className="ai-modal-select"
                >
                  {currentProviderMeta.models.map((m) => (
                    <option key={m} value={m}>
                      {m} {m === currentProviderMeta.defaultModel ? '(Khuyên dùng)' : ''}
                    </option>
                  ))}
                  <option value="__custom__">⚙️ Tự gõ tên Model khác...</option>
                </select>
              </div>

              {isCustomModel && (
                <div>
                  <input
                    type="text"
                    placeholder="VD: deepseek-ai/DeepSeek-V3..."
                    value={customModelInput}
                    onChange={(e) => handleCustomModelChange(e.target.value)}
                    className="ai-modal-input"
                    style={{ borderColor: '#06b6d4' }}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: API Key Input */}
          <div>
            <div className="ai-section-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Key style={{ width: 14, height: 14, color: '#f59e0b' }} />
                3. API Key {settings.provider === 'custom' ? '(Tùy chọn nếu Local)' : ''}
              </span>
            </div>
            <div className="ai-key-input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder={`Nhập ${currentProviderMeta.name} API Key (${currentProviderMeta.keyPlaceholder})`}
                value={settings.apiKey}
                onChange={(e) => {
                  setSettings(prev => ({ ...prev, apiKey: e.target.value.trim() }));
                  setTestResult(null);
                }}
                className="ai-key-input"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="ai-key-eye-btn"
                title={showKey ? 'Ẩn khóa' : 'Hiện khóa'}
              >
                {showKey ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11.5, color: '#94a3b8' }}>
              <ShieldCheck style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0 }} />
              <span>Khóa API được mã hóa lưu trữ trong LocalStorage trình duyệt của bạn, gọi trực tiếp từ client không qua server.</span>
            </div>
          </div>

          {/* Section 4: Custom Base URL */}
          <div>
            <div className="ai-section-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe style={{ width: 14, height: 14, color: '#818cf8' }} />
                4. API Base URL (Proxy / Local Ollama / Cổng Custom)
              </span>
            </div>
            <input
              type="text"
              placeholder={currentProviderMeta.defaultBaseUrl || 'https://api.openai.com/v1'}
              value={settings.customBaseUrl || ''}
              onChange={(e) => {
                setSettings(prev => ({ ...prev, customBaseUrl: e.target.value.trim() }));
                setTestResult(null);
              }}
              className="ai-modal-input"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
              Mặc định: {currentProviderMeta.defaultBaseUrl || 'REST API chính thức'}. Để trống để dùng endpoint mặc định.
            </span>
          </div>

          {/* Section 5: Connection Test Result Banner */}
          {testResult && testResult.tested && (
            <div className={`ai-test-banner ${testResult.success ? 'success' : 'error'}`}>
              {testResult.success ? (
                <CheckCircle2 style={{ width: 16, height: 16, color: '#34d399', flexShrink: 0, marginTop: 1 }} />
              ) : (
                <AlertCircle style={{ width: 16, height: 16, color: '#fb7185', flexShrink: 0, marginTop: 1 }} />
              )}
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: 2 }}>
                  {testResult.success ? 'Kết nối thành công!' : 'Kết nối thất bại'}
                </strong>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="ai-modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="ai-btn-secondary"
            >
              <RefreshCw className={isTesting ? 'animate-spin' : ''} style={{ width: 13, height: 13, color: '#38bdf8' }} />
              <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="ai-btn-ghost"
            >
              Mặc định
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="ai-btn-ghost"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="ai-btn-primary"
            >
              <Check style={{ width: 14, height: 14 }} />
              <span>Lưu cấu hình</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};
