import React from 'react';
import { useEditor } from '@craftjs/core';
import { Settings2 } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { selected, actions } = useEditor((state, query) => {
    const [currentNodeId] = state.events.selected;
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.displayName,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      };
    }

    return {
      selected,
    };
  });

  return (
    <aside className="w-72 bg-white border-l border-gray-200 flex flex-col z-10">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Instellingen</h2>
        <Settings2 size={16} className="text-gray-400" />
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {selected.name}
                </span>
                {selected.isDeletable && (
                    <button
                        className="text-xs text-red-500 hover:text-red-700 underline"
                        onClick={() => {
                            actions.delete(selected.id);
                        }}
                    >
                        Verwijderen
                    </button>
                )}
            </div>
            
            <div className="border-t border-gray-100 my-2"></div>
            
            {selected.settings && React.createElement(selected.settings)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-sm text-gray-400">Selecteer een component op het canvas om instellingen te wijzigen.</p>
          </div>
        )}
      </div>
    </aside>
  );
};