import React from 'react';
import { useEditor } from '@craftjs/core';
import { Download, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  const { query } = useEditor();

  const handleExport = async () => {
    // 1. Serialize de huidige Craft.js staat naar een JSON-object
    const json = query.serialize();
    
    // 2. Bepaal de backend URL op basis van de huidige omgeving
    const isLocal = window.location.hostname === 'localhost';
    const BACKEND_URL = isLocal 
      ? "http://localhost:8000/generate-odt" 
      : "https://odt-generator.code045.nl/generate-odt";

    try {
      // 3. Verstuur de data naar de Python backend
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          // Zorg dat we een object sturen en geen dubbel-geserialiseerde string
          data: typeof json === 'string' ? JSON.parse(json) : json 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Export mislukt");
      }

      // 4. Ontvang het ODT bestand als een blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // 5. Forceer een download in de browser
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document.odt');
      document.body.appendChild(link);
      link.click();
      
      // Ruim de tijdelijke URL en het element op
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Fout bij exporteren:", error);
      alert(`Er is een fout opgetreden: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
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
          Exporteer ODT
        </button>
      </div>
    </header>
  );
};