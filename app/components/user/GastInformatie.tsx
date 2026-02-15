import React from 'react';
import { useNode } from '@craftjs/core';

interface GastInfoProps {
  field: 'firstname' | 'lastname' | 'email';
}

const FIELD_LABELS = {
    firstname: 'Voornaam',
    lastname: 'Achternaam',
    email: 'Emailadres'
};

const FIELD_VARS = {
    firstname: '$guest.firstname',
    lastname: '$guest.lastname',
    email: '$guest.email'
};

export const GastInformatie = ({ field }: GastInfoProps) => {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div 
      ref={(ref) => { if(ref) connect(drag(ref)) }} 
      className={`inline-block my-1 ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300 font-mono text-sm select-none">
        {`{{ ${FIELD_LABELS[field]} }}`}
      </span>
    </div>
  );
};

const GastInfoSettings = () => {
  const { actions: { setProp }, field } = useNode((node) => ({
    field: node.data.props.field,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Kies Veld</label>
        <select
            value={field}
            onChange={(e) => setProp((props: GastInfoProps) => props.field = e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
        >
            <option value="firstname">Voornaam</option>
            <option value="lastname">Achternaam</option>
            <option value="email">Email</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">Data key: {FIELD_VARS[field]}</p>
      </div>
    </div>
  );
};

GastInformatie.craft = {
  displayName: 'Gast Informatie',
  props: {
    field: 'firstname',
  },
  related: {
    settings: GastInfoSettings,
  },
};