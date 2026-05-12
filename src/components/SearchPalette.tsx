"use client";
/**
 * SearchPalette — Cmd+K (Mac) / Ctrl+K (Win/Linux) search overlay.
 * Fuzzy-matches modules and conversation prompts.
 * Renders as a portal over everything on the hybrid route.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  section: "modules" | "prompts";
}

export interface SearchPaletteProps {
  items: PaletteItem[];
  onSelect: (item: PaletteItem) => void;
  onClose: () => void;
}

// ─── Fuzzy matcher (<50 lines) ────────────────────────────────────────────────

function fuzzyScore(query: string, target: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  // Exact substring: highest score
  if (t.includes(q)) return 2 + (1 / (t.length || 1));
  // Character-order match
  let qi = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += qi === 0 ? 1.5 : 1;
      qi++;
    }
  }
  if (qi < q.length) return 0; // Not all query chars found
  return score / (t.length || 1);
}

// ─── SearchPalette component ──────────────────────────────────────────────────

export function SearchPalette({ items, onSelect, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [mounted]);

  const filtered = query
    ? items
        .map((item) => ({
          item,
          score: Math.max(
            fuzzyScore(query, item.label),
            fuzzyScore(query, item.description ?? "")
          ),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item)
    : items;

  // Group by section
  const modules = filtered.filter((i) => i.section === "modules");
  const prompts = filtered.filter((i) => i.section === "prompts");
  const allFiltered = [...modules, ...prompts];

  // Reset activeIdx when query changes
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, allFiltered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = allFiltered[activeIdx];
        if (item) { onSelect(item); onClose(); }
        return;
      }
    },
    [allFiltered, activeIdx, onSelect, onClose]
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-palette-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!mounted) return null;

  const palette = (
    <div className="sp-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{PALETTE_CSS}</style>
      <div className="sp-modal" role="dialog" aria-modal="true" aria-label="Search modules and prompts">
        {/* Search bar */}
        <div className="sp-search-row">
          <span className="sp-search-icon" aria-hidden="true">&#x2315;</span>
          <input
            ref={inputRef}
            className="sp-input"
            type="text"
            placeholder="Search modules and prompts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="sp-clear" onClick={() => setQuery("")} aria-label="Clear search">
              &times;
            </button>
          )}
        </div>

        {/* Results */}
        <div className="sp-results" ref={listRef}>
          {allFiltered.length === 0 && (
            <div className="sp-empty">No matches for &ldquo;{query}&rdquo;</div>
          )}

          {modules.length > 0 && (
            <div className="sp-section">
              <div className="sp-section-label">Modules</div>
              {modules.map((item) => {
                const globalIdx = allFiltered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    className={`sp-item ${globalIdx === activeIdx ? "active" : ""}`}
                    data-palette-idx={globalIdx}
                    onMouseEnter={() => setActiveIdx(globalIdx)}
                    onClick={() => { onSelect(item); onClose(); }}
                  >
                    <span className="sp-item-label">{item.label}</span>
                    {item.description && (
                      <span className="sp-item-desc">{item.description}</span>
                    )}
                    <span className="sp-item-badge">module</span>
                  </button>
                );
              })}
            </div>
          )}

          {prompts.length > 0 && (
            <div className="sp-section">
              <div className="sp-section-label">Conversation prompts</div>
              {prompts.map((item) => {
                const globalIdx = allFiltered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    className={`sp-item ${globalIdx === activeIdx ? "active" : ""}`}
                    data-palette-idx={globalIdx}
                    onMouseEnter={() => setActiveIdx(globalIdx)}
                    onClick={() => { onSelect(item); onClose(); }}
                  >
                    <span className="sp-item-label">{item.label}</span>
                    <span className="sp-item-badge sp-item-badge-prompt">prompt</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sp-footer">
          <span className="sp-hint">
            <kbd>↑↓</kbd> navigate
          </span>
          <span className="sp-hint">
            <kbd>↵</kbd> select
          </span>
          <span className="sp-hint">
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(palette, document.body);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PALETTE_CSS = `
  .sp-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 9999;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 12vh;
    animation: sp-fade-in 0.12s ease;
  }
  @keyframes sp-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .sp-modal {
    width: 100%;
    max-width: 560px;
    background: #0d0d1a;
    border: 1px solid rgba(139,92,246,0.22);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08);
    animation: sp-scale-in 0.16s cubic-bezier(0.16,1,0.3,1);
    font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
  }
  @keyframes sp-scale-in {
    from { transform: scale(0.96) translateY(-6px); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
  .sp-search-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.875rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .sp-search-icon {
    font-size: 1rem;
    color: rgba(139,92,246,0.6);
    flex-shrink: 0;
  }
  .sp-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: rgba(255,255,255,0.88);
    font-size: 0.9rem;
    font-family: inherit;
    caret-color: #8b5cf6;
  }
  .sp-input::placeholder { color: rgba(255,255,255,0.22); }
  .sp-clear {
    background: none;
    border: none;
    color: rgba(255,255,255,0.28);
    font-size: 1rem;
    cursor: pointer;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    transition: color 0.12s ease;
  }
  .sp-clear:hover { color: rgba(255,255,255,0.6); }
  .sp-results {
    max-height: 340px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(139,92,246,0.2) transparent;
  }
  .sp-results::-webkit-scrollbar { width: 3px; }
  .sp-results::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 2px; }
  .sp-empty {
    padding: 1.5rem 1rem;
    text-align: center;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.25);
  }
  .sp-section { padding: 0.375rem 0; }
  .sp-section-label {
    padding: 0.375rem 1rem 0.25rem;
    font-size: 0.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    font-family: ui-monospace, monospace;
  }
  .sp-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    padding: 0.6rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.1s ease;
  }
  .sp-item:hover, .sp-item.active {
    background: rgba(139,92,246,0.09);
  }
  .sp-item-label {
    flex: 1;
    font-size: 0.82rem;
    color: rgba(255,255,255,0.78);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sp-item.active .sp-item-label { color: rgba(255,255,255,0.95); }
  .sp-item-desc {
    font-size: 0.68rem;
    color: rgba(255,255,255,0.28);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
  .sp-item-badge {
    font-family: ui-monospace, monospace;
    font-size: 0.55rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    color: rgba(139,92,246,0.7);
    background: rgba(139,92,246,0.1);
    border: 1px solid rgba(139,92,246,0.2);
    flex-shrink: 0;
  }
  .sp-item-badge-prompt {
    color: rgba(6,182,212,0.7);
    background: rgba(6,182,212,0.08);
    border-color: rgba(6,182,212,0.18);
  }
  .sp-footer {
    padding: 0.5rem 1rem;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .sp-hint {
    font-size: 0.62rem;
    color: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .sp-hint kbd {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 0.1rem 0.35rem;
    font-family: ui-monospace, monospace;
    font-size: 0.6rem;
    color: rgba(255,255,255,0.35);
  }
  @media (max-width: 600px) {
    .sp-backdrop { padding-top: 5vh; align-items: flex-start; }
    .sp-modal { max-width: calc(100vw - 2rem); margin: 0 1rem; border-radius: 10px; }
    .sp-results { max-height: 240px; }
    .sp-item-desc { display: none; }
  }
`;
