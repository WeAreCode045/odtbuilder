import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Type } from 'lucide-react';

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

  const execCmd = (cmd: string) => {
      document.execCommand(cmd, false, undefined);
  };

  return (
    <div 
      ref={(ref) => { if(ref) connect(drag(ref)) }} 
      className={`w-full relative mb-2 ${selected ? 'outline outline-2 outline-blue-400 z-10' : 'hover:outline hover:outline-1 hover:outline-blue-200'}`}
    >
      {selected && (
          <div className="absolute -top-10 left-0 bg-gray-800 text-white rounded-md shadow-lg flex items-center gap-1 p-1 z-50">
              <button onClick={(e) => { e.preventDefault(); execCmd('bold'); }} className="p-1.5 hover:bg-gray-700 rounded" title="Bold"><Bold size={14}/></button>
              <button onClick={(e) => { e.preventDefault(); execCmd('italic'); }} className="p-1.5 hover:bg-gray-700 rounded" title="Italic"><Italic size={14}/></button>
              <button onClick={(e) => { e.preventDefault(); execCmd('underline'); }} className="p-1.5 hover:bg-gray-700 rounded" title="Underline"><Underline size={14}/></button>
              <div className="w-px h-4 bg-gray-600 mx-1"></div>
              <button onClick={() => setProp((p: any) => p.textAlign = 'left')} className={`p-1.5 hover:bg-gray-700 rounded ${textAlign === 'left' ? 'bg-gray-700' : ''}`}><AlignLeft size={14}/></button>
              <button onClick={() => setProp((p: any) => p.textAlign = 'center')} className={`p-1.5 hover:bg-gray-700 rounded ${textAlign === 'center' ? 'bg-gray-700' : ''}`}><AlignCenter size={14}/></button>
              <button onClick={() => setProp((p: any) => p.textAlign = 'right')} className={`p-1.5 hover:bg-gray-700 rounded ${textAlign === 'right' ? 'bg-gray-700' : ''}`}><AlignRight size={14}/></button>
          </div>
      )}

      <ContentEditable
        html={editableContent}
        disabled={!selected}
        onChange={(e) => {
            setEditableContent(e.target.value);
            setProp((props: TekstProps) => props.text = e.target.value, 500);
        }}
        tagName="div"
        className="p-1 min-h-[1.5em]"
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
  const { actions: { setProp }, fontSize, color, fontFamily, fontWeight } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    color: node.data.props.color,
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
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-gray-700"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Font Familie</label>
        <select
          value={fontFamily}
          onChange={(e) => setProp((props: TekstProps) => props.fontFamily = e.target.value)}
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
    textAlign: 'left',
    fontFamily: 'inherit',
    fontWeight: 'normal',
  },
  related: {
    settings: TekstSettings,
  },
};