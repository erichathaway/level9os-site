"use client";

interface NavItem {
  id: string;
  label: string;
}

interface ConsoleSidebarProps {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
}

export default function ConsoleSidebar({ items, active, onSelect }: ConsoleSidebarProps) {
  return (
    <>
      <style>{`
        .console-sidebar {
          width: 250px;
          min-height: 100vh;
          background: var(--bg-surface);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          z-index: 10;
        }
        .sidebar-logo {
          padding: 0.75rem 1.5rem 1.75rem;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--violet);
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sidebar-logo-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--violet);
          box-shadow: 0 0 6px var(--violet);
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0 0.75rem;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.875rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease, text-shadow 0.2s ease;
          user-select: none;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
        }
        .sidebar-item:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.04);
        }
        .sidebar-item.active {
          color: var(--violet);
          background: rgba(139,92,246,0.08);
          text-shadow: 0 0 8px rgba(139,92,246,0.5);
        }
        .sidebar-item-icon {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.5;
          flex-shrink: 0;
          transition: opacity 0.2s ease, box-shadow 0.2s ease;
        }
        .sidebar-item.active .sidebar-item-icon {
          opacity: 1;
          box-shadow: 0 0 6px currentColor;
        }
        .sidebar-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sidebar-login {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
          font-weight: 500;
        }
        .sidebar-login:hover { color: var(--text-primary); }
        .sidebar-version {
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.65rem;
          color: var(--text-ghost);
          letter-spacing: 0.1em;
        }
        /* Hide sidebar on mobile */
        @media (max-width: 768px) {
          .console-sidebar {
            display: none;
          }
        }
      `}</style>

      <aside className="console-sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-dot" />
          Level9OS
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${active === item.id ? "active" : ""}`}
              onClick={() => onSelect(item.id)}
            >
              <span className="sidebar-item-icon" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="sidebar-login">Log in</a>
          <span className="sidebar-version">v2.0 · rebuild</span>
        </div>
      </aside>
    </>
  );
}
