import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { User, Role } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';

const roles: Role[] = ['ADMIN', 'MANAGER', 'STAFF', 'CLIENT'];

const UsersManagement = () => {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', phone: '', role: 'CLIENT' as Role, active: true });

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  const createUser = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) => usersApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const startCreate = () => {
    setForm({ email: '', firstName: '', lastName: '', phone: '', role: 'CLIENT', active: true });
    setEditingUser(null);
    setIsCreating(true);
  };

  const startEdit = (u: User) => {
    setForm({ email: u.email, firstName: u.firstName, lastName: u.lastName, phone: u.phone, role: u.role, active: u.active });
    setEditingUser(u);
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!form.email || !form.firstName || !form.lastName) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      if (editingUser) {
        await updateUser.mutateAsync({ id: editingUser.id, payload: form });
        toast.success('User updated successfully!');
      } else {
        await createUser.mutateAsync(form);
        toast.success('User created successfully!');
      }
      setIsCreating(false);
      setEditingUser(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save user');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser.mutateAsync(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete user');
    }
  };

  return (
    <AppLayout breadcrumb="Users Management">
      <div className="flex gap-6 animate-fade-in">
        {/* Users List */}
        <div className={`${isCreating ? 'flex-[3]' : 'flex-1'} space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Users</h2>
            {hasPermission(['ADMIN']) && (
              <Button onClick={startCreate} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Create User
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRoleFilter('ALL')} className={`filter-chip ${roleFilter === 'ALL' ? 'selected' : ''}`}>All</button>
              {roles.map(r => (
                <button key={r} onClick={() => setRoleFilter(r)} className={`filter-chip ${roleFilter === r ? 'selected' : ''}`}>{r}</button>
              ))}
            </div>
          </div>

          {isLoading && <div className="text-sm text-muted-foreground">Loading users...</div>}

          {/* Table */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Email</th><th>First Name</th><th>Last Name</th><th>Phone</th><th>Role</th><th>Status</th>
                    {hasPermission(['ADMIN']) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td className="font-medium">{u.email}</td>
                      <td>{u.firstName}</td>
                      <td>{u.lastName}</td>
                      <td>{u.phone}</td>
                      <td><span className="status-badge bg-muted text-foreground">{u.role}</span></td>
                      <td><span className={`status-badge ${u.active ? 'status-available' : 'status-cancelled'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                      {hasPermission(['ADMIN']) && (
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(u)} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {isCreating && hasPermission(['ADMIN']) && (
          <div className="flex-[2] animate-fade-in">
            <div className="bg-card rounded-xl border p-6 sticky top-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">{editingUser ? `Edit User` : 'Create New User'}</h3>
                <button onClick={() => { setIsCreating(false); setEditingUser(null); }} className="p-1 rounded hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email *</label>
                  <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@hotel.com" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">First Name *</label>
                    <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Last Name *</label>
                    <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+33..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Role</label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as Role }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
                  <label className="text-sm font-medium">Active</label>
                </div>
                <Button onClick={handleSave} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  {editingUser ? 'Update User' : 'Save User'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default UsersManagement;
