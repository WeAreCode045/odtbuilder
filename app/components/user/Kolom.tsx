import React from 'react';
import { useNode } from '@craftjs/core';

export const Kolom = ({ children, width = 'auto', padding = 8 }: { children?: React.ReactNode, width: string, padding?: number }) => {
    const { connectors: { connect, drag }, selected } = useNode((node) => ({
        selected: node.events.selected,
    }));

    return (
        <div 
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={`flex flex-col min-h-[50px] border border-dashed border-gray-200 ${selected ? 'outline outline-2 outline-blue-400' : ''}`}
            style={{ 
                width: width, 
                flexGrow: width === 'auto' ? 1 : 0, 
                flexShrink: 0,
                padding: `${padding}px`
            }}
        >
            {children}
            {(!children || (Array.isArray(children) && children.length === 0)) && (
                <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-300 text-xs py-4">
                    Kolom
                </div>
            )}
        </div>
    );
};

const KolomSettings = () => {
     const { actions: { setProp }, width, padding } = useNode((node) => ({
        width: node.data.props.width,
        padding: node.data.props.padding
    }));

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Breedte</label>
                <select 
                    value={width}
                    onChange={(e) => setProp((props: any) => props.width = e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                >
                    <option value="100%">100% (Volledig)</option>
                    <option value="75%">75% (3/4)</option>
                    <option value="66.66%">66% (2/3)</option>
                    <option value="50%">50% (1/2)</option>
                    <option value="33.33%">33% (1/3)</option>
                    <option value="25%">25% (1/4)</option>
                    <option value="auto">Auto (Vul rest)</option>
                </select>
            </div>
             <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Padding (px)</label>
                <input 
                    type="number"
                    value={padding}
                    onChange={(e) => setProp((props: any) => props.padding = parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                />
            </div>
        </div>
    );
}

Kolom.craft = {
    displayName: 'Kolom',
    props: {
        width: 'auto',
        padding: 8,
    },
    related: {
        settings: KolomSettings,
    },
};