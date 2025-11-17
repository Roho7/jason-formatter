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
    <div className="min-h-screen bg-gray-100">
        <header className="px-4 top-2 flex items-center justify-center bg-[radial-gradient(circle_at_center,10)] from-blue-500 to-purple-500">
          {/* <h1 className="lg:text-2xl text-2xl  font-semibold mb-2 tracking-widest inset-shadow bg-gradient-to-br from-gray-500 to-gray-800 bg-clip-text text-transparent">
            JSON TOOLS
          </h1> */}
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
