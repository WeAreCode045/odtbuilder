import React from 'react';
import { useNode } from '@craftjs/core';
import { Image as ImageIcon } from 'lucide-react';

export const Afbeelding = ({ src, width }: { src: string; width: string }) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }} 
      className={`relative my-2 ${selected ? 'ring-2 ring-blue-500' : 'hover:outline hover:outline-1 hover:outline-blue-200'}`}
      style={{ width: width || '100%', display: 'inline-block' }}
    >
      {src ? (
        <img src={src} className="w-full h-auto block" alt="Document image" />
      ) : (
        <div className="w-full h-32 bg-gray-50 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
          <ImageIcon size={32} className="mb-2 opacity-50" />
          <span className="text-xs">Afbeelding Selecteren</span>
        </div>
      )}
    </div>
  );
};

export const AfbeeldingSettings = () => {
    const { actions: { setProp }, src, width } = useNode((node) => ({
        src: node.data.props.src,
        width: node.data.props.width,
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                setProp((props: any) => props.src = result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
             <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Bron (URL)</label>
                <input 
                    type="text" 
                    value={src} 
                    onChange={(e) => setProp((props: any) => props.src = e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                    placeholder="https://..."
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Of upload bestand</label>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>
             <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Breedte</label>
                <select 
                    value={width} 
                    onChange={(e) => setProp((props: any) => props.width = e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                >
                    <option value="100%">100%</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                    <option value="33%">33%</option>
                    <option value="25%">25%</option>
                    <option value="auto">Auto</option>
                </select>
            </div>
        </div>
    )
}

Afbeelding.craft = {
    displayName: 'Afbeelding',
    props: {
        src: '',
        width: '100%',
    },
    related: {
        settings: AfbeeldingSettings,
    },
};