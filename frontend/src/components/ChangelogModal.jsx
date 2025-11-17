import React, { useEffect } from 'react';

export default function ChangelogModal({ isOpen, onClose, changelog }) {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const versions = changelog?.versions || [];

  return (
    <div className="changelog-overlay" onClick={onClose}>
      <div className="changelog-modal" onClick={(e) => e.stopPropagation()}>
        <div className="changelog-header">
          <h2 className="changelog-title">📜 CHANGELOG</h2>
          <button className="changelog-close" onClick={onClose}>✕</button>
        </div>

        <div className="changelog-content">
          {versions.length === 0 ? (
            <div className="changelog-empty">No changelog entries found</div>
          ) : (
            versions.map((entry, idx) => (
              <div key={idx} className="changelog-entry">
                <div className="changelog-version">
                  <span className="version-number">v{entry.version}</span>
                  <span className="version-date">{entry.date}</span>
                </div>
                <ul className="changelog-changes">
                  {(entry.changes || []).map((change, changeIdx) => (
                    <li key={changeIdx} className="changelog-item">
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="changelog-footer">
          <p className="arcade-text">Press ESC or click outside to close</p>
        </div>
      </div>

      <style jsx>{`
        .changelog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }

        .changelog-modal {
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          border: 4px solid #f59e0b;
          box-shadow: 
            0 0 30px rgba(245, 158, 11, 0.6),
            inset 0 0 30px rgba(245, 158, 11, 0.1);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }

        .changelog-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15) 0px,
              rgba(0, 0, 0, 0.15) 2px,
              transparent 2px,
              transparent 4px
            );
          pointer-events: none;
          animation: scanlines 8s linear infinite;
          z-index: 1;
        }

        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }

        .changelog-header {
          position: relative;
          z-index: 10;
          padding: 20px;
          border-bottom: 3px solid #f59e0b;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.5);
        }

        .changelog-title {
          margin: 0;
          font-family: 'Press Start 2P', monospace;
          font-size: 18px;
          color: #f59e0b;
          text-shadow: 
            0 0 10px #f59e0b,
            2px 2px 0 rgba(0, 0, 0, 0.8);
          letter-spacing: 2px;
        }

        .changelog-close {
          width: 40px;
          height: 40px;
          border: 3px solid #f59e0b;
          background: #f59e0b;
          color: #0f172a;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.1s;
          box-shadow: 0 4px 0 #b45309;
        }

        .changelog-close:hover {
          background: #fbbf24;
          border-color: #fbbf24;
          box-shadow: 0 2px 0 #b45309;
          transform: translateY(2px);
        }

        .changelog-close:active {
          box-shadow: 0 0 0 #b45309;
          transform: translateY(4px);
        }

        .changelog-content {
          position: relative;
          z-index: 10;
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          font-family: 'Courier New', monospace;
          color: #d1d5db;
        }

        .changelog-empty {
          color: #f59e0b;
          font-size: 14px;
          text-align: center;
          font-weight: bold;
          padding: 40px 20px;
        }

        .changelog-entry {
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(15, 23, 42, 0.6);
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
        }

        .changelog-version {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .version-number {
          font-family: 'Press Start 2P', monospace;
          font-size: 13px;
          color: #f59e0b;
          text-shadow: 0 0 5px rgba(245, 158, 11, 0.8);
          font-weight: bold;
        }

        .version-date {
          font-size: 11px;
          color: #60a5fa;
          font-style: italic;
        }

        .changelog-changes {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .changelog-item {
          color: #e5e7eb;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 8px;
          padding-left: 16px;
          position: relative;
        }

        .changelog-item::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #10b981;
        }

        .changelog-footer {
          position: relative;
          z-index: 10;
          padding: 15px;
          text-align: center;
          border-top: 2px dashed #f59e0b;
          background: rgba(0, 0, 0, 0.5);
        }

        .arcade-text {
          margin: 0;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #f59e0b;
          letter-spacing: 1px;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }

        /* Scrollbar styling */
        .changelog-content::-webkit-scrollbar {
          width: 8px;
        }

        .changelog-content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        .changelog-content::-webkit-scrollbar-thumb {
          background: #f59e0b;
          border-radius: 4px;
        }

        .changelog-content::-webkit-scrollbar-thumb:hover {
          background: #fbbf24;
        }
      `}</style>
    </div>
  );
}
