"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type SidebarCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

export function useSidebar(): SidebarCtx {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used inside <SidebarProvider>");
  }
  return ctx;
}

export function SidebarProvider({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((v) => !v);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle }}>
      <div className="flex h-screen w-full">
        <div
          className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
            open ? "w-72" : "w-0"
          }`}
          aria-hidden={!open}
        >
          <div className="h-full w-72">{sidebar}</div>
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}
