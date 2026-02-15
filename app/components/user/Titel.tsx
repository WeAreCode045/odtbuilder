import React, { useEffect, useState } from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

interface TitelProps {
  text: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export const Titel = ({ text, fontSize, color, textAlign }: TitelProps) => {
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
        style={{ fontSize: `${fontSize}px`, color: color, fontWeight: 'bold', outline: 'none' }}
      />
    </div>
  );
};

const TitelSettings = () => {
  const { actions: { setProp }, fontSize, color, textAlign } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
    textAlign: node.data.props.textAlign,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Lettergrootte (px)</label>
        <input 
          type="number" 
          value={fontSize} 
          onChange={(e) => setProp((props: TitelProps) => props.fontSize = parseInt(e.target.value, 10))}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
        />
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
                className="flex-1 p-2 border border-gray-300 rounded text-sm uppercase"
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
  },
  related: {
    settings: TitelSettings,
  },
};