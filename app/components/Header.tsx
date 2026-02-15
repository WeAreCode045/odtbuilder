import React from 'react';
import { useEditor } from '@craftjs/core';
import { Download, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  const { query } = useEditor();

  const handleExport = () => {
    // Serialize the current state to JSON
    const json = query.serialize();
    console.log('Document JSON Output:', json);
    alert('Document JSON exported to console (F12)');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-md text-white">
          <FileText size={20} />
        </div>
        <h1 className="font-semibold text-gray-800 text-lg">DocuBuild A4</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Download size={16} />
          Exporteer JSON
        </button>
      </div>
    </header>
  );
};