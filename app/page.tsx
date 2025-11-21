"use client";
import React, { useEffect, useState } from "react";

import PageTabs from "./_components/page.tabs";
import { getTabs, JsonEntry, saveTabs } from "./_utils/utils";
import { toast, Toaster } from "sonner";
import { HotkeysProvider, useHotkeys } from "react-hotkeys-hook";
import JsonFormatter from "./_components/json.formatter";

export default function Home() {
  const [pageTabs, setPageTabs] = useState<{ id: string; label: string }[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<JsonEntry["type"]>("format");

  useEffect(() => {
    const storedTabs = getTabs();
    if (storedTabs.length === 0) {
      const newTabId = Date.now().toString();
      setPageTabs([{ id: newTabId, label: `Tab ${pageTabs.length + 1}` }]);
      saveTabs([{ id: newTabId, label: `Tab ${pageTabs.length + 1}` }]);
      setActiveTabId(newTabId);
    } else {
      setPageTabs(storedTabs);
      setActiveTabId(storedTabs[0].id);
    }
  }, []);

  const handleCloseTab = (tab_id: string) => {
    setPageTabs(pageTabs.filter((t) => t.id !== tab_id));

    saveTabs(pageTabs);

  };

  const handleOpenTab = () => {

    const newTabId = Date.now().toString();
    if (pageTabs.length < 10) {
      setPageTabs([
          ...pageTabs,
          {
            id: newTabId,
            label: `Tab ${pageTabs.length + 1}`,
          },
        ])
    } else {
      toast.error("Work with what you have! No more tabs allowed");
      return;
    }

    saveTabs([
      ...pageTabs,
      {
        id: newTabId,
        label: `Tab ${pageTabs.length + 1}`,
      },
    ]);
    setActiveTabId(newTabId);
  };

  useHotkeys("mod+esc", () => {
    const activeTabIndex = pageTabs?.findIndex((t) => t.id === activeTabId);
    handleCloseTab(pageTabs[activeTabIndex].id);
    if (activeTabIndex && activeTabIndex > 0) {
      setActiveTabId(pageTabs[activeTabIndex - 1].id);
    } else {
      setActiveTabId(pageTabs[0].id);
    }
  });

  useHotkeys("alt+shift+n", () => {
    handleOpenTab();
  });

  useHotkeys("alt+shift+right", () => {
    const activeTabIndex = pageTabs?.findIndex((t) => t.id === activeTabId);
    if (activeTab && activeTabIndex < pageTabs.length - 1) {
      setActiveTabId(pageTabs[activeTabIndex + 1].id);
    } else {
      setActiveTabId(pageTabs[0].id);
    }
  });
  useHotkeys("alt+shift+left", () => {
    const activeTabIndex = pageTabs?.findIndex((t) => t.id === activeTabId);
    if (activeTab && activeTabIndex > 0) {
      setActiveTabId(pageTabs[activeTabIndex - 1].id);
    } else {
      setActiveTabId(pageTabs[pageTabs.length - 1].id);
    }
  });


  return (
    <HotkeysProvider>
    <div className="min-h-screen bg-background">
      <div className="w-full px-2 py-2">
        <PageTabs
          handleCloseTab={handleCloseTab}
          handleOpenTab={handleOpenTab}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
          pageTabs={pageTabs}
          setPageTabs={setPageTabs}
        >
          <div className="bg-card rounded-2xl shadow-xl sm:px-8 sm:py-4 px-2 py-2">
            <JsonFormatter
              tab_id={activeTabId}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </PageTabs>
      </div>
      <Toaster />
    </div>
    </HotkeysProvider>
  );
}
