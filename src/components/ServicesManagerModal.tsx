import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Tag, Search, Sparkles, RotateCcw } from 'lucide-react';
import { SalonService } from '../types';
import { DEFAULT_SERVICES } from '../utils/storage';

interface ServicesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: SalonService[];
  onSaveServices: (updated: SalonService[]) => void;
}

export const ServicesManagerModal: React.FC<ServicesManagerModalProps> = ({
  isOpen,
  onClose,
  services,
  onSaveServices,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<SalonService['category']>('hair');

  // Currently editing service state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState<SalonService['category']>('hair');

  if (!isOpen) return null;

  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const price = parseFloat(newServicePrice) || 0;

    const newService: SalonService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      price: price,
      category: newServiceCategory,
    };

    onSaveServices([...services, newService]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleStartEdit = (service: SalonService) => {
    setEditingId(service.id);
    setEditName(service.name);
    setEditPrice(service.price.toString());
    setEditCategory(service.category);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    const price = parseFloat(editPrice) || 0;

    const updated = services.map((s) =>
      s.id === id ? { ...s, name: editName.trim(), price, category: editCategory } : s
    );

    onSaveServices(updated);
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the service list?`)) {
      onSaveServices(services.filter((s) => s.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset services and charges to Hairport Salon standard price list?')) {
      onSaveServices(DEFAULT_SERVICES);
    }
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Edit Services & Charges
              </h3>
              <p className="text-xs text-slate-400">
                Add new salon services, update rates, or modify charges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Service Form Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800">
          <form onSubmit={handleAddNewService} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add New Service
              </span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
                title="Restore default standard services"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  required
                  placeholder="Service Name (e.g. Keratin Smooth, Beard Dye)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-3">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="Charge / Rate"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400 font-semibold"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Service</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search bar & list */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
            {filteredServices.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No matching service found.
              </div>
            ) : (
              filteredServices.map((service) => {
                const isEditing = editingId === service.id;

                if (isEditing) {
                  return (
                    <div
                      key={service.id}
                      className="p-3 rounded-xl bg-slate-800 border-2 border-amber-400/80 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-7">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Service Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Charge (₹)</label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-400 font-bold outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(service.id)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs"
                            title="Save Changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white text-xs"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 text-xs sm:text-sm">
                        {service.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm sm:text-base font-extrabold text-amber-400 font-mono">
                        ₹{service.price}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(service)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700 transition"
                          title="Edit Service Name & Charge"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id, service.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total Services: <strong className="text-amber-400">{services.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
