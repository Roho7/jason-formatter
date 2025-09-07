"use client";
import React, { useEffect, useState } from "react";
import JsonFormatter from "./_components/json.formatter";
import PageTabs from "./_components/page.tabs";
import { getTabs, JsonEntry, saveTabs } from "./_utils/utils";
import { Toaster } from "sonner";

export default function Home() {
  const [pageTabs, setPageTabs] = useState<{ id: string; label: string }[]>([
    { id: '1', label: 'Tab 1' }
  ]);
  const [activePageTab, setActivePageTab] = useState<{ id: string; label: string }>({
    id: '1', label: 'Tab 1'
  });
  const [activeTab, setActiveTab] = useState<JsonEntry['type']>("format");

  useEffect(() => {
    const storedTabs = getTabs();
    setPageTabs(storedTabs);
    setActivePageTab(storedTabs[0]);
  }, []);

  useEffect(() => {
    saveTabs(pageTabs);
  }, [pageTabs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="text-right mb-2 px-4 absolute right-2 top-2">
          <h1 className="text-3xl font-semibold mb-2 inset-shadow">
            JASON Formatter
          </h1>
        </header>
      <div className="w-full px-2 py-2">

        <PageTabs
          tabs={pageTabs}
          activeTab={activePageTab}
          setActiveTab={setActivePageTab}
          pageTabs={pageTabs}
          setPageTabs={setPageTabs}
        >
          <div className="bg-white rounded-2xl shadow-xl px-8 py-4 ">
            <JsonFormatter id={activePageTab.id} label={activePageTab.label} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </PageTabs>
      </div>
      <Toaster />
    </div>
  );
}
