import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Type, AlignLeft, User, LayoutTemplate, Image as ImageIcon, Columns, Square } from 'lucide-react';

// Import components to create instances for dragging
import { Titel } from './user/Titel';
import { Tekst } from './user/Tekst';
import { GastInformatie } from './user/GastInformatie';
import { Afbeelding } from './user/Afbeelding';
import { Rij } from './user/Rij';
import { Kolom } from './user/Kolom';

export const Toolbox: React.FC = () => {
  const { connectors } = useEditor();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Componenten</h2>
      </div>
      
      <div className="p-4 flex flex-col gap-3 overflow-y-auto">
        {/* Basic Text Elements */}
        <div className="text-xs font-semibold text-gray-400 mt-2 mb-1">Inhoud</div>
        
        <div 
          ref={(ref) => {
             if (ref) connectors.create(ref, <Titel text="Nieuwe Titel" fontSize={24} color="#1a202c" textAlign="left" fontFamily="inherit" fontWeight="bold" />);
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <Type size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Titel</span>
        </div>

        <div 
          ref={(ref) => {
            if (ref) connectors.create(ref, <Tekst text="Start met typen..." fontSize={14} color="#4a5568" textAlign="left" fontFamily="inherit" fontWeight="normal" />);
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <AlignLeft size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Tekst</span>
        </div>

        <div 
          ref={(ref) => {
            if (ref) connectors.create(ref, <GastInformatie field="firstname" />);
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <User size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Gast Info</span>
        </div>

        <div 
          ref={(ref) => {
            if (ref) connectors.create(ref, <Afbeelding src="" width="100%" align="center" />);
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <ImageIcon size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Afbeelding</span>
        </div>

        {/* Media & Layout */}
        <div className="text-xs font-semibold text-gray-400 mt-4 mb-1">Structuur</div>

        <div 
          ref={(ref) => {
            // Default 2 column layout as starter
            if (ref) connectors.create(ref, 
                <Element is={Rij} canvas gap={2}>
                    <Element is={Kolom} canvas width="50%" padding={8} />
                    <Element is={Kolom} canvas width="50%" padding={8} />
                </Element>
            );
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <Columns size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Sectie (Rij)</span>
        </div>

        <div 
          ref={(ref) => {
            if (ref) connectors.create(ref, <Element is={Kolom} canvas width="auto" padding={8} />);
          }}
          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-500 hover:shadow-sm transition-all shadow-sm"
        >
          <Square size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Losse Kolom</span>
        </div>

      </div>

      <div className="mt-auto p-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-start gap-3">
            <LayoutTemplate size={18} className="text-blue-600 mt-0.5" />
            <div>
                <p className="text-xs font-semibold text-blue-800">Layout Beheer</p>
                <p className="text-xs text-blue-600 mt-1">
                    Sleep een Sectie. Klik erop en gebruik het instellingenpaneel rechts om kolommen (1-4) en verhoudingen te kiezen.
                </p>
            </div>
        </div>
      </div>
    </aside>
  );
};