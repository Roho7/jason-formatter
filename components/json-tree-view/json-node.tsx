import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const JsonNode = ({ data, isConnectable }: NodeProps) => {
  const { key, value, type, isRoot, isReadOnly, onEdit } = data as any;

  const isComplex = type === 'object' || type === 'array';
  
  const getTypeColor = (t: string) => {
    switch (t) {
      case 'string': return 'text-green-500';
      case 'number': return 'text-blue-500';
      case 'boolean': return 'text-yellow-500';
      case 'null': return 'text-red-500';
      case 'object': return 'text-purple-500';
      case 'array': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-card border rounded-md shadow-sm min-w-[150px] p-2 text-xs font-mono relative group hover:border-primary/50 transition-colors">
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="w-2 h-2 !bg-muted-foreground"
          draggable={false}
          
        />
      )}
      
      <div className="flex flex-col gap-1 h-full">
        {key && (
          <div className="flex items-center gap-1 border-b pb-1 mb-1 border-border/50">
            <span className="text-muted-foreground font-semibold">{key}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap text-wrap h-fit">
          {!isComplex ? (
            isReadOnly ? (
               <span className={cn("break-all whitespace-pre-wrap max-w-[200px] max-h-[120px] overflow-y-auto block scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent", getTypeColor(type))}>
                {String(value)}
              </span>
            ) : (
              <textarea
                className={cn(
                  "bg-transparent outline-none border-none p-0 w-full min-w-[50px] resize-none scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent",
                  getTypeColor(type)
                )}
                style={{ minHeight: '20px', maxHeight: '120px' }}
                defaultValue={value}
                onChange={(e) => onEdit && onEdit(e.target.value)}
              />
            )
          ) : (
             <span className={cn("italic", getTypeColor(type))}>
              {type} {value}
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 !bg-muted-foreground"
        draggable={false}
      />
    </div>
  );
};

export default memo(JsonNode);

