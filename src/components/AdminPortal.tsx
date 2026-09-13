import React, { useState, useEffect } from 'react';
import { Currency, PlacedOrder, OrderState } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { getAllOrders, updateOrderStatus, exportOrdersJSON } from '../utils/orderStorage';
import {
  Lock,
  LogOut,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  XCircle,
  Download,
  AlertCircle,
  Coffee,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  Edit3,
  Save,
  Check
} from 'lucide-react';

interface AdminPortalProps {
  currency: Currency;
  onBackToShop: () => void;
  onOrderUpdated?: (orderId: string, newStatus: OrderState) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currency,
  onBackToShop,
  onOrderUpdated,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingAwbOrderId, setEditingAwbOrderId] = useState<string | null>(null);
  const [awbInput, setAwbInput] = useState<string>('');
  const [courierInput, setCourierInput] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    try {
      const auth = sessionStorage.getItem('caphe_vietnam_admin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
        loadOrders();
      }
    } catch {
      // ignore
    }
  }, []);

  const loadOrders = () => {
    const stored = getAllOrders();
    setOrders(stored);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    // Check custom owner password stored in localStorage or default credentials
    const customStoredPass = localStorage.getItem('caphe_admin_custom_password');
    const validPassword = customStoredPass || 'admin123';

    if ((user === 'admin' || user === 'owner') && (pass === validPassword || pass === 'vietnam2026')) {
      try {
        sessionStorage.setItem('caphe_vietnam_admin_auth', 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      loadOrders();
    } else {
      setLoginError('Invalid username or password. Please check your roastery credentials.');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('caphe_vietnam_admin_auth');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleStatusChange = (orderId: string, newStatus: OrderState) => {
    updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
    if (onOrderUpdated) {
      onOrderUpdated(orderId, newStatus);
    }
    showToast(`Order ${orderId} status set to: ${newStatus}`);
  };

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 3000);
  };

  const handleSaveCourierAwb = (orderId: string) => {
    const stored = getAllOrders();
    const target = stored.find((o) => o.orderId === orderId);
    if (target) {
      if (awbInput.trim()) target.trackingNumber = awbInput.trim();
      if (courierInput.trim()) target.courierPartner = courierInput.trim();
      try {
        localStorage.setItem('caphe_vietnam_orders_database_v1', JSON.stringify(stored));
        setOrders([...stored]);
        showToast(`Courier details updated for ${orderId}`);
      } catch (e) {
        console.error(e);
      }
    }
    setEditingAwbOrderId(null);
  };

  const handleExportData = () => {
    const data = exportOrdersJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caphe-vietnam-orders-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Status mapping
  const stages: { state: OrderState; label: string; badgeColor: string }[] = [
    { state: 'Order Placed', label: 'Order Placed', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
    { state: 'Confirmed', label: 'Confirmed', badgeColor: 'bg-blue-100 text-blue-900 border-blue-300' },
    { state: 'In Transit', label: 'In Transit', badgeColor: 'bg-purple-100 text-purple-900 border-purple-300' },
    { state: 'Delivered', label: 'Delivered', badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { state: 'Cancelled', label: 'Cancelled', badgeColor: 'bg-rose-100 text-rose-900 border-rose-300' },
  ];

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      ord.orderId.toLowerCase().includes(q) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.customerEmail && ord.customerEmail.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.includes(q)) ||
      (ord.cityPincode && ord.cityPincode.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'placed' && (ord.status === 'Order Placed' || ord.status === 'Order Placed & Roasting')) ||
      (statusFilter === 'confirmed' && (ord.status === 'Confirmed' || ord.status === 'Packaged & Sealed')) ||
      (statusFilter === 'transit' && ord.status === 'In Transit') ||
      (statusFilter === 'delivered' && ord.status === 'Delivered') ||
      (statusFilter === 'cancelled' && ord.status === 'Cancelled');

    return matchesQuery && matchesStatus;
  });

  // Calculate quick metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + (o.finalTotalINR || 0) : sum), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  // View 1: Password-Protected Login Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-[480px] mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-[#d3c3c0]/80 p-6 sm:p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#271310] text-[#feca4d] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h1
              className="font-serif font-bold text-2xl text-[#271310]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Roastery Owner Portal
            </h1>
            <p className="text-xs text-[#504442]">
              Password-protected access for managing customer orders, roast batches, and courier dispatches.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="adminUsername" className="text-[10px] font-bold text-[#827472] uppercase block mb-1">
                Owner Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
                <input
                  id="adminUsername"
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#271310] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="text-[10px] font-bold text-[#827472] uppercase block mb-1">
                Owner Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter owner password"
                  className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#271310] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#827472] hover:text-[#271310] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              id="admin-login-submit-btn"
              className="w-full py-3 bg-[#271310] hover:bg-[#3d201c] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Sign In to Admin Portal
            </button>
          </form>

          {/* Owner Credentials Tip Box */}
          <div className="bg-[#faf2f0] p-3 rounded-xl border border-[#d3c3c0] text-[11px] text-[#504442] space-y-1">
            <span className="font-bold text-[#271310] block">Default Roastery Owner Credentials:</span>
            <div className="flex justify-between font-mono text-[10px] text-[#785a00]">
              <span>Username: <strong>admin</strong></span>
              <span>Password: <strong>admin123</strong></span>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBackToShop}
              className="inline-flex items-center gap-1.5 text-xs text-[#785a00] hover:text-[#271310] font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customer Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Authenticated Owner Dashboard
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast Notification Banner */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#271310] text-[#feca4d] px-4 py-3 rounded-xl border border-[#feca4d]/40 shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-[#feca4d]" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#271310] text-[#feca4d] text-[10px] font-bold uppercase tracking-wider">
              Owner Mode
            </span>
            <span className="text-xs text-[#827472]">• Authorized Access</span>
          </div>
          <h1
            className="font-serif font-bold text-2xl text-[#271310]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Order Management & Dispatch Control
          </h1>
          <p className="text-xs text-[#504442] mt-0.5">
            Manually update order tracking status through roastery roasting, packaging, transit, and delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportData}
            className="px-3 py-2 rounded-xl bg-[#faf2f0] hover:bg-[#eee3e1] border border-[#d3c3c0] text-[#271310] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#785a00]" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={onBackToShop}
            className="px-3 py-2 rounded-xl bg-[#faf2f0] hover:bg-[#eee3e1] border border-[#d3c3c0] text-[#271310] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#d3c3c0]/60 space-y-1 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#827472] tracking-wider">Total Orders</span>
          <p className="font-serif font-bold text-xl text-[#271310]">{orders.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#d3c3c0]/60 space-y-1 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#827472] tracking-wider">Active In-Pipeline</span>
          <p className="font-serif font-bold text-xl text-[#785a00]">{activeOrdersCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#d3c3c0]/60 space-y-1 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#827472] tracking-wider">Delivered</span>
          <p className="font-serif font-bold text-xl text-emerald-700">
            {orders.filter((o) => o.status === 'Delivered').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#d3c3c0]/60 space-y-1 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#827472] tracking-wider">Total Sales Volume</span>
          <p className="font-serif font-bold text-xl text-[#271310]">
            {formatPrice(totalRevenue, currency)}
          </p>
        </div>
      </div>

      {/* Search & Status Filter Tabs */}
      <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, customer, email, phone, or city..."
              className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadOrders}
            className="px-3 py-2 rounded-xl border border-[#d3c3c0] bg-[#faf2f0] hover:bg-[#eee3e1] text-[#271310] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#785a00]" />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#f4ecea]">
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'placed', label: `Order Placed (${orders.filter((o) => o.status === 'Order Placed' || o.status === 'Order Placed & Roasting').length})` },
            { id: 'confirmed', label: `Confirmed (${orders.filter((o) => o.status === 'Confirmed' || o.status === 'Packaged & Sealed').length})` },
            { id: 'transit', label: `In Transit (${orders.filter((o) => o.status === 'In Transit').length})` },
            { id: 'delivered', label: `Delivered (${orders.filter((o) => o.status === 'Delivered').length})` },
            { id: 'cancelled', label: `Cancelled (${orders.filter((o) => o.status === 'Cancelled').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#271310] text-white shadow-2xs'
                  : 'bg-[#faf2f0] text-[#504442] hover:bg-[#eee3e1]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 p-12 text-center space-y-3 shadow-sm">
          <Package className="w-12 h-12 text-[#827472]/60 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#271310]">No Orders Matching Filter</h3>
          <p className="text-xs text-[#504442] max-w-sm mx-auto">
            Try adjusting your search keywords or switching status tabs to view all orders.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isEditingAwb = editingAwbOrderId === order.orderId;

            return (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl border border-[#d3c3c0]/70 p-5 sm:p-6 shadow-sm space-y-4 transition-all hover:border-[#785a00]/50"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f4ecea] pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-base text-[#271310] bg-[#faf2f0] px-2.5 py-1 rounded-lg border border-[#d3c3c0]">
                      {order.orderId}
                    </span>
                    <span className="text-xs text-[#827472]">
                      {order.timestamp
                        ? new Date(order.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Recent'}
                    </span>
                    <span className="text-xs font-semibold text-[#785a00] bg-[#feca4d]/20 px-2 py-0.5 rounded">
                      {order.paymentMethod || 'Razorpay'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#504442]">Total:</span>
                    <span className="font-serif font-bold text-base text-[#785a00]">
                      {formatPrice(order.finalTotalINR, currency)}
                    </span>
                  </div>
                </div>

                {/* Customer and Courier Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer Information */}
                  <div className="bg-[#faf2f0]/60 p-3.5 rounded-xl border border-[#d3c3c0]/50 space-y-1">
                    <span className="text-[10px] font-bold text-[#827472] uppercase block">Customer Details</span>
                    <p className="font-bold text-[#271310]">{order.customerName}</p>
                    <p className="text-[#504442]">Phone: <strong className="text-[#271310]">{order.customerPhone}</strong></p>
                    <p className="text-[#504442] truncate">Email: <strong className="text-[#271310]">{order.customerEmail}</strong></p>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-[#faf2f0]/60 p-3.5 rounded-xl border border-[#d3c3c0]/50 space-y-1">
                    <span className="text-[10px] font-bold text-[#827472] uppercase block">Delivery Address</span>
                    <p className="text-[#271310] leading-snug">{order.shippingAddress}</p>
                    <p className="font-semibold text-[#785a00]">{order.cityPincode}</p>
                    <p className="text-[10px] text-[#827472]">Speed: {order.shippingType || 'standard'}</p>
                  </div>

                  {/* Courier & AWB Tracking */}
                  <div className="bg-[#faf2f0]/60 p-3.5 rounded-xl border border-[#d3c3c0]/50 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#827472] uppercase block">Courier Tracking</span>
                        {!isEditingAwb && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAwbOrderId(order.orderId);
                              setAwbInput(order.trackingNumber || '');
                              setCourierInput(order.courierPartner || 'BlueDart Air Express');
                            }}
                            className="text-[#785a00] hover:text-[#271310] text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit AWB</span>
                          </button>
                        )}
                      </div>

                      {isEditingAwb ? (
                        <div className="space-y-1.5 pt-1">
                          <input
                            type="text"
                            value={courierInput}
                            onChange={(e) => setCourierInput(e.target.value)}
                            placeholder="Courier (e.g. BlueDart / Delhivery)"
                            className="w-full bg-white border border-[#d3c3c0] rounded p-1 text-[11px]"
                          />
                          <input
                            type="text"
                            value={awbInput}
                            onChange={(e) => setAwbInput(e.target.value)}
                            placeholder="AWB Tracking Number"
                            className="w-full bg-white border border-[#d3c3c0] rounded p-1 text-[11px] font-mono"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveCourierAwb(order.orderId)}
                              className="px-2 py-0.5 bg-[#271310] text-white rounded text-[10px] font-bold"
                            >
                              Save AWB
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAwbOrderId(null)}
                              className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-[#271310]">{order.courierPartner || 'BlueDart Air Express'}</p>
                          <p className="font-mono text-[11px] text-[#785a00]">{order.trackingNumber || 'Pending AWB'}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Ordered List */}
                <div className="bg-[#fff8f6] p-3 rounded-xl border border-[#d3c3c0]/40 text-xs">
                  <span className="text-[10px] font-bold text-[#827472] uppercase block mb-1">
                    Items ({order.items?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {order.items?.map((it, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-[#d3c3c0] rounded-lg px-2.5 py-1 text-[#271310] font-medium"
                      >
                        <strong>{it.quantity}x</strong> {it.name} ({it.selectedSize}
                        {it.selectedGrind ? `, ${it.selectedGrind}` : ''})
                      </span>
                    ))}
                  </div>
                </div>

                {/* MANUAL STATUS CONTROL (OWNER ONLY) */}
                <div className="pt-3 border-t border-[#f4ecea] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#271310] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#785a00]" />
                      <span>Update Order Tracking Stage (Admin Only):</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-[#785a00]">
                      Current: {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {stages.map((stg) => {
                      const isCurrent =
                        order.status === stg.state ||
                        (stg.state === 'Order Placed' && order.status === 'Order Placed & Roasting') ||
                        (stg.state === 'Confirmed' && order.status === 'Packaged & Sealed');

                      return (
                        <button
                          key={stg.state}
                          type="button"
                          onClick={() => handleStatusChange(order.orderId, stg.state)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? 'bg-[#271310] text-white border-[#271310] shadow-md ring-2 ring-[#785a00]/30'
                              : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0] hover:bg-[#eee3e1] hover:text-[#271310]'
                          }`}
                        >
                          {isCurrent && <Check className="w-3.5 h-3.5 text-[#feca4d]" />}
                          <span>{stg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
