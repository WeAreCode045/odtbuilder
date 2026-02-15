import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

interface TekstProps {
  text: string;
  fontSize: number;
  color: string;
}

export const Tekst = ({ text, fontSize, color }: TekstProps) => {
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
      className={`w-full mb-2 p-1 ${selected ? 'outline outline-2 outline-blue-400' : 'hover:outline hover:outline-1 hover:outline-blue-200'}`}
    >
      <ContentEditable
        html={editableContent}
        disabled={!selected}
        onChange={(e) => {
            setEditableContent(e.target.value);
            setProp((props: TekstProps) => props.text = e.target.value, 500);
        }}
        tagName="p"
        style={{ fontSize: `${fontSize}px`, color: color, lineHeight: '1.5', outline: 'none' }}
      />
    </div>
  );
};

const TekstSettings = () => {
  const { actions: { setProp }, fontSize, color } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
  }));

  return (
    <div className="space-y-4">
       <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Lettergrootte (px)</label>
        <input 
          type="number" 
          value={fontSize} 
          onChange={(e) => setProp((props: TekstProps) => props.fontSize = parseInt(e.target.value, 10))}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

       <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Tekstkleur</label>
        <div className="flex gap-2">
            <input 
                type="color" 
                value={color} 
                onChange={(e) => setProp((props: TekstProps) => props.color = e.target.value)}
                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
            />
        </div>
      </div>
    </div>
  );
};

Tekst.craft = {
  displayName: 'Tekst',
  props: {
    text: 'Schrijf hier je tekst...',
    fontSize: 14,
    color: '#4a5568',
  },
  related: {
    settings: TekstSettings,
  },
};