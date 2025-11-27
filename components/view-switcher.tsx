import React from 'react';
import { Code, Workflow } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface ViewSwitcherProps {
  value: 'code' | 'tree';
  onValueChange: (value: 'code' | 'tree') => void;
  className?: string;
}

export function ViewSwitcher({ value, onValueChange, className }: ViewSwitcherProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={value} 
      onValueChange={(val) => {
        if (val) onValueChange(val as 'code' | 'tree');
      }}
      size="sm"
      className={cn("border border-border",className)}
    >
      <ToggleGroupItem value="code" aria-label="Code View" className="h-7 w-7 p-0">
        <Code className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="tree" aria-label="Tree View" className="h-7 w-7 p-0">
        <Workflow className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

