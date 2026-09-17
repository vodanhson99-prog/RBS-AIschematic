import React, { useState } from 'react';
import type { CircuitComponent, LogEntry, Wire } from '../../types/circuit';
import { Download, Copy, Trash2, CheckCircle, AlertTriangle, ShieldCheck, Clock, ListFilter } from 'lucide-react';

interface Props {
  logs: LogEntry[];
  wires: Wire[];
  components: CircuitComponent[];
  onDeleteWire: (wireId: string) => void;
  onClearWires: () => void;
  onExportJson: () => void;
}

export const WiringLogPanel: React.FC<Props> = ({
  logs,
  wires,
  components,
  onDeleteWire,
  onClearWires,
  onExportJson,
}) => {
  const [activeTab, setActiveTab] = useState<'netlist' | 'history'>('netlist');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to get component & pin name
  const getPinInfo = (compId: string, pinId: string) => {
    const comp = components.find((c) => c.instanceId === compId || c.id === compId);
    const pin = comp?.pins.find((p) => p.id === pinId);
    return {
      compName: comp?.name || compId,
      pinName: pin?.name || pin?.label || pinId,
      pinType: pin?.type || 'passive',
    };
  };

  // Copy Netlist Markdown to clipboard
  const handleCopyMarkdown = () => {
    let md = `### BẢNG SƠ ĐỒ NỐI CHÂN (NETLIST) - AI CIRCUIT STUDIO\n\n`;
    md += `| STT | Linh kiện A | Chân A | Màu dây | Linh kiện B | Chân B | Ghi chú |\n`;
    md += `|---|---|---|---|---|---|---|\n`;

    wires.forEach((w, idx) => {
      const from = getPinInfo(w.fromCompId, w.fromPinId);
      const to = getPinInfo(w.toCompId, w.toPinId);
      md += `| ${idx + 1} | ${from.compName} | ${from.pinName} | \`${w.color}\` | ${to.compName} | ${to.pinName} | Nối dây |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredWires = wires.filter((w) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const from = getPinInfo(w.fromCompId, w.fromPinId);
    const to = getPinInfo(w.toCompId, w.toPinId);
    return (
      from.compName.toLowerCase().includes(term) ||
      from.pinName.toLowerCase().includes(term) ||
      to.compName.toLowerCase().includes(term) ||
      to.pinName.toLowerCase().includes(term)
    );
  });

  return (
    <div className="wiring-log-container glass-panel">
      {/* Panel Header */}
      <div className="log-panel-header">
        <div className="log-panel-title">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <h3 title="Log Sơ Đồ Cắm (Real-time Netlist)">Sơ Đồ Cắm (Real-time Netlist)</h3>
          <span className="log-badge-count">{wires.length} dây</span>
        </div>

        {/* Tab switcher */}
        <div className="log-tab-switcher">
          <button
            className={`log-tab-btn ${activeTab === 'netlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('netlist')}
          >
            <ListFilter className="w-3.5 h-3.5 shrink-0" />
            <span>Sơ đồ chân ({wires.length})</span>
          </button>
          <button
            className={`log-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Nhật ký ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* Toolbar actions */}
      <div className="log-toolbar">
        <input
          type="text"
          placeholder="Tìm kiếm chân hoặc linh kiện..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="log-search-input"
        />

        <div className="log-btn-group">
          <button
            onClick={handleCopyMarkdown}
            title="Sao chép bảng Markdown Netlist"
            className="log-action-btn"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{copied ? 'Đã copy' : 'Copy'}</span>
          </button>
          <button
            onClick={onExportJson}
            title="Tải file sơ đồ JSON"
            className="log-action-btn"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>JSON</span>
          </button>
          {wires.length > 0 && (
            <button
              onClick={onClearWires}
              title="Xoá tất cả dây nối"
              className="log-action-btn text-rose-400 hover:text-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Xoá</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="log-content-scroll">
        {activeTab === 'netlist' ? (
          filteredWires.length === 0 ? (
            <div className="log-empty-state">
              <p className="text-slate-300 text-sm font-medium">Chưa có dây cắm nào.</p>
              <p className="text-slate-500 text-xs mt-1 max-w-[280px]">
                Nhấp vào chân trên linh kiện hoặc dùng Prompt AI để tự động tạo sơ đồ cắm!
              </p>
            </div>
          ) : (
            <div className="netlist-table-wrapper">
              <table className="netlist-table">
                <colgroup>
                  <col style={{ width: '28px' }} />
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '32px' }} />
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '32px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Từ chân</th>
                    <th style={{ textAlign: 'center' }}>Màu</th>
                    <th>Đến chân</th>
                    <th style={{ textAlign: 'center' }}>Xoá</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWires.map((wire, index) => {
                    const from = getPinInfo(wire.fromCompId, wire.fromPinId);
                    const to = getPinInfo(wire.toCompId, wire.toPinId);

                    return (
                      <tr key={wire.id} className="netlist-row">
                        <td className="text-slate-500 font-mono text-center" style={{ fontSize: '10.5px' }}>
                          {index + 1}
                        </td>
                        <td>
                          <div className="pin-cell">
                            <span className="font-semibold text-slate-200" title={from.compName}>
                              {from.compName}
                            </span>
                            <span className="pin-badge" title={from.pinName}>
                              {from.pinName}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="wire-color-swatch-wrapper" title={`Màu dây: ${wire.color}`}>
                            <span
                              className="wire-color-dot"
                              style={{ backgroundColor: wire.color }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="pin-cell">
                            <span className="font-semibold text-slate-200" title={to.compName}>
                              {to.compName}
                            </span>
                            <span className="pin-badge" title={to.pinName}>
                              {to.pinName}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => onDeleteWire(wire.id)}
                            className="btn-delete-wire-row"
                            title="Rút dây cắm này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* History tab */
          <div className="history-timeline">
            {logs.length === 0 ? (
              <div className="log-empty-state">
                <p className="text-slate-400 text-sm">Chưa có nhật ký thao tác.</p>
              </div>
            ) : (
              logs.slice().reverse().map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-time">{entry.timestamp}</div>
                  <div className="history-body">
                    {entry.action === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="history-msg">{entry.message}</span>
                  </div>
                  {entry.detail && (
                    <div className="history-detail">{entry.detail}</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
