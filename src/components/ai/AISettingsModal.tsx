import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Lock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  HardDrive,
  Cpu as RamIcon,
  AlertTriangle,
  Info
} from 'lucide-react';
import type { UserAISettings, AIProvider, KeyStorageMode } from '../../types/circuit';
import { 
  AI_PROVIDERS_CONFIG, 
  testAIConnection, 
  saveStoredAISettings 
} from '../../services/aiEngine';
import { 
  maskApiKey, 
  validateApiKeyFormat, 
  clearAllStoredAISettings 
} from '../../services/securityService';

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
  const [autoHideCountdown, setAutoHideCountdown] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelInput, setCustomModelInput] = useState('');
  const [showSecurityGuide, setShowSecurityGuide] = useState(false);
  const [wipeNotice, setWipeNotice] = useState<string | null>(null);

  const countdownTimerRef = useRef<any>(null);

  // Sync state when modal opens or currentSettings changes
  useEffect(() => {
    if (isOpen) {
      setSettings({
        ...currentSettings,
        storageMode: currentSettings.storageMode || 'session',
      });
      setTestResult(null);
      setWipeNotice(null);
      setShowKey(false);
      setAutoHideCountdown(0);
      const meta = AI_PROVIDERS_CONFIG[currentSettings.provider];
      const isPreset = meta?.models.includes(currentSettings.model);
      setIsCustomModel(!isPreset);
      setCustomModelInput(!isPreset ? currentSettings.model : '');
    }
  }, [isOpen, currentSettings]);

  // Bộ đếm ngược tự động ẩn API key sau 15s để chống nhìn trộm (shoulder-surfing)
  useEffect(() => {
    if (showKey) {
      setAutoHideCountdown(15);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setAutoHideCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            setShowKey(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setAutoHideCountdown(0);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [showKey]);

  if (!isOpen) return null;

  const currentProviderMeta = AI_PROVIDERS_CONFIG[settings.provider] || AI_PROVIDERS_CONFIG['gemini'];
  const validation = validateApiKeyFormat(settings.provider, settings.apiKey);

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

  const handleStorageModeChange = (mode: KeyStorageMode) => {
    setSettings(prev => ({ ...prev, storageMode: mode }));
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

  const handleEmergencyWipe = () => {
    if (window.confirm('Bạn có chắc muốn XÓA SẠCH toàn bộ API Key và dữ liệu mã hóa khỏi trình duyệt này ngay lập tức?')) {
      clearAllStoredAISettings();
      const wipedSettings: UserAISettings = {
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-1.5-flash',
        customBaseUrl: '',
        storageMode: 'session',
      };
      setSettings(wipedSettings);
      onSaveSettings(wipedSettings);
      setTestResult(null);
      setWipeNotice('Đã xóa sạch mọi dữ liệu API Key khỏi trình duyệt!');
      setTimeout(() => setWipeNotice(null), 4000);
    }
  };

  const handleReset = () => {
    const meta = AI_PROVIDERS_CONFIG['gemini'];
    const defaultSet: UserAISettings = {
      provider: 'gemini',
      apiKey: '',
      model: meta.defaultModel,
      customBaseUrl: '',
      storageMode: 'session',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 className="ai-modal-title">
                  Cài Đặt Nhà Cung Cấp AI & Bảo Mật API
                </h3>
                <span style={{ 
                  fontSize: 10.5, 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  color: '#34d399', 
                  padding: '2px 8px', 
                  borderRadius: 9999, 
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <ShieldCheck style={{ width: 12, height: 12 }} />
                  Zero-Server Direct TLS
                </span>
              </div>
              <p className="ai-modal-subtitle">
                Kết nối trực tiếp client-side tới Google Gemini, OpenAI, Claude, DeepSeek, Kimi... Không lưu key qua máy chủ trung gian.
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
          
          {/* Wipe Notice Alert */}
          {wipeNotice && (
            <div className="ai-test-banner success" style={{ marginBottom: 4 }}>
              <CheckCircle2 style={{ width: 16, height: 16, color: '#34d399', flexShrink: 0 }} />
              <span>{wipeNotice}</span>
            </div>
          )}

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

          {/* Section 3: API Key Input with Live Masking & Shoulder-Surfing Guard */}
          <div>
            <div className="ai-section-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Key style={{ width: 14, height: 14, color: '#f59e0b' }} />
                3. API Key {settings.provider === 'custom' ? '(Tùy chọn nếu Local)' : ''}
              </span>
              {settings.apiKey && (
                <span className="ai-key-masked-badge">
                  <Lock style={{ width: 11, height: 11, color: '#38bdf8' }} />
                  {maskApiKey(settings.apiKey)}
                </span>
              )}
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
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="ai-key-eye-btn"
                title={showKey ? 'Ẩn khóa ngay' : 'Hiện khóa (tự ẩn sau 15 giây)'}
              >
                {showKey ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#f59e0b' }}>
                    <EyeOff style={{ width: 15, height: 15 }} />
                    {autoHideCountdown > 0 ? `${autoHideCountdown}s` : ''}
                  </span>
                ) : (
                  <Eye style={{ width: 16, height: 16 }} />
                )}
              </button>
            </div>

            {/* Live Format Validation Warning */}
            {validation.warning && (
              <div className="ai-format-warning">
                <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>{validation.warning}</span>
              </div>
            )}
          </div>

          {/* Section 4: Security Storage Mode */}
          <div>
            <div className="ai-section-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock style={{ width: 14, height: 14, color: '#10b981' }} />
                4. Chế Độ Lưu Trữ Khóa (Storage Security Mode)
              </span>
            </div>

            <div className="ai-storage-grid">
              {/* Option A: Session Only */}
              <div 
                className={`ai-storage-card ${settings.storageMode === 'session' ? 'selected' : ''}`}
                onClick={() => handleStorageModeChange('session')}
              >
                <div className="ai-storage-card-header">
                  <span className="ai-storage-title">
                    <Clock style={{ width: 14, height: 14, color: '#38bdf8' }} />
                    Session Only
                  </span>
                  <span className="ai-storage-badge">Khuyên Dùng</span>
                </div>
                <p className="ai-storage-desc">
                  Chỉ lưu trong phiên hiện tại. <strong>Tự động biến mất khi đóng tab</strong>. An toàn tuyệt đối trên máy mượn hoặc phòng học.
                </p>
              </div>

              {/* Option B: Local Encrypted */}
              <div 
                className={`ai-storage-card ${settings.storageMode === 'local' ? 'selected' : ''}`}
                onClick={() => handleStorageModeChange('local')}
              >
                <div className="ai-storage-card-header">
                  <span className="ai-storage-title">
                    <HardDrive style={{ width: 14, height: 14, color: '#a855f7' }} />
                    Mã Hóa Trên Máy
                  </span>
                </div>
                <p className="ai-storage-desc">
                  Mã hóa <strong>AES-GCM 256-bit</strong> trong LocalStorage máy này. Tiện lợi không cần nhập lại khi mở lại web.
                </p>
              </div>

              {/* Option C: Memory Only */}
              <div 
                className={`ai-storage-card ${settings.storageMode === 'memory' ? 'selected' : ''}`}
                onClick={() => handleStorageModeChange('memory')}
              >
                <div className="ai-storage-card-header">
                  <span className="ai-storage-title">
                    <RamIcon style={{ width: 14, height: 14, color: '#f59e0b' }} />
                    Chỉ Trong RAM
                  </span>
                </div>
                <p className="ai-storage-desc">
                  Hoàn toàn <strong>không ghi vào bộ nhớ trình duyệt</strong>. Khi reload hoặc đổi trang sẽ xóa sạch lập tức.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Custom Base URL */}
          <div>
            <div className="ai-section-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe style={{ width: 14, height: 14, color: '#818cf8' }} />
                5. API Base URL (Proxy / Local Ollama / Cổng Custom)
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

          {/* Section 6: Security Architectural Explainer (Accordion) */}
          <div className="ai-security-guide">
            <div 
              className="ai-security-guide-header"
              onClick={() => setShowSecurityGuide(!showSecurityGuide)}
            >
              <div className="ai-security-guide-title">
                <ShieldCheck style={{ width: 16, height: 16, color: '#10b981' }} />
                <span>Kiến trúc bảo mật API 4 tầng của AI Circuit Studio</span>
              </div>
              {showSecurityGuide ? (
                <ChevronUp style={{ width: 16, height: 16, color: '#94a3b8' }} />
              ) : (
                <ChevronDown style={{ width: 16, height: 16, color: '#94a3b8' }} />
              )}
            </div>

            {showSecurityGuide && (
              <div className="ai-security-guide-content">
                <div className="ai-security-item">
                  <CheckCircle2 style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>1. Trực tiếp Client-to-API (Zero Proxy)</strong>
                    Toàn bộ request gửi trực tiếp từ trình duyệt bạn tới máy chủ của Google / OpenAI / Anthropic qua kênh mã hóa TLS/HTTPS. Không có server trung gian nào thu thập key.
                  </div>
                </div>

                <div className="ai-security-item">
                  <CheckCircle2 style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>2. Xác thực bằng HTTP Header</strong>
                    Truyền key độc quyền qua HTTP Header chuẩn (<code>x-goog-api-key</code>, <code>Authorization: Bearer</code>). Tuyệt đối không gắn key lên URL query để tránh lộ trong browser logs/proxy.
                  </div>
                </div>

                <div className="ai-security-item">
                  <CheckCircle2 style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>3. Mã hóa phần cứng Web Crypto (AES-256)</strong>
                    Khóa lưu trên máy được mã hóa với PBKDF2 và salt thiết bị ngẫu nhiên. Trích xuất thô LocalStorage không thể đọc được plaintext API key.
                  </div>
                </div>

                <div className="ai-security-item">
                  <Info style={{ width: 14, height: 14, color: '#38bdf8', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>4. Khuyến nghị thiết lập hạn mức (Spending Limit)</strong>
                    Trên console của Google Cloud hoặc OpenAI, bạn nên giới hạn ngân sách hàng tháng mức $1 - $5 và giới hạn IP/HTTP Referrers để đảm bảo an toàn tối đa.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 7: Connection Test Result Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="ai-btn-secondary"
            >
              <RefreshCw className={isTesting ? 'animate-spin' : ''} style={{ width: 13, height: 13, color: '#38bdf8' }} />
              <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
            </button>

            {settings.apiKey && (
              <button
                type="button"
                onClick={handleEmergencyWipe}
                className="ai-btn-danger"
                title="Xóa sạch API Key và dữ liệu mã hóa khỏi máy ngay lập tức"
              >
                <Trash2 style={{ width: 13, height: 13 }} />
                <span>Xóa sạch Key</span>
              </button>
            )}

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
