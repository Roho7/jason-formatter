"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type TabPageProps = {
  tabs: {
    id: string;
    label: string;
  }[];
  activeTab: {
    id: string;
    label: string;
  };
  setActiveTab: (tab: { id: string; label: string; }) => void;
  children: React.ReactNode;
  pageTabs: {
    id: string;
    label: string;
  }[];
  setPageTabs: (tabs: { id: string; label: string; }[]) => void;
};

const PageTabs = ({ tabs, activeTab, setActiveTab, children, pageTabs, setPageTabs }: TabPageProps) => {
  return (
    <Tabs defaultValue={activeTab.id} className="w-full">
      <TabsList className="flex gap-2 bg-slate-200">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} onClick={() => setActiveTab(tab)}>
            {tab.label}
          </TabsTrigger>
        ))}
        <Button className='h-[29px]' onClick={() => (pageTabs.length < 10) ? setPageTabs([...pageTabs, { id: (pageTabs.length + 1).toString(), label: `Tab ${pageTabs.length + 1}` }]) : toast.error('Work with what you have! No more tabs allowed')} size='sm'>
            <Plus />
        </Button>
      </TabsList>
      {activeTab && <TabsContent value={activeTab.id}>
        {children}
      </TabsContent>}
    </Tabs>
  );
};

export default PageTabs;
