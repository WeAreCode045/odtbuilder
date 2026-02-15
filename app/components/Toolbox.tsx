import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Type, AlignLeft, User, LayoutTemplate } from 'lucide-react';

// Import components to create instances for dragging
import { Titel } from './user/Titel';
import { Tekst } from './user/Tekst';
import { GastInformatie } from './user/GastInformatie';

export const Toolbox: React.FC = () => {
  const { connectors } = useEditor();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Componenten</h2>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        {/* Draggable Title */}
        <div 
          ref={(ref) => {
             if (ref) connectors.create(ref, <Titel text="Nieuwe Titel" fontSize={24} color="#1a202c" textAlign="left" />);
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <Type size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Titel</span>
        </div>

        {/* Draggable Text */}
        <div 
          ref={(ref) => {
            if (ref) connectors.create(ref, <Tekst text="Start met typen..." fontSize={14} color="#4a5568" />);
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <AlignLeft size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Tekst</span>
        </div>

        {/* Draggable Guest Info */}
        <div 
          ref={(ref) => {
            if (ref) connectors.create(ref, <GastInformatie field="firstname" />);
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <User size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Gast Info</span>
        </div>
      </div>

      <div className="mt-auto p-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-3">
            <LayoutTemplate size={18} className="text-blue-600 mt-0.5" />
            <div>
                <p className="text-xs font-semibold text-blue-800">Tips</p>
                <p className="text-xs text-blue-600 mt-1">
                    Sleep componenten naar het A4 blad. Klik op een component om instellingen te wijzigen.
                </p>
            </div>
        </div>
      </div>
    </aside>
  );
};