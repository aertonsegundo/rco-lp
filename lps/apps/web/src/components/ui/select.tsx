"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Dropdown próprio (não o `<select>` nativo do sistema operacional): a
// lista de opções de um `<select>` é desenhada pelo navegador/SO, fora do
// alcance do CSS da página (sempre clara, sem a cor de fundo/borda daqui),
// e é exatamente essa caixa que a página quer controlar. Escrito do zero
// (padrão "combobox" da WAI-ARIA: botão + `listbox`), não vendorizado de
// registro nenhum, porque nenhum dos registros já usados neste projeto tem
// um select estilizável pronto.
//
// Só single-select, sem busca (as duas listas do formulário — Nicho,
// Faturamento — têm poucas opções fixas; não precisa de mais que isso).
// ============================================================

export interface SelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: readonly string[];
  placeholder?: string;
  invalid?: boolean;
  className?: string;
}

export function Select({ id, name, value, onChange, onBlur, options, placeholder = "Selecione", invalid, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.indexOf(value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reactId = useId();
  const listboxId = `${id ?? reactId}-listbox`;

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  // Fecha ao clicar fora ou apertar Escape em qualquer lugar da página.
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const commit = (option: string) => {
    onChange(option);
    close();
  };

  const moveActive = (delta: number) => {
    setActiveIndex((i) => {
      const next = Math.min(options.length - 1, Math.max(0, i + delta));
      listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
      return next;
    });
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setActiveIndex(Math.max(0, options.indexOf(value)));
        setOpen(true);
      } else {
        moveActive(e.key === "ArrowDown" ? 1 : -1);
      }
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) commit(options[activeIndex] ?? value);
      else setOpen(true);
      return;
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={invalid}
        aria-activedescendant={open ? `${listboxId}-${activeIndex}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          "flex h-14 w-full items-center justify-between gap-2 rounded-xl border border-line bg-bg px-4 text-left text-base",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand aria-[invalid=true]:border-danger",
          value ? "text-ink" : "text-mute/70",
          className,
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown aria-hidden="true" className={cn("size-5 shrink-0 text-mute transition-transform", open && "rotate-180")} />
      </button>
      {/* Input escondido só pra o formulário conseguir associar um `name`
          nativo (React Hook Form via `Controller` já dispensa isso, mas
          mantém o valor inspecionável/enviável se algo ler o DOM direto). */}
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
          >
            {/* `<li>` fica direto dentro do `<ul>` (nada de `<div>` no meio):
                `moveActive` usa `listRef.current.children[indice]` pra achar
                o item certo, e isso só bate se os filhos do `<ul>` forem os
                próprios `<li>`. */}
            <ul ref={listRef} id={listboxId} role="listbox" tabIndex={-1} className="max-h-64 overflow-y-auto p-1">
              {options.map((option, index) => (
                <li
                  key={option}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={option === value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(option)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-2.5 text-sm text-ink transition-colors",
                    index === activeIndex ? "bg-brand/15" : "hover:bg-line/40",
                    option === value && "font-semibold text-brand",
                  )}
                >
                  {option}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
