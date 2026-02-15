import React from 'react';
import { useNode } from '@craftjs/core';

export const Rij = ({ children, gap = 1, my = 2 }: { children?: React.ReactNode, gap: number, my?: number }) => {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    return (
        <div 
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={`flex flex-row w-full ${selected ? 'outline outline-2 outline-blue-400' : 'hover:outline hover:outline-1 hover:outline-blue-200'}`}
            style={{ 
                gap: `${gap}rem`,
                marginTop: `${my * 0.25}rem`,
                marginBottom: `${my * 0.25}rem`
            }} 
        >
            {children}
            {(!children || (Array.isArray(children) && children.length === 0)) && (
                <div className="w-full p-4 bg-gray-50 border border-dashed border-gray-300 text-center text-xs text-gray-400">
                    Lege Rij (Sleep Kolommen hier)
                </div>
            )}
        </div>
    );
};

const RijSettings = () => {
    const { actions: { setProp }, gap, my } = useNode((node) => ({
        gap: node.data.props.gap,
        my: node.data.props.my
    }));

    return (
        <div className="space-y-4">
             <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Tussenruimte Kolommen (rem)</label>
                <input 
                    type="number" 
                    step="0.25"
                    value={gap}
                    onChange={(e) => setProp((props: any) => props.gap = parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Marge Boven/Onder (units)</label>
                <input 
                    type="number" 
                    value={my}
                    onChange={(e) => setProp((props: any) => props.my = parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                />
                <p className="text-[10px] text-gray-400">1 unit = 0.25rem (4px)</p>
            </div>
        </div>
    );
};

Rij.craft = {
    displayName: 'Rij',
    props: {
        gap: 1,
        my: 2,
    },
    related: {
        settings: RijSettings,
    },
};