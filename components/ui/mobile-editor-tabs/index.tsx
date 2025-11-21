import React from 'react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu'
import { Button } from '../button'
import { ChevronsUpDown, Download, Hamburger } from 'lucide-react'
import { JsonEntry } from '@/app/_utils/utils'
import { editorTabs } from '@/app/_utils/nav'

type Props = {
    activeTab: JsonEntry["type"]
    handleTabChange: (tab: JsonEntry["type"]) => void
}

const MobileEditorTabs = ({ activeTab, handleTabChange }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className='flex sm:hidden'>
        <Button size="sm" variant="outline" className="flex items-center gap-2 min-w-full">
          {editorTabs.find((tab) => tab.id === activeTab)?.icon}
          <span>{editorTabs.find((tab) => tab.id === activeTab)?.label}</span>
          <ChevronsUpDown className="w-4 h-4 text-muted ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {editorTabs.map((tab) => (
          <DropdownMenuItem key={tab.id} onClick={() => handleTabChange(tab.id as JsonEntry["type"])}>
            <span>{tab.icon}</span>
            {tab.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu> 
  )
}

export default MobileEditorTabs