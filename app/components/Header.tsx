import React from 'react';
import { useEditor } from '@craftjs/core';
import { Download, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  const { query } = useEditor();

 const handleExport = async () => {
  const json = query.serialize();
  
  try {
    // Vervang dit door de URL van je Easypanel backend service
    const BACKEND_URL = "https://backend-odt.jouwdomein.nl/generate-odt";

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: json }),
    });

    if (!response.ok) throw new Error("Export mislukt");

    // Ontvang het ODT bestand als een blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Automatische download triggeren
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'document.odt');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Fout bij exporteren:", error);
    alert("Er is een fout opgetreden bij het genereren van het ODT bestand.");
  }
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