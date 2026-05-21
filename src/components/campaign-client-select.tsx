"use client";

import { useState } from "react";

type Client = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
};

export function CampaignClientSelect({ clients }: { clients: Client[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = selected.size === clients.length && clients.length > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clients.map((c) => c.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 hover:bg-slate-100">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm font-semibold text-slate-700">
          Tout sélectionner ({clients.length})
        </span>
      </label>

      <div className="space-y-1">
        {clients.map((client) => (
          <label
            key={client.id}
            className="flex items-center gap-3 cursor-pointer rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              name="clientIds"
              value={client.id}
              checked={selected.has(client.id)}
              onChange={() => toggleOne(client.id)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <div className="text-sm">
              <p className="font-medium text-slate-900">{client.companyName}</p>
              <p className="text-slate-500">{client.contactName} · {client.email}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
