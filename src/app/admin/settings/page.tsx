'use client';
import { useEffect, useState } from 'react';
import {
  Settings, Store, DollarSign, AlertTriangle,
  Users, Loader2, Check, Save, Bell, Shield,
  Mail, Truck,
  RefreshCw, Trash2, Database,
  Clock,
} from 'lucide-react';

interface SettingsData {
  storeName: string;
  contactEmail: string;
  currency: string;
  currencySymbol: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  ordersPerPage: number;
  // New fields
  storeDescription: string;
  storeUrl: string;
  taxRate: number;
  freeShippingThreshold: number;
  enableEmailNotifications: boolean;
  newOrderNotification: boolean;
  lowStockNotification: boolean;
  lowStockThreshold: number;
  enableReviews: boolean;
  requireApproval: boolean;
  maxOrderItems: number;
  sessionTimeout: number;
  timezone: string;
}

const DEFAULT: SettingsData = {
  storeName: 'My Store',
  contactEmail: 'admin@mystore.com',
  currency: 'USD',
  currencySymbol: '$',
  maintenanceMode: false,
  allowRegistrations: true,
  ordersPerPage: 20,
  storeDescription: '',
  storeUrl: '',
  taxRate: 0,
  freeShippingThreshold: 0,
  enableEmailNotifications: true,
  newOrderNotification: true,
  lowStockNotification: true,
  lowStockThreshold: 5,
  enableReviews: true,
  requireApproval: false,
  maxOrderItems: 50,
  sessionTimeout: 30,
  timezone: 'UTC',
};

function Toggle({ on, onToggle, disabled = false }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F3460]/30 disabled:opacity-50 disabled:cursor-not-allowed ${
        on ? 'bg-[#0F3460]' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
          on ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function Section({ title, description, icon: Icon, children, variant = 'default' }: {
  title: string;
  description?: string;
  icon: any;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
      variant === 'danger' ? 'border-red-200' : 'border-neutral-100'
    }`}>
      <div className={`px-6 py-4 border-b flex items-center gap-3 ${
        variant === 'danger' ? 'border-red-100 bg-red-50/50' : 'border-neutral-100'
      }`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          variant === 'danger' ? 'bg-red-100' : 'bg-neutral-100'
        }`}>
          <Icon className={`h-4.5 w-4.5 ${variant === 'danger' ? 'text-red-600' : 'text-neutral-600'}`} />
        </div>
        <div>
          <h2 className={`text-[15px] font-bold ${variant === 'danger' ? 'text-red-700' : 'text-[#1A1A2E]'}`}>
            {title}
          </h2>
          {description && (
            <p className="text-[11px] text-neutral-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, description, children, inline = true }: {
  label: string;
  description?: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <label className="text-sm font-semibold text-neutral-800">{label}</label>
          {description && <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{description}</p>}
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
    );
  }
  return (
    <div>
      <label className="text-sm font-semibold text-neutral-800 block mb-1.5">{label}</label>
      {description && <p className="text-xs text-neutral-400 mb-2 leading-relaxed">{description}</p>}
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [showDangerConfirm, setShowDangerConfirm] = useState<string | null>(null);
  const [dangerLoading, setDangerLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => { if (data.settings) setForm({ ...DEFAULT, ...data.settings }); })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to save settings');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDangerAction = async (_action: string) => {
    setDangerLoading(true);
    // Simulate the action (since these are disabled in the API)
    await new Promise(r => setTimeout(r, 1500));
    setDangerLoading(false);
    setShowDangerConfirm(null);
  };

  const inputClass =
    'px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all bg-white w-full sm:w-64';

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'pricing', label: 'Pricing & Tax', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#0F3460]/20 rounded-full" />
            <div className="w-12 h-12 border-4 border-[#0F3460] border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-600">Loading settings</p>
            <p className="text-xs text-neutral-400 mt-0.5">Fetching configuration…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#1A1A2E] tracking-tight">Settings</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Configure your store's global settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0F3460] to-[#1A1A2E] hover:from-[#1A1A2E] hover:to-[#0F3460] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#0F3460]/20 hover:shadow-lg disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check className="h-4 w-4" /> Saved!</>
          ) : (
            <><Save className="h-4 w-4" /> Save Settings</>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
          <Check className="h-4 w-4 flex-shrink-0" />
          Settings saved successfully!
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-neutral-100/80 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-[#1A1A2E] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <>
            <Section title="Store Information" description="Basic details about your store" icon={Store}>
              <Field label="Store Name" description="Displayed in emails, receipts, and the header">
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => setForm((p) => ({ ...p, storeName: e.target.value }))}
                  className={inputClass}
                  placeholder="My Awesome Store"
                />
              </Field>
              <Field label="Store Description" description="Brief description of your business" inline={false}>
                <textarea
                  value={form.storeDescription}
                  onChange={(e) => setForm((p) => ({ ...p, storeDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3460]/20 focus:border-[#0F3460] transition-all bg-white resize-none"
                  placeholder="We sell the best products online…"
                />
              </Field>
              <Field label="Contact Email" description="Used for order confirmations and support">
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                  className={inputClass}
                  placeholder="admin@mystore.com"
                />
              </Field>
              <Field label="Store URL" description="Your public website URL">
                <input
                  type="url"
                  value={form.storeUrl}
                  onChange={(e) => setForm((p) => ({ ...p, storeUrl: e.target.value }))}
                  className={inputClass}
                  placeholder="https://mystore.com"
                />
              </Field>
              <Field label="Timezone" description="Affects order timestamps and reports">
                <select
                  value={form.timezone}
                  onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
                  className={inputClass}
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Asia/Manila">Manila (PHT)</option>
                </select>
              </Field>
            </Section>
          </>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <>
            <Section title="Currency & Pricing" description="Configure your pricing preferences" icon={DollarSign}>
              <Field label="Currency Code" description="ISO 4217 code (e.g. USD, EUR, GBP)">
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase().slice(0, 3) }))}
                  className={inputClass}
                  placeholder="USD"
                  maxLength={3}
                />
              </Field>
              <Field label="Currency Symbol" description="Symbol shown before prices">
                <input
                  type="text"
                  value={form.currencySymbol}
                  onChange={(e) => setForm((p) => ({ ...p, currencySymbol: e.target.value.slice(0, 3) }))}
                  className={inputClass}
                  placeholder="$"
                  maxLength={3}
                />
              </Field>
              <Field label="Tax Rate (%)" description="Applied to all orders">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.taxRate}
                  onChange={(e) => setForm((p) => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
                  className={inputClass}
                />
              </Field>
            </Section>

            <Section title="Shipping" description="Configure shipping options" icon={Truck}>
              <Field label="Free Shipping Threshold" description="Orders above this amount get free shipping ($0 = disabled)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">{form.currencySymbol}</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.freeShippingThreshold}
                    onChange={(e) => setForm((p) => ({ ...p, freeShippingThreshold: parseFloat(e.target.value) || 0 }))}
                    className={`${inputClass} pl-7`}
                    placeholder="0.00"
                  />
                </div>
              </Field>
            </Section>
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            <Section title="Email Notifications" description="Configure when to send notifications" icon={Mail}>
              <Field label="Enable Email Notifications" description="Master switch for all email notifications">
                <Toggle
                  on={form.enableEmailNotifications}
                  onToggle={() => setForm((p) => ({ ...p, enableEmailNotifications: !p.enableEmailNotifications }))}
                />
              </Field>
              <Field label="New Order Notification" description="Email admin when a new order is placed">
                <Toggle
                  on={form.newOrderNotification}
                  disabled={!form.enableEmailNotifications}
                  onToggle={() => setForm((p) => ({ ...p, newOrderNotification: !p.newOrderNotification }))}
                />
              </Field>
              <Field label="Low Stock Alert" description="Email admin when a product falls below threshold">
                <Toggle
                  on={form.lowStockNotification}
                  disabled={!form.enableEmailNotifications}
                  onToggle={() => setForm((p) => ({ ...p, lowStockNotification: !p.lowStockNotification }))}
                />
              </Field>
              <Field label="Low Stock Threshold" description="Alert when stock drops below this number">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm((p) => ({ ...p, lowStockThreshold: parseInt(e.target.value) || 5 }))}
                  className={inputClass}
                  disabled={!form.enableEmailNotifications || !form.lowStockNotification}
                />
              </Field>
            </Section>
          </>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <>
            <Section title="Access & Registration" description="Control who can use your store" icon={Users}>
              <Field label="Allow New Registrations" description="When off, new users cannot create accounts">
                <Toggle
                  on={form.allowRegistrations}
                  onToggle={() => setForm((p) => ({ ...p, allowRegistrations: !p.allowRegistrations }))}
                />
              </Field>
              <Field label="Session Timeout" description="Auto-logout after inactivity (minutes)">
                <input
                  type="number"
                  min={5}
                  max={1440}
                  value={form.sessionTimeout}
                  onChange={(e) => setForm((p) => ({ ...p, sessionTimeout: parseInt(e.target.value) || 30 }))}
                  className={inputClass}
                />
              </Field>
            </Section>

            <Section title="Maintenance Mode" description="Take your store offline temporarily" icon={Settings}>
              <Field
                label="Enable Maintenance Mode"
                description="Non-admin visitors will see a maintenance page"
              >
                <Toggle
                  on={form.maintenanceMode}
                  onToggle={() => setForm((p) => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
                />
              </Field>
              {form.maintenanceMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Maintenance mode is active</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Regular users will see a maintenance page until you turn this off. Only admins can access the store.
                    </p>
                  </div>
                </div>
              )}
            </Section>
          </>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <>
            <Section title="Product & Order Settings" description="Configure product and order behavior" icon={Settings}>
              <Field label="Orders Per Page" description="Number of orders shown per page in admin">
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={form.ordersPerPage}
                  onChange={(e) => setForm((p) => ({ ...p, ordersPerPage: parseInt(e.target.value) || 20 }))}
                  className={inputClass}
                />
              </Field>
              <Field label="Max Items Per Order" description="Maximum number of items in a single order">
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={form.maxOrderItems}
                  onChange={(e) => setForm((p) => ({ ...p, maxOrderItems: parseInt(e.target.value) || 50 }))}
                  className={inputClass}
                />
              </Field>
              <Field label="Enable Product Reviews" description="Allow customers to leave reviews on products">
                <Toggle
                  on={form.enableReviews}
                  onToggle={() => setForm((p) => ({ ...p, enableReviews: !p.enableReviews }))}
                />
              </Field>
              <Field label="Require Review Approval" description="Reviews need admin approval before being published">
                <Toggle
                  on={form.requireApproval}
                  disabled={!form.enableReviews}
                  onToggle={() => setForm((p) => ({ ...p, requireApproval: !p.requireApproval }))}
                />
              </Field>
            </Section>

            <Section title="Danger Zone" description="Irreversible actions — proceed with caution" icon={AlertTriangle} variant="danger">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Clear All Orders</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Permanently delete all order records from the database</p>
                  </div>
                  <button
                    onClick={() => setShowDangerConfirm('clearOrders')}
                    className="px-4 py-2 rounded-xl border border-red-300 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="h-3.5 w-3.5 inline mr-1.5" />
                    Clear Orders
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Reset Product Catalog</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Delete all products and categories. Cannot be undone.</p>
                  </div>
                  <button
                    onClick={() => setShowDangerConfirm('resetCatalog')}
                    className="px-4 py-2 rounded-xl border border-red-300 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap"
                  >
                    <RefreshCw className="h-3.5 w-3.5 inline mr-1.5" />
                    Reset Catalog
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Export Database</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Download a full backup of your store data</p>
                  </div>
                  <button
                    onClick={() => setShowDangerConfirm('export')}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors whitespace-nowrap"
                  >
                    <Database className="h-3.5 w-3.5 inline mr-1.5" />
                    Export Data
                  </button>
                </div>
              </div>
            </Section>
          </>
        )}
      </div>

      {/* Save Footer */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
        <p className="text-sm text-neutral-400 hidden sm:block">
          <Clock className="h-3.5 w-3.5 inline mr-1" />
          Changes are saved when you click the save button
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0F3460] to-[#1A1A2E] hover:from-[#1A1A2E] hover:to-[#0F3460] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-[#0F3460]/20 disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : (
            <><Save className="h-4 w-4" /> Save All Settings</>
          )}
        </button>
      </div>

      {/* Danger Confirmation Modal */}
      {showDangerConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDangerConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 text-center">
              {showDangerConfirm === 'clearOrders' && 'Clear All Orders?'}
              {showDangerConfirm === 'resetCatalog' && 'Reset Product Catalog?'}
              {showDangerConfirm === 'export' && 'Export Database?'}
            </h3>
            <p className="text-sm text-neutral-500 text-center mt-2 leading-relaxed">
              {showDangerConfirm === 'export'
                ? 'This will prepare a downloadable backup of your entire store database.'
                : 'This action is irreversible. All data associated with this operation will be permanently deleted.'
              }
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDangerConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDangerAction(showDangerConfirm)}
                disabled={dangerLoading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60 ${
                  showDangerConfirm === 'export'
                    ? 'bg-[#0F3460] hover:bg-[#1A1A2E]'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {dangerLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                  </span>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
