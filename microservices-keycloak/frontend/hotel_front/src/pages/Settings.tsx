import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Settings = () => {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api');
  const [keycloakUrl, setKeycloakUrl] = useState(import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080');
  const [realm, setRealm] = useState(import.meta.env.VITE_KEYCLOAK_REALM || 'ecommerce-rta');
  const [env, setEnv] = useState('Development');
  const [debug, setDebug] = useState(false);

  const [emailBooking, setEmailBooking] = useState(true);
  const [emailReview, setEmailReview] = useState(true);
  const [emailStock, setEmailStock] = useState(true);
  const [emailEvent, setEmailEvent] = useState(false);

  return (
    <AppLayout breadcrumb="Settings">
      <div className="max-w-3xl animate-fade-in">
        <h2 className="text-xl font-bold mb-6">Settings & Configuration</h2>

        <Tabs defaultValue="system">
          <TabsList>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="email">Email Notifications</TabsTrigger>
            <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-6 space-y-4">
            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div><label className="text-sm font-medium mb-1 block">API Base URL</label>
                <Input value={apiUrl} onChange={e => setApiUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Base URL for all microservice requests</p>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Keycloak URL</label>
                <Input value={keycloakUrl} onChange={e => setKeycloakUrl(e.target.value)} />
              </div>
              <div><label className="text-sm font-medium mb-1 block">Realm Name</label>
                <Input value={realm} onChange={e => setRealm(e.target.value)} />
              </div>
              <div><label className="text-sm font-medium mb-1 block">Environment</label>
                <Select value={env} onValueChange={setEnv}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Staging">Staging</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={debug} onCheckedChange={setDebug} />
                <label className="text-sm font-medium">Debug Mode</label>
              </div>
              <Button onClick={() => toast.success('Settings saved!')} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Save Settings</Button>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <div className="bg-card rounded-xl border overflow-hidden">
              <table className="data-table">
                <thead><tr><th>Role</th><th>Users</th><th>Create</th><th>Read</th><th>Update</th><th>Delete</th><th>Approve</th></tr></thead>
                <tbody>
                  {[
                    { role: 'ADMIN', users: 1, perms: [true, true, true, true, true] },
                    { role: 'MANAGER', users: 1, perms: [true, true, true, false, true] },
                    { role: 'STAFF', users: 2, perms: [false, true, true, false, false] },
                    { role: 'CLIENT', users: 2, perms: [false, true, false, false, false] },
                  ].map(r => (
                    <tr key={r.role}>
                      <td className="font-semibold">{r.role}</td>
                      <td>{r.users}</td>
                      {r.perms.map((p, i) => (
                        <td key={i}><Switch checked={p} disabled className="scale-75" /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <div className="bg-card rounded-xl border p-6 space-y-5">
              {[
                { label: 'Booking confirmation emails', state: emailBooking, set: setEmailBooking },
                { label: 'Review reminder emails', state: emailReview, set: setEmailReview },
                { label: 'Low stock alert emails', state: emailStock, set: setEmailStock },
                { label: 'Event reminder emails', state: emailEvent, set: setEmailEvent },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Switch checked={item.state} onCheckedChange={item.set} />
                </div>
              ))}
              <Button onClick={() => toast.success('Notification settings saved!')} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Save</Button>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="mt-6">
            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Last Backup</p>
                  <p className="text-xs text-muted-foreground">26 Feb 2026 14:30</p>
                </div>
                <span className="status-badge status-available">Successful</span>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => toast.success('Backup started!')} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">Backup Now</Button>
                <Button variant="outline">Download Backup</Button>
                <Button variant="outline">Restore from Backup</Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Size</th><th>Status</th></tr></thead>
                  <tbody>
                    {[
                      { date: '2026-02-26 14:30', size: '45.2 MB', ok: true },
                      { date: '2026-02-19 14:30', size: '44.8 MB', ok: true },
                      { date: '2026-02-12 14:30', size: '43.1 MB', ok: true },
                    ].map(b => (
                      <tr key={b.date}><td>{b.date}</td><td>{b.size}</td><td><span className="status-badge status-available">OK</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
