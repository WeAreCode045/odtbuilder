import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { Kolom } from './Kolom';

export const Rij = ({ children, gap = 1, my = 2, backgroundColor = 'transparent' }: { children?: React.ReactNode, gap: number, my?: number, backgroundColor?: string }) => {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    return (
        <div 
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={`flex flex-row flex-nowrap w-full relative group ${selected ? 'outline outline-2 outline-blue-400' : 'hover:outline hover:outline-1 hover:outline-blue-200'}`}
            style={{ 
                gap: `${gap}rem`,
                marginTop: `${my * 0.25}rem`,
                marginBottom: `${my * 0.25}rem`,
                backgroundColor: backgroundColor,
            }} 
        >
            {children}
            {(!children || (Array.isArray(children) && children.length === 0)) && (
                <div className="w-full p-4 bg-gray-50 border border-dashed border-gray-300 text-center text-xs text-gray-400">
                    Lege Sectie (Selecteer layout in instellingen)
                </div>
            )}
        </div>
    );
};

// Define Layout Presets
const PRESETS: Record<number, string[][]> = {
    1: [['100%']],
    2: [
        ['50%', '50%'], 
        ['66.66%', '33.33%'], 
        ['33.33%', '66.66%'], 
        ['25%', '75%'], 
        ['75%', '25%']
    ],
    3: [
        ['33.33%', '33.33%', '33.33%'], 
        ['50%', '25%', '25%'], 
        ['25%', '25%', '50%'], 
        ['25%', '50%', '25%']
    ],
    4: [
        ['25%', '25%', '25%', '25%']
    ]
};

const RijSettings = () => {
    const { actions: { setProp }, gap, my, backgroundColor, id } = useNode((node) => ({
        gap: node.data.props.gap,
        my: node.data.props.my,
        backgroundColor: node.data.props.backgroundColor,
        id: node.id
    }));

    const { actions, query, nodes } = useEditor((state) => ({
        nodes: state.nodes
    }));
    
    const currentNode = nodes[id];
    const childIds = currentNode?.data?.nodes || []; 
    const currentCols = childIds.length;

    const updateColumnCount = (count: number) => {
        if (count > currentCols) {
            const needed = count - currentCols;
            for (let i = 0; i < needed; i++) {
                const node = query.parseReactElement(<Element is={Kolom} canvas width="auto" padding={8} />).toNodeTree();
                actions.addNodeTree(node, id);
            }
        } else if (count < currentCols) {
            const toRemove = currentCols - count;
            for (let i = 0; i < toRemove; i++) {
                const removeId = childIds[childIds.length - 1 - i];
                actions.delete(removeId);
            }
        }
    };

    const applyPreset = (widths: string[]) => {
        childIds.forEach((childId, index) => {
            if (widths[index]) {
                actions.setProp(childId, (props: any) => {
                    props.width = widths[index];
                });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-medium">Aantal Kolommen</label>
                <div className="flex bg-gray-100 p-1 rounded-md">
                    {[1, 2, 3, 4].map(num => (
                        <button
                            key={num}
                            onClick={() => updateColumnCount(num)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${
                                currentCols === num 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            {PRESETS[currentCols] && (
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 font-medium">Layout Preset</label>
                    <div className="grid grid-cols-2 gap-2">
                        {PRESETS[currentCols].map((preset, idx) => (
                            <button
                                key={idx}
                                onClick={() => applyPreset(preset)}
                                className="flex h-8 w-full gap-0.5 border border-gray-200 rounded overflow-hidden hover:border-blue-400 hover:ring-1 hover:ring-blue-100 transition-all bg-gray-50"
                                title={preset.join(" - ")}
                            >
                                {preset.map((width, wIdx) => (
                                    <div 
                                        key={wIdx} 
                                        className="h-full bg-blue-200"
                                        style={{ width: width, borderRight: wIdx < preset.length - 1 ? '1px solid white' : 'none' }}
                                    ></div>
                                ))}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Tussenruimte (rem)</label>
                    <input 
                        type="number" 
                        step="0.25"
                        value={gap}
                        onChange={(e) => setProp((props: any) => props.gap = parseFloat(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-700"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Marge Boven/Onder (units)</label>
                    <input 
                        type="number" 
                        value={my}
                        onChange={(e) => setProp((props: any) => props.my = parseFloat(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-700"
                    />
                </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Achtergrondkleur</label>
                    <div className="flex gap-2">
                        <input 
                            type="color" 
                            value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor} 
                            onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                        />
                         <input 
                            type="text" 
                            value={backgroundColor} 
                            onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
                             className="flex-1 p-2 border border-gray-300 rounded text-sm text-gray-700"
                             placeholder="transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

Rij.craft = {
    displayName: 'Sectie',
    props: {
        gap: 1,
        my: 2,
        backgroundColor: 'transparent'
    },
    related: {
        settings: RijSettings,
    },
};