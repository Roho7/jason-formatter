import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import JsonNode from './json-node';
import { jsonToGraph } from './utils';
import dagre from 'dagre';

const nodeWidth = 200;
const nodeHeight = 160;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

// Simple deep clone and set implementation to avoid lodash dependency
const setDeep = (obj: any, path: string[], value: any): any => {
  if (path.length === 0) return value;
  
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  const [head, ...tail] = path;

  if (tail.length === 0) {
    // Handle type conversion based on previous value if possible, or try to infer
    // For now, we'll stick to basic string/number handling
    if (!isNaN(Number(value)) && value.trim() !== '') {
       newObj[head] = Number(value);
    } else if (value === 'true') {
       newObj[head] = true;
    } else if (value === 'false') {
       newObj[head] = false;
    } else if (value === 'null') {
       newObj[head] = null;
    } else {
       newObj[head] = value;
    }
    return newObj;
  }

  newObj[head] = setDeep(newObj[head] || {}, tail, value);
  return newObj;
};

interface JsonTreeViewProps {
  data: string;
  onChange?: (newData: string) => void;
  readOnly?: boolean;
  className?: string;
}

const JsonTreeViewContent = ({ data, onChange, readOnly, className }: JsonTreeViewProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const nodeTypes = useMemo(() => ({ jsonNode: JsonNode }), []);

  const handleNodeEdit = useCallback((path: string[], newValue: string) => {
    if (!onChange || readOnly) return;

    try {
      const currentJson = JSON.parse(data);
      const newJson = setDeep(currentJson, path, newValue);
      onChange(JSON.stringify(newJson, null, 2));
    } catch (e) {
      console.error("Failed to update JSON", e);
    }
  }, [data, onChange, readOnly]);

  useEffect(() => {
    console.log("data", data)
    try {
      if (!data) return;
      const jsonData = JSON.parse(data);
      
      const { nodes: initialNodes, edges: initialEdges } = jsonToGraph(
        jsonData, 
        'node', 
        readOnly
      );

      // Add edit handler to nodes
      const nodesWithHandler = initialNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onEdit: (val: string) => handleNodeEdit(node.data.path as string[], val)
        }
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodesWithHandler,
        initialEdges
      );

      setNodes(layoutedNodes as any);
      setEdges(layoutedEdges as any);
    } catch (e) {
      console.error("Invalid JSON for Tree View", e);
    }
  }, [data]);

  useEffect(() => {
    console.log("nodes", nodes)
    console.log("edges", edges)
  }, [nodes, edges])

  return (
    <div className={className || "w-full h-full min-h-[500px]"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
        draggable={false}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

const JsonTreeView = (props: JsonTreeViewProps) => {
  return (
    <ReactFlowProvider>
      <JsonTreeViewContent {...props} />
    </ReactFlowProvider>
  );
};

export default JsonTreeView;

