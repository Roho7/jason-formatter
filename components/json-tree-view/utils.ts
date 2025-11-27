import { Node, Edge } from '@xyflow/react';

export const calculateWidth = (text: string) => {
  return Math.min(Math.max(text.length * 8 + 20, 150), 400);
};

export const jsonToGraph = (
  data: any, 
  idPrefix = 'node',
  isReadOnly = false
): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let idCounter = 0;

  const traverse = (currentData: any, parentId: string | null, key: string | null = null, path: string[] = []) => {
    const currentId = `${idPrefix}-${idCounter++}`;
    const isObject = currentData !== null && typeof currentData === 'object' && !Array.isArray(currentData);
    const isArray = Array.isArray(currentData);
    const type = isObject || isArray ? 'objectNode' : 'primitiveNode';
    
    const nodeData = {
      label: key || (parentId === null ? (isArray ? 'root []' : 'root {}') : ''),
      value: isObject || isArray ? (isArray ? `[${currentData.length}]` : `{${Object.keys(currentData).length}}`) : String(currentData),
      type: isArray ? 'array' : isObject ? 'object' : typeof currentData,
      isRoot: parentId === null,
      path,
      key,
      isReadOnly
    };

    nodes.push({
      id: currentId,
      type: 'jsonNode',
      position: { x: 0, y: 0 }, // Position will be calculated by dagre
      data: nodeData,
    });

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
        type: 'smoothstep',
        animated: false,
        // label: key || undefined, // Removed per user request
        style: { stroke: '#64748b' },
      });
    }

    if (isObject) {
      Object.entries(currentData).forEach(([childKey, childValue]) => {
        traverse(childValue, currentId, childKey, [...path, childKey]);
      });
    } else if (isArray) {
      currentData.forEach((item: any, index: number) => {
        traverse(item, currentId, `[${index}]`, [...path, String(index)]);
      });
    }
  };

  traverse(data, null);
  return { nodes, edges };
};

