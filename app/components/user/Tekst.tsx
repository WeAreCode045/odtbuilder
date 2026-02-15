import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Type } from 'lucide-react';

interface TekstProps {
  text: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontFamily: string;
  fontWeight: string;
}

export const Tekst = ({ 
  text, 
  fontSize, 
  color, 
  textAlign = 'left',
  fontFamily = 'inherit',
  fontWeight = 'normal'
}: TekstProps) => {
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
        style={{ 
          fontSize: `${fontSize}px`, 
          color: color, 
          textAlign: textAlign, 
          fontFamily: fontFamily,
          fontWeight: fontWeight,
          lineHeight: '1.5', 
          outline: 'none' 
        }}
      />
    </div>
  );
};

const TekstSettings = () => {
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
          onChange={(e) => setProp((props: TekstProps) => props.fontSize = parseInt(e.target.value, 10))}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Font Familie</label>
        <select
          value={fontFamily}
          onChange={(e) => setProp((props: TekstProps) => props.fontFamily = e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
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
                onClick={() => setProp((props: TekstProps) => props.fontWeight = props.fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`p-2 rounded border ${fontWeight === 'bold' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-600'}`}
            >
                <Bold size={16} />
            </button>
            <span className="text-xs text-gray-400">{fontWeight === 'bold' ? 'Vetgedrukt' : 'Normaal'}</span>
        </div>
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

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Uitlijning</label>
        <div className="flex rounded border border-gray-300 overflow-hidden bg-white">
            {[
                { val: 'left', icon: <AlignLeft size={14}/> }, 
                { val: 'center', icon: <AlignCenter size={14}/> }, 
                { val: 'right', icon: <AlignRight size={14}/> },
                { val: 'justify', icon: <AlignJustify size={14}/> }
            ].map((opt) => (
                <button
                    key={opt.val}
                    onClick={() => setProp((props: TekstProps) => props.textAlign = opt.val as any)}
                    className={`flex-1 py-2 flex items-center justify-center hover:bg-gray-50 ${textAlign === opt.val ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                >
                    {opt.icon}
                </button>
            ))}
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
    textAlign: 'left',
    fontFamily: 'inherit',
    fontWeight: 'normal',
  },
  related: {
    settings: TekstSettings,
  },
};