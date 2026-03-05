"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Tab {
  id: string;
  title: string;
  href: string;
  active: boolean;
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, "active">) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Auto-add tab for current route if it doesn't exist
  useEffect(() => {
    const publicRoutes = ["/", "/login", "/register", "/onboarding", "/manifesto", "/changelog"];
    if (publicRoutes.includes(pathname)) return;

    const title = getTitleFromPathname(pathname);
    const existingTabIndex = tabs.findIndex((t) => t.href === pathname);

    if (existingTabIndex === -1) {
      const newTab = { id: Math.random().toString(36).substr(2, 9), title, href: pathname, active: true };
      setTabs((prev) => prev.map((t) => ({ ...t, active: false })).concat(newTab));
      setActiveTabId(newTab.id);
    } else {
      setTabs((prev) =>
        prev.map((t, i) => ({
          ...t,
          active: i === existingTabIndex,
        }))
      );
      setActiveTabId(tabs[existingTabIndex].id);
    }
  }, [pathname]);

  const addTab = (tab: Omit<Tab, "active">) => {
    setTabs((prev) => [
      ...prev.map((t) => ({ ...t, active: false })),
      { ...tab, active: true },
    ]);
    setActiveTabId(tab.id);
  };

  const removeTab = (id: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== id);
      if (id === activeTabId && newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        router.push(lastTab.href);
      }
      return newTabs;
    });
  };

  const setActiveTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab) {
      router.push(tab.href);
    }
  };

  return (
    <TabContext.Provider value={{ tabs, activeTabId, addTab, removeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTabs must be used within a TabProvider");
  }
  return context;
}

function getTitleFromPathname(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/learn") return "Learn";
  if (pathname === "/explore") return "Explore";
  if (pathname === "/guard") return "Guard";
  if (pathname === "/compiler") return "Compiler";
  if (pathname === "/vedacode") return "Knowledge Studio";
  if (pathname === "/documentExplainer") return "Doc Explainer";
  if (pathname === "/vault") return "Vault";
  if (pathname.startsWith("/vault/")) return `Vault · ${pathname.split("/").pop()}`;
  if (pathname === "/atelier") return "Atelier";
  if (pathname === "/skill-tree") return "Skills";
  if (pathname === "/ui-library") return "UI Library";
  const segment = pathname.split("/").filter(Boolean).pop() ?? "Page";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}
