import React, { useEffect, useState } from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { Bold } from 'lucide-react';

interface TitelProps {
  text: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
  fontWeight: string;
}

export const Titel = ({ 
  text, 
  fontSize, 
  color, 
  textAlign,
  fontFamily = 'inherit',
  fontWeight = 'bold'
}: TitelProps) => {
  const { connectors: { connect, drag }, actions: { setProp }, selected } = useNode((node) => ({
      selected: node.events.selected,
  }));
  
  const [editableContent, setEditableContent] = useState(text);

  useEffect(() => {
      setEditableContent(text);
  }, [text]);

  return (
    <div 
      ref={(ref) => { if(ref) connect(drag(ref)) }} 
      className={`w-full mb-2 ${selected ? 'outline outline-2 outline-blue-400' : 'hover:outline hover:outline-1 hover:outline-blue-200'}`}
      style={{ textAlign }}
    >
      <ContentEditable
        html={editableContent} 
        disabled={!selected}
        onChange={(e) => {
            setEditableContent(e.target.value);
            setProp((props: TitelProps) => props.text = e.target.value, 500);
        }}
        tagName="h2"
        style={{ 
          fontSize: `${fontSize}px`, 
          color: color, 
          fontWeight: fontWeight, 
          fontFamily: fontFamily, 
          outline: 'none' 
        }}
      />
    </div>
  );
};

const TitelSettings = () => {
  const { actions: { setProp }, fontSize, color, textAlign, fontFamily, fontWeight } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
    textAlign: node.data.props.textAlign,
    fontFamily: node.data.props.fontFamily,
    fontWeight: node.data.props.fontWeight,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Lettergrootte (px)</label>
        <input 
          type="number" 
          value={fontSize} 
          onChange={(e) => setProp((props: TitelProps) => props.fontSize = parseInt(e.target.value, 10))}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-gray-700"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Font Familie</label>
        <select
          value={fontFamily}
          onChange={(e) => setProp((props: TitelProps) => props.fontFamily = e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-700"
        >
            <option value="inherit">Standaard</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
        </select>
      </div>

       <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Dikte</label>
        <div className="flex items-center gap-2">
            <button
                onClick={() => setProp((props: TitelProps) => props.fontWeight = props.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-2 rounded border ${fontWeight === 'bold' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-600'}`}
            >
                <Bold size={16} />
            </button>
            <span className="text-xs text-gray-400">{fontWeight === 'bold' ? 'Vetgedrukt' : 'Normaal'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Kleur</label>
        <div className="flex gap-2">
            <input 
                type="color" 
                value={color} 
                onChange={(e) => setProp((props: TitelProps) => props.color = e.target.value)}
                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
            />
            <input 
                type="text" 
                value={color}
                onChange={(e) => setProp((props: TitelProps) => props.color = e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded text-sm uppercase text-gray-700"
            />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Uitlijning</label>
        <div className="flex rounded border border-gray-300 overflow-hidden">
            {['left', 'center', 'right'].map((align) => (
                <button
                    key={align}
                    onClick={() => setProp((props: TitelProps) => props.textAlign = align as any)}
                    className={`flex-1 py-2 text-xs capitalize hover:bg-gray-50 ${textAlign === align ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'}`}
                >
                    {align === 'left' ? 'Links' : align === 'center' ? 'Midden' : 'Rechts'}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

Titel.craft = {
  displayName: 'Titel',
  props: {
    text: 'Titel',
    fontSize: 26,
    color: '#1a202c',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontWeight: 'bold',
  },
  related: {
    settings: TitelSettings,
  },
};