import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StockItem, StockCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, AlertTriangle, Grid3X3, List, Plus, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '@/services/api';

const categories: StockCategory[] = ['LINEN', 'CLEANING', 'MINIBAR', 'FURNITURE', 'RESTAURANT', 'SPA', 'OTHER'];
const catClass: Record<StockCategory, string> = {
  LINEN: 'bg-blue-100 text-blue-800', CLEANING: 'bg-teal-100 text-teal-800', MINIBAR: 'bg-purple-100 text-purple-800',
  FURNITURE: 'bg-orange-100 text-orange-800', RESTAURANT: 'bg-emerald-100 text-emerald-800', SPA: 'bg-pink-100 text-pink-800', OTHER: 'bg-gray-100 text-gray-800',
};

const StockManagement = () => {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ['stock'], queryFn: stockApi.list });
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<StockCategory | 'ALL'>('ALL');
  const [showLowStock, setShowLowStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [form, setForm] = useState({ itemCode: '', name: '', category: 'LINEN' as StockCategory, quantity: 0, minQuantity: 0, unitPrice: 0, unit: 'pieces', supplier: '', description: '' });

  const lowStockCount = items.filter(i => i.quantity < i.minQuantity).length;

  const createItem = useMutation({
    mutationFn: (data: any) => stockApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock'] }),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => stockApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock'] }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => stockApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stock'] }),
  });

  const openCreate = () => {
    setForm({ itemCode: '', name: '', category: 'LINEN', quantity: 0, minQuantity: 0, unitPrice: 0, unit: 'pieces', supplier: '', description: '' });
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: StockItem) => {
    setForm({ itemCode: item.itemCode, name: item.name, category: item.category, quantity: item.quantity, minQuantity: item.minQuantity, unitPrice: item.unitPrice, unit: item.unit, supplier: item.supplier, description: '' });
    setEditItem(item);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.itemCode || !form.name) {
      toast.error('Item code and name required');
      return;
    }
    try {
      if (editItem) {
        await updateItem.mutateAsync({ id: editItem.id, data: form });
        toast.success('Item updated!');
      } else {
        await createItem.mutateAsync(form);
        toast.success('Item created!');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await deleteItem.mutateAsync(id);
      toast.success('Item deleted!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete item');
    }
  };


  const filtered = useMemo(() => items.filter(i => {
    const ms = i.itemCode.toLowerCase().includes(search.toLowerCase()) || i.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === 'ALL' || i.category === catFilter;
    const ml = !showLowStock || i.quantity < i.minQuantity;
    return ms && mc && ml;
  }), [items, search, catFilter, showLowStock]);

  const getStockStatus = (i: StockItem) => {
    if (i.quantity === 0) return { label: 'Out of Stock', class: 'status-cancelled' };
    if (i.quantity < i.minQuantity) return { label: 'Low Stock', class: 'status-pending' };
    return { label: 'In Stock', class: 'status-available' };
  };

  return (
    <AppLayout breadcrumb="Inventory">
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Stock Management</h2>
          <div className="flex gap-2">
            {hasPermission(['ADMIN']) && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            )}
            <button onClick={() => setShowLowStock(!showLowStock)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showLowStock ? 'bg-warning text-warning-foreground' : 'bg-warning/10 text-warning'}`}>
              <AlertTriangle className="w-4 h-4" /> {lowStockCount} Low Stock
            </button>
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={catFilter} onValueChange={v => setCatFilter(v as any)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Loading stock items...</div>}

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(i => {
              const status = getStockStatus(i);
              const pct = Math.min((i.quantity / Math.max(i.minQuantity * 2, 1)) * 100, 100);
              return (
                <div key={i.id} className="bg-card rounded-xl border p-5 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">{i.itemCode}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`status-badge ${catClass[i.category]}`}>{i.category}</span>
                        <span className={`status-badge ${status.class}`}>{status.label}</span>
                      </div>
                    </div>
                    {hasPermission(['ADMIN']) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded hover:bg-muted">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEdit(i)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(i.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <p className="text-sm">{i.name}</p>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{i.quantity} / {i.minQuantity} (min)</span>
                      <span>{i.unit}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{i.unitPrice.toFixed(2)}€ / unit</span>
                    <span className="font-semibold">{(i.quantity * i.unitPrice).toFixed(2)}€</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{i.supplier}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-xl border overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Qty</th><th>Min</th><th>Price</th><th>Status</th>{hasPermission(['ADMIN']) && <th>Actions</th>}</tr></thead>
              <tbody>
                {filtered.map(i => {
                  const status = getStockStatus(i);
                  return (
                    <tr key={i.id}>
                      <td className="font-bold">{i.itemCode}</td>
                      <td>{i.name}</td>
                      <td><span className={`status-badge ${catClass[i.category]}`}>{i.category}</span></td>
                      <td>{i.quantity}</td>
                      <td>{i.minQuantity}</td>
                      <td>{i.unitPrice.toFixed(2)}€</td>
                      <td><span className={`status-badge ${status.class}`}>{status.label}</span></td>
                      {hasPermission(['ADMIN']) && (
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1 rounded hover:bg-muted">
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEdit(i)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(i.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Stock Item Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Item Code</label>
              <Input value={form.itemCode} onChange={e => setForm({ ...form, itemCode: e.target.value })} placeholder="e.g., LIN001" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as StockCategory })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="e.g., pieces" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Current Qty</label>
                <Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Min. Qty</label>
                <Input type="number" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: Number(e.target.value) })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit Price (€)</label>
                <Input type="number" step="0.01" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Supplier</label>
                <Input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createItem.isPending || updateItem.isPending}>
                {editItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default StockManagement;
