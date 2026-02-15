import React from 'react';
import { useNode } from '@craftjs/core';

export const Page = ({ children }: { children?: React.ReactNode }) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div 
      ref={(ref) => { if(ref) connect(drag(ref)) }}
      className="bg-white shadow-lg relative transition-shadow hover:shadow-xl"
      style={{
        width: '210mm',
        height: '297mm',
        minWidth: '210mm',
        minHeight: '297mm',
        overflow: 'hidden',
        padding: '20mm', // Standard margin
      }}
    >
      {/* We add a dotted border in editor mode just to see boundaries if empty, strictly optional */}
      <div className="w-full h-full outline-none flex flex-col gap-2">
        {children}
        {(!children || (Array.isArray(children) && children.length === 0)) && (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg">
                <span className="text-gray-300 text-sm">Sleep componenten hier</span>
            </div>
        )}
      </div>
    </div>
  );
};

Page.craft = {
  displayName: 'Pagina',
  rules: {
      // Pages cannot be dragged into other Pages, usually only Document
  }
};