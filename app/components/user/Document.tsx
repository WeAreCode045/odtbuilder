import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { Page } from './Page';
import { Plus } from 'lucide-react';

export const Document = ({ children }: { children?: React.ReactNode }) => {
  const { connectors: { connect, drag }, id } = useNode();
  const { actions, query } = useEditor();

  const handleAddPage = () => {
    // We can create a fresh Element for a Page
    // Note: In Craft.js, we usually add Nodes. 
    // We need to parse the React Element into a NodeTree before adding.
    const node = query.parseReactElement(<Element is={Page} canvas />).toNodeTree();
    
    actions.addNodeTree(node, id);
  };

  return (
    <div 
        ref={(ref) => { if(ref) connect(drag(ref)) }} 
        className="flex flex-col items-center gap-8 pb-20 min-h-full w-full"
    >
      {children}

      <button 
        onClick={handleAddPage}
        className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 border border-blue-200 shadow-sm rounded-full font-medium hover:bg-blue-50 transition-all mt-4"
      >
        <Plus size={18} />
        Pagina Toevoegen
      </button>
    </div>
  );
};

Document.craft = {
  displayName: 'Document',
  rules: {
    // Only allow Pages to be dragged into Document
    canMoveIn: (incomingNodes) => incomingNodes.every(node => node.data.type === Page)
  }
};