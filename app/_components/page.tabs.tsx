"use client";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { RenameModal, RenameModalRef } from "@/components/ui/rename-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, X } from "lucide-react";
import React, { useRef } from "react";

type TabPageProps = {
  activeTabId?: string;
  setActiveTabId: (tabId?: string) => void;
  children: React.ReactNode;
  pageTabs: {
    id: string;
    label: string;
  }[];
  setPageTabs: (tabs: { id: string; label: string }[]) => void;
  handleCloseTab: (tabId: string) => void;
  handleOpenTab: () => void;
};

const PageTabs = ({
  activeTabId,
  setActiveTabId,
  children,
  pageTabs,
  setPageTabs,
  handleCloseTab,
  handleOpenTab,
}: TabPageProps) => {
  const renameModalRef = useRef<RenameModalRef>(null);

  return (
    <Tabs defaultValue={activeTabId} value={activeTabId} className="">
      <TabsList className="gap-2 shadow-inner w-full bg-slate-200 overflow-x-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {pageTabs.map((tab) => (
          <ContextMenu key={tab.id}>
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              asChild
              className="min-w-[90px]"
            >
              <ContextMenuTrigger className="truncate text-nowrap overflow-ellipsis">{tab.label}</ContextMenuTrigger>
            </TabsTrigger>
            <ContextMenuContent className="w-52">
              <ContextMenuItem
                inset
                variant="destructive"
                onClick={() => handleCloseTab(tab.id)}
              >
                Close
                <ContextMenuShortcut>⌘ Esc</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                inset
                variant="default"
                onClick={() => {
                  renameModalRef.current?.setNewTabName(tab.label);
                  renameModalRef.current?.open();
                }}
              >
                Rename
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-[29px]"
              onClick={() => handleOpenTab()}
              size="sm"
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col items-center gap-2">
            <span className="flex items-center gap-2">
              {" "}
              <Plus size={12} />
              New Tab{" "}
            </span>
            <KbdGroup>
              <Kbd>Alt</Kbd>
              <span>+</span>
              <Kbd>⇧</Kbd>
              <span>+</span>
              <Kbd>N</Kbd>
            </KbdGroup>
          </TooltipContent>
        </Tooltip>
      </TabsList>
      {activeTabId && <TabsContent value={activeTabId}>{children}</TabsContent>}
      <RenameModal
        ref={renameModalRef}
        onSave={(name) => {
          setPageTabs(
            pageTabs.map((t) =>
              t.id === activeTabId ? { ...t, label: name } : t,
            ),
          );
          setActiveTabId(activeTabId);
        }}
      />
    </Tabs>
  );
};

export default PageTabs;
