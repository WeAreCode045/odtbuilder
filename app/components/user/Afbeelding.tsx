import React from 'react';
import { useNode } from '@craftjs/core';
import { Image as ImageIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export const Afbeelding = ({ src, width, align = 'center' }: { src: string; width: string; align?: 'left' | 'center' | 'right' }) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return (
    <div 
      ref={(ref) => { if (ref) connect(drag(ref)); }} 
      className={`relative my-2 flex ${selected ? 'ring-2 ring-blue-500' : 'hover:outline hover:outline-1 hover:outline-blue-200'}`}
      style={{ justifyContent }}
    >
      <div style={{ width: width || '100%', maxWidth: '100%' }}>
        {src ? (
          <img src={src} className="w-full h-auto block" alt="Document image" />
        ) : (
          <div className="w-full h-32 bg-gray-50 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
            <ImageIcon size={32} className="mb-2 opacity-50" />
            <span className="text-xs">Afbeelding Selecteren</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AfbeeldingSettings = () => {
    const { actions: { setProp }, src, width, align } = useNode((node) => ({
        src: node.data.props.src,
        width: node.data.props.width,
        align: node.data.props.align,
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
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-700"
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
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-700"
                >
                    <option value="100%">100%</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                    <option value="33%">33%</option>
                    <option value="25%">25%</option>
                    <option value="auto">Auto</option>
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Uitlijning</label>
                <div className="flex rounded border border-gray-300 overflow-hidden bg-white">
                    {[
                        { val: 'left', icon: <AlignLeft size={14}/> }, 
                        { val: 'center', icon: <AlignCenter size={14}/> }, 
                        { val: 'right', icon: <AlignRight size={14}/> }
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => setProp((props: any) => props.align = opt.val)}
                            className={`flex-1 py-2 flex items-center justify-center hover:bg-gray-50 ${align === opt.val ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                        >
                            {opt.icon}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

Afbeelding.craft = {
    displayName: 'Afbeelding',
    props: {
        src: '',
        width: '100%',
        align: 'center',
    },
    related: {
        settings: AfbeeldingSettings,
    },
};