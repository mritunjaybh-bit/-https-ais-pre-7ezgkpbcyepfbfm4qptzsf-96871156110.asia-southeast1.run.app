import React, { useState, useEffect, useMemo } from 'react';
import { Currency, ProductItem, PlacedOrder, OrderState, ProductCategory, PackageSize } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { syncLiveProducts, fetchLiveProducts } from '../data/coffeeData';
import emailjs from '@emailjs/browser';
import { EMAILJS_CREDENTIALS } from '../utils/emailService';
import {
  Lock,
  LogOut,
  Package,
  Truck,
  CheckCircle2,
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
  Check,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Layers,
  ChevronRight,
  ExternalLink,
  Sliders,
  CheckCircle,
  Key,
  X,
  Mail,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

interface AdminPortalProps {
  currency: Currency;
  onBackToShop: () => void;
  onOrderUpdated?: (orderId: string, newStatus: OrderState) => void;
}

type AdminTab = 'overview' | 'orders' | 'inventory' | 'prices' | 'products';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currency,
  onBackToShop,
  onOrderUpdated,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentAdminUser, setCurrentAdminUser] = useState<string>('owner');
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>('mritunjaybh@gmail.com');

  // Auth View State: 'login' | 'setup' | 'forgot'
  const [authView, setAuthView] = useState<'login' | 'setup' | 'forgot'>('login');
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);

  // Standard Login Inputs (Strictly empty, no default credentials)
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Setup Form Inputs (One-Time Owner Account Creation)
  const [setupOwnerId, setSetupOwnerId] = useState<string>('');
  const [setupEmail, setSetupEmail] = useState<string>('mritunjaybh@gmail.com');
  const [setupPassword, setSetupPassword] = useState<string>('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState<string>('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSubmittingSetup, setIsSubmittingSetup] = useState<boolean>(false);

  // Forgot Password Form Inputs (Email OTP Flow)
  const [forgotEmail, setForgotEmail] = useState<string>('mritunjaybh@gmail.com');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1 = request OTP, 2 = verify OTP & set password
  const [forgotOtp, setForgotOtp] = useState<string>('');
  const [forgotNewPass, setForgotNewPass] = useState<string>('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState<string>('');
  const [forgotResetToken, setForgotResetToken] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessNotice, setForgotSuccessNotice] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Orders State
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [searchOrdersQuery, setSearchOrdersQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [editingAwbOrderId, setEditingAwbOrderId] = useState<string | null>(null);
  const [awbInput, setAwbInput] = useState<string>('');
  const [courierInput, setCourierInput] = useState<string>('');

  // Products & Inventory State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [searchProductQuery, setSearchProductQuery] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Temporary edit states for bulk saving
  const [stockDrafts, setStockDrafts] = useState<{ [id: string]: number }>({});
  const [priceDrafts, setPriceDrafts] = useState<{ [id: string]: number }>({});
  const [savingRows, setSavingRows] = useState<{ [id: string]: boolean }>({});

  // Product Modal (Add / Edit)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState<boolean>(false);
  const [productFormState, setProductFormState] = useState<Partial<ProductItem>>({});

  // Change Password Modal
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [changePasswordMsg, setChangePasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Check setup status and existing session token on mount
  useEffect(() => {
    // 1. Query setup status from database
    fetch('/api/admin/setup-status')
      .then((r) => r.json())
      .then((data) => {
        setIsSetupComplete(Boolean(data.isSetupComplete));
        if (data.registeredEmail) {
          setCurrentAdminEmail(data.registeredEmail);
          setForgotEmail(data.registeredEmail);
          setSetupEmail(data.registeredEmail);
        }
        if (data.username) {
          setCurrentAdminUser(data.username);
        }
        // If owner setup has never been performed, open Setup view automatically
        if (data.isSetupComplete === false) {
          setAuthView('setup');
        }
      })
      .catch((err) => console.warn('Could not query admin setup status:', err));

    // 2. Verify stored session token if present
    const savedToken = sessionStorage.getItem('caphe_admin_token');
    if (savedToken) {
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setAuthToken(savedToken);
            setIsAuthenticated(true);
            if (data.username) setCurrentAdminUser(data.username);
            if (data.email) setCurrentAdminEmail(data.email);
          } else {
            sessionStorage.removeItem('caphe_admin_token');
          }
        })
        .catch(() => {
          sessionStorage.removeItem('caphe_admin_token');
        });
    }
  }, []);

  // Fetch all orders & products when authenticated
  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadOrders();
      loadAdminProducts();
    }
  }, [isAuthenticated, authToken]);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error('Failed to load orders from server:', err);
    }
  };

  const loadAdminProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) {
          setProducts(data.products);
          // Sync with global store so customer storefront gets latest values too
          syncLiveProducts(data.products);

          // Populate initial drafts
          const sDrafts: { [id: string]: number } = {};
          const pDrafts: { [id: string]: number } = {};
          data.products.forEach((p: ProductItem) => {
            sDrafts[p.id] = p.stockQuantity ?? 50;
            pDrafts[p.id] = p.basePriceINR;
          });
          setStockDrafts(sDrafts);
          setPriceDrafts(pDrafts);
        }
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // 1. Server-Side Authentication: Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (data.requireSetup) {
        setAuthView('setup');
        setSetupError('Initial Roastery Owner setup is required. Please create your Owner account.');
        return;
      }

      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('caphe_admin_token', data.token);
        setAuthToken(data.token);
        setIsAuthenticated(true);
        if (data.username) setCurrentAdminUser(data.username);
        setUsernameInput('');
        setPasswordInput('');
        showToast('Authenticated securely as Roastery Owner.');
      } else {
        setLoginError(data.error || 'Authentication failed. Please verify your Owner credentials.');
      }
    } catch (err) {
      console.error('Admin login network error:', err);
      setLoginError('Could not reach roastery authentication server. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 2. One-Time Owner Account Setup Submit
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    const cleanId = setupOwnerId.trim();
    const cleanEmail = setupEmail.trim().toLowerCase();
    const cleanPass = setupPassword.trim();

    if (!cleanId || cleanId.length < 3) {
      setSetupError('Owner ID must be at least 3 characters.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setSetupError('Please enter a valid registered email address.');
      return;
    }
    if (!cleanPass || cleanPass.length < 6) {
      setSetupError('Password must be at least 6 characters.');
      return;
    }
    if (cleanPass !== setupConfirmPassword.trim()) {
      setSetupError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmittingSetup(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: cleanId,
          email: cleanEmail,
          password: cleanPass,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('caphe_admin_token', data.token);
        setAuthToken(data.token);
        setIsAuthenticated(true);
        setIsSetupComplete(true);
        setCurrentAdminUser(data.username || cleanId);
        setCurrentAdminEmail(cleanEmail);
        setAuthView('login');
        showToast('Owner Account created securely! Default credentials disabled.');
      } else {
        setSetupError(data.error || 'Failed to complete owner setup.');
      }
    } catch (err) {
      console.error('Setup network error:', err);
      setSetupError('Could not reach roastery server to complete setup.');
    } finally {
      setIsSubmittingSetup(false);
    }
  };

  // 3. Forgot Password: Request OTP to Registered Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccessNotice(null);

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotError('Please enter your registered owner email address.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/admin/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotResetToken(data.resetToken);
        setForgotStep(2);
        setForgotSuccessNotice(data.message || `Verification OTP code dispatched to ${data.emailMasked || cleanEmail}. Valid for 10 minutes.`);
        
        // Also dispatch directly via client-side EmailJS for redundancy
        try {
          await emailjs.send(
            EMAILJS_CREDENTIALS.SERVICE_ID,
            EMAILJS_CREDENTIALS.CUSTOMER_TEMPLATE_ID,
            {
              to_email: cleanEmail,
              customer_email: cleanEmail,
              customer_name: 'Cà Phê Vietnam Roastery Owner',
              order_id: 'PASSWORD-RESET-OTP',
              order_items: `Roastery Owner Portal Password Reset Request.\nPlease enter the 6-digit OTP code sent to your email. Expires in 10 minutes.`,
              order_total: 'Owner Portal Security Code',
            },
            EMAILJS_CREDENTIALS.PUBLIC_KEY
          );
        } catch {
          // Client-side dispatch redundancy failure is non-fatal since backend already dispatches
        }
      } else {
        setForgotError(data.error || 'Could not initiate OTP reset request.');
      }
    } catch (err) {
      console.error('Forgot password OTP request error:', err);
      setForgotError('Network error connecting to security server.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 4. Forgot Password: Verify OTP & Update Password
  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const cleanOtp = forgotOtp.trim();
    const cleanPass = forgotNewPass.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setForgotError('Please enter the 6-digit numeric OTP code.');
      return;
    }
    if (!cleanPass || cleanPass.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (cleanPass !== forgotConfirmPass.trim()) {
      setForgotError('New passwords do not match. Please verify.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/admin/forgot-password/verify-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: forgotResetToken,
          otp: cleanOtp,
          newPassword: cleanPass,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          sessionStorage.setItem('caphe_admin_token', data.token);
          setAuthToken(data.token);
          setIsAuthenticated(true);
        }
        showToast('Password reset successfully! Logged in with new credentials.');
        setAuthView('login');
        setForgotStep(1);
        setForgotOtp('');
        setForgotNewPass('');
        setForgotConfirmPass('');
        setForgotResetToken(null);
      } else {
        setForgotError(data.error || 'Verification failed. Please check your OTP code.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setForgotError('Network error during password reset.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {
        // ignore
      }
    }
    sessionStorage.removeItem('caphe_admin_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordMsg(null);

    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      setChangePasswordMsg({ type: 'error', text: 'Password must be at least 4 characters long.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ newPassword: newPasswordInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChangePasswordMsg({ type: 'success', text: 'Admin password updated securely on server.' });
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setNewPasswordInput('');
          setChangePasswordMsg(null);
        }, 1800);
      } else {
        setChangePasswordMsg({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch {
      setChangePasswordMsg({ type: 'error', text: 'Server connection error.' });
    }
  };

  // 2. Order Management
  const handleOrderStatusChange = async (orderId: string, newStatus: OrderState) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
        );
        if (onOrderUpdated) {
          onOrderUpdated(orderId, newStatus);
        }
        showToast(`Order ${orderId} marked as ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleSaveCourierDetails = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          orderId,
          trackingNumber: awbInput.trim(),
          courierPartner: courierInput.trim(),
        }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? { ...o, trackingNumber: awbInput.trim(), courierPartner: courierInput.trim() }
              : o
          )
        );
        setEditingAwbOrderId(null);
        showToast(`Courier details updated for order ${orderId}`);
      }
    } catch (err) {
      console.error('Failed to save courier:', err);
    }
  };

  const handleExportOrdersJSON = () => {
    const dataStr = JSON.stringify(orders, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caphe-vietnam-orders-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 3. Inventory Control: Save stock for a specific product
  const handleSaveStock = async (productId: string) => {
    const newStock = stockDrafts[productId];
    if (newStock === undefined) return;

    setSavingRows((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          updates: [{ id: productId, stockQuantity: newStock }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        syncLiveProducts(data.products);
        showToast(
          newStock <= 0
            ? `Product marked OUT OF STOCK on live customer storefront!`
            : `Inventory updated to ${newStock} units.`
        );
      }
    } catch (err) {
      console.error('Failed to save stock:', err);
    } finally {
      setSavingRows((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Bulk save all modified stock levels
  const handleSaveAllStock = async () => {
    const updates = Object.entries(stockDrafts).map(([id, stockQuantity]) => ({
      id,
      stockQuantity,
    }));

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        syncLiveProducts(data.products);
        showToast(`All inventory stock counts saved to live database.`);
      }
    } catch (err) {
      console.error('Failed to save all stock:', err);
    }
  };

  // 4. Price Control: Save price for a product
  const handleSavePrice = async (productId: string) => {
    const newPrice = priceDrafts[productId];
    if (newPrice === undefined) return;

    setSavingRows((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await fetch('/api/admin/prices', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          updates: [{ id: productId, basePriceINR: newPrice }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        syncLiveProducts(data.products);
        showToast(`Price updated to ₹${newPrice} — live storefront synced immediately!`);
      }
    } catch (err) {
      console.error('Failed to save price:', err);
    } finally {
      setSavingRows((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Bulk save all modified prices
  const handleSaveAllPrices = async () => {
    const updates = Object.entries(priceDrafts).map(([id, basePriceINR]) => ({
      id,
      basePriceINR,
    }));

    try {
      const res = await fetch('/api/admin/prices', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        syncLiveProducts(data.products);
        showToast(`All prices updated in live database.`);
      }
    } catch (err) {
      console.error('Failed to save all prices:', err);
    }
  };

  // 5. Product Management: Toggle Active / Inactive
  const handleToggleProductActive = async (product: ProductItem) => {
    const newActiveState = product.isActive === false ? true : false;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id: product.id, isActive: newActiveState }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
        // Refresh live list
        fetchLiveProducts();
        showToast(
          newActiveState
            ? `Product "${product.name}" is now VISIBLE on live storefront.`
            : `Product "${product.name}" is now HIDDEN from live storefront.`
        );
      }
    } catch (err) {
      console.error('Failed to toggle active state:', err);
    }
  };

  // Create or Update Product from Modal
  const handleSaveProductModal = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEdit = !!editingProduct;
    const url = isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const payload = {
        ...productFormState,
        id: isEdit ? editingProduct.id : undefined,
        basePriceINR: Number(productFormState.basePriceINR) || 350,
        stockQuantity: Number(productFormState.stockQuantity) || 50,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (isEdit) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
          showToast(`Product "${data.product.name}" updated successfully.`);
        } else {
          setProducts((prev) => [data.product, ...prev]);
          showToast(`New product "${data.product.name}" added to catalog.`);
        }

        fetchLiveProducts();
        setIsNewProductModalOpen(false);
        setEditingProduct(null);
        setProductFormState({});
      }
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the roastery catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id: productId }),
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        fetchLiveProducts();
        showToast(`Product "${name}" deleted.`);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const q = searchOrdersQuery.toLowerCase().trim();
    return orders.filter((ord) => {
      const matchesQuery =
        !q ||
        ord.orderId.toLowerCase().includes(q) ||
        (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
        (ord.customerEmail && ord.customerEmail.toLowerCase().includes(q)) ||
        (ord.customerPhone && ord.customerPhone.includes(q)) ||
        (ord.cityPincode && ord.cityPincode.toLowerCase().includes(q));

      const matchesStatus =
        orderStatusFilter === 'all' ||
        (orderStatusFilter === 'placed' && (ord.status === 'Order Placed' || ord.status === 'Order Placed & Roasting')) ||
        (orderStatusFilter === 'confirmed' && (ord.status === 'Confirmed' || ord.status === 'Packaged & Sealed')) ||
        (orderStatusFilter === 'transit' && ord.status === 'In Transit') ||
        (orderStatusFilter === 'delivered' && ord.status === 'Delivered') ||
        (orderStatusFilter === 'cancelled' && ord.status === 'Cancelled');

      return matchesQuery && matchesStatus;
    });
  }, [orders, searchOrdersQuery, orderStatusFilter]);

  // Filtered Products for Inventory & Price tables
  const filteredProducts = useMemo(() => {
    const q = searchProductQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.vietnameseName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesCategory =
        productCategoryFilter === 'all' || p.category === productCategoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [products, searchProductQuery, productCategoryFilter]);

  // Overview Metrics (Standardized to Roastery Owner Console)
  const totalRevenue = orders.reduce(
    (sum, o) => (o.status !== 'Cancelled' ? sum + (o.finalTotalINR || 0) : sum),
    0
  );
  const totalOrdersCount = orders.length;
  const activeInPipelineCount = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;
  const lowStockItems = products.filter((p) => (p.stockQuantity ?? 50) <= 10);
  const outOfStockItems = products.filter((p) => (p.stockQuantity ?? 50) <= 0);

  // ==========================================
  // VIEW 1: UNAUTHENTICATED SCREENS
  // (Setup, Forgot Password OTP, Clean Login)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 bg-[#120a09] text-[#f7ece1]">
        <div className="w-full max-w-[440px] bg-[#1d1210] rounded-2xl border border-[#3e2723] p-6 sm:p-8 shadow-2xl space-y-6">

          {/* 1.1 ONE-TIME OWNER ACCOUNT SETUP */}
          {authView === 'setup' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#785a00]/30 border border-[#feca4d]/40 text-[#feca4d] flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1
                  className="font-serif font-bold text-2xl text-white tracking-wide"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Create Owner Account
                </h1>
                <p className="text-xs text-[#b8a09b] leading-relaxed">
                  Set up your permanent Owner ID and secure password. Once saved, default system credentials will be disabled permanently.
                </p>
              </div>

              <form onSubmit={handleSetupSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider">
                    Desired Owner ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                    <input
                      type="text"
                      required
                      value={setupOwnerId}
                      onChange={(e) => setSetupOwnerId(e.target.value)}
                      placeholder="e.g. mritunjay"
                      className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider">
                    Registered Owner Email (For OTP Recovery)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                    <input
                      type="email"
                      required
                      value={setupEmail}
                      onChange={(e) => setSetupEmail(e.target.value)}
                      placeholder="owner@domain.com"
                      className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider">
                    Secure Password (Min 6 Characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#827472] hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={setupConfirmPassword}
                      onChange={(e) => setSetupConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                    />
                  </div>
                </div>

                {setupError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingSetup}
                  className="w-full py-3 bg-[#feca4d] hover:bg-[#ffd666] active:scale-[0.99] text-[#271310] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmittingSetup ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Encrypting & Securing...</span>
                    </>
                  ) : (
                    <span>Complete Setup & Secure Portal</span>
                  )}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs text-[#b8a09b]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setSetupError(null);
                  }}
                  className="text-[#feca4d] hover:underline cursor-pointer"
                >
                  Already configured? Sign In
                </button>
                <button
                  type="button"
                  onClick={onBackToShop}
                  className="text-[#827472] hover:text-white cursor-pointer"
                >
                  ← Back to Storefront
                </button>
              </div>
            </div>
          )}

          {/* 1.2 FORGOT PASSWORD VIA EMAIL OTP */}
          {authView === 'forgot' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#785a00]/30 border border-[#feca4d]/40 text-[#feca4d] flex items-center justify-center mx-auto shadow-md">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1
                  className="font-serif font-bold text-2xl text-white tracking-wide"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Reset Owner Password
                </h1>
                <p className="text-xs text-[#b8a09b] leading-relaxed">
                  {forgotStep === 1
                    ? 'Enter your registered email address to receive a secure 6-digit OTP verification code via EmailJS (valid 10 minutes).'
                    : `Enter the 6-digit verification code sent to ${forgotEmail} and set your new secure password.`}
                </p>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider">
                      Registered Owner Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="owner@domain.com"
                        className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3 bg-[#feca4d] hover:bg-[#ffd666] active:scale-[0.99] text-[#271310] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching OTP Code...</span>
                      </>
                    ) : (
                      <span>Send 6-Digit Verification Code</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                  {forgotSuccessNotice && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{forgotSuccessNotice}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider text-center">
                      6-Digit Verification OTP (Expires in 10 mins)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl py-3 text-center text-lg font-mono tracking-widest text-[#feca4d] placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider">
                      New Secure Password (Min 6 Characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#827472] hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={forgotConfirmPass}
                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                      />
                    </div>
                  </div>

                  {forgotError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-full py-3 bg-[#feca4d] hover:bg-[#ffd666] active:scale-[0.99] text-[#271310] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying & Updating...</span>
                      </>
                    ) : (
                      <span>Verify OTP & Update Password</span>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2 flex items-center justify-between text-xs text-[#b8a09b]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setForgotError(null);
                    setForgotStep(1);
                  }}
                  className="text-[#feca4d] hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
                {forgotStep === 2 && (
                  <button
                    type="button"
                    onClick={(e) => handleRequestOtp(e)}
                    className="text-[#827472] hover:text-white cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 1.3 CLEAN OWNER SIGN-IN (Zero hints, empty inputs, no hardcoded credentials) */}
          {authView === 'login' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#785a00]/30 border border-[#feca4d]/40 text-[#feca4d] flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-7 h-7" />
                </div>
                <h1
                  className="font-serif font-bold text-2xl text-white tracking-wide"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Roastery Owner Portal
                </h1>
                <p className="text-xs text-[#b8a09b] leading-relaxed">
                  Enter your Owner ID and password to access store management.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="adminUsername" className="text-[10px] font-bold text-[#b8a09b] uppercase block mb-1 tracking-wider">
                    Owner ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                    <input
                      id="adminUsername"
                      type="text"
                      required
                      autoComplete="username"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Enter your Owner ID"
                      className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="adminPassword" className="text-[10px] font-bold text-[#b8a09b] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('forgot');
                        setForgotError(null);
                        setForgotStep(1);
                      }}
                      className="text-[11px] text-[#feca4d] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
                    <input
                      id="adminPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#feca4d] focus:ring-1 focus:ring-[#feca4d]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#827472] hover:text-white cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-[#feca4d] hover:bg-[#ffd666] active:scale-[0.99] text-[#271310] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <span>Sign In to Admin Dashboard</span>
                  )}
                </button>
              </form>

              <div className="pt-2 flex flex-col items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('setup');
                    setSetupError(null);
                  }}
                  className="text-[#feca4d] hover:underline cursor-pointer"
                >
                  Initial setup? Configure Owner Account
                </button>
                <button
                  type="button"
                  onClick={onBackToShop}
                  className="inline-flex items-center gap-1.5 text-xs text-[#827472] hover:text-white font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Live Storefront</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DEDICATED PURE ROASTERY OWNER PORTAL
  // (Zero customer elements, dedicated navigation)
  // ==========================================
  return (
    <div className="w-full min-h-screen bg-[#140b0a] text-[#f5ebe6] px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#271310] text-[#feca4d] px-4 py-3 rounded-xl border border-[#feca4d]/40 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Bar / Dedicated Owner Console Header */}
      <div className="bg-[#1f110f] text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg border border-[#3e2723]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#785a00] to-[#feca4d] p-0.5 flex items-center justify-center shadow-sm shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#140b09] flex items-center justify-center text-[#feca4d]">
              <Coffee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="text-lg sm:text-xl font-bold text-white tracking-wide font-serif"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Cà Phê Vietnam Roastery
              </h1>
              <span className="bg-[#feca4d]/20 text-[#feca4d] text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full tracking-wider border border-[#feca4d]/40">
                Owner Portal
              </span>
              <span className="text-xs text-[#a8928e] font-mono bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                {currentAdminUser} • {currentAdminEmail}
              </span>
            </div>
            <p className="text-xs text-[#b8a09b]">
              Dedicated control console: Orders, Inventory, Pricing & Catalog
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onBackToShop}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#feca4d]" />
            <span>← Live Storefront</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadOrders();
              loadAdminProducts();
              showToast('Refreshed data from database.');
            }}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#feca4d]" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
          >
            <Key className="w-3.5 h-3.5 text-[#feca4d]" />
            <span className="hidden sm:inline">Password</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-700/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* DEDICATED OWNER NAVIGATION BAR (ONLY 6 OWNER-RELEVANT SECTIONS) */}
      <div className="bg-[#1d1210] p-1.5 rounded-2xl border border-[#3e2723] flex items-center overflow-x-auto no-scrollbar gap-1.5 shadow-md">
        {/* Section 1: Dashboard Overview */}
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#feca4d] text-[#271310] shadow-sm'
              : 'text-[#d6c7c4] hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        {/* Section 2: Orders */}
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#feca4d] text-[#271310] shadow-sm'
              : 'text-[#d6c7c4] hover:bg-white/10'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders</span>
          {activeInPipelineCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#feca4d] text-[#271310] text-[10px] font-extrabold flex items-center justify-center">
              {activeInPipelineCount}
            </span>
          )}
        </button>

        {/* Section 3: Inventory Control */}
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#feca4d] text-[#271310] shadow-sm'
              : 'text-[#d6c7c4] hover:bg-white/10'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Inventory Control</span>
          {outOfStockItems.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-extrabold">
              {outOfStockItems.length} Out
            </span>
          )}
        </button>

        {/* Section 4: Price Control */}
        <button
          type="button"
          onClick={() => setActiveTab('prices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'prices'
              ? 'bg-[#feca4d] text-[#271310] shadow-sm'
              : 'text-[#d6c7c4] hover:bg-white/10'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Price Control</span>
        </button>

        {/* Section 5: Product Management */}
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#feca4d] text-[#271310] shadow-sm'
              : 'text-[#d6c7c4] hover:bg-white/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Product Management</span>
        </button>

        {/* Section 6: Direct Nav Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-rose-300 hover:bg-rose-950/40 ml-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards: Total Orders, Active In-Pipeline, Delivered, Total Sales Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Orders */}
            <div className="bg-[#1d1210] p-5 rounded-2xl border border-[#3e2723] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#b8a09b] uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="text-3xl font-bold text-white font-serif block mt-1">
                  {totalOrdersCount}
                </span>
                <span className="text-[11px] text-[#feca4d] font-medium">
                  All customer orders placed
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#2a1a17] border border-[#3e2723] text-[#feca4d] flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 2: Active In-Pipeline */}
            <div className="bg-[#1d1210] p-5 rounded-2xl border border-[#3e2723] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#b8a09b] uppercase tracking-wider block">
                  Active In-Pipeline
                </span>
                <span className="text-3xl font-bold text-amber-400 font-serif block mt-1">
                  {activeInPipelineCount}
                </span>
                <span className="text-[11px] text-amber-300 font-medium">
                  Roasting, packed or in transit
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 3: Delivered */}
            <div className="bg-[#1d1210] p-5 rounded-2xl border border-[#3e2723] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#b8a09b] uppercase tracking-wider block">
                  Delivered
                </span>
                <span className="text-3xl font-bold text-emerald-400 font-serif block mt-1">
                  {deliveredOrdersCount}
                </span>
                <span className="text-[11px] text-emerald-300 font-medium">
                  Completed customer deliveries
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 4: Total Sales Volume */}
            <div className="bg-[#1d1210] p-5 rounded-2xl border border-[#3e2723] shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#b8a09b] uppercase tracking-wider block">
                  Total Sales Volume
                </span>
                <span className="text-3xl font-bold text-white font-serif block mt-1">
                  {formatPrice(totalRevenue, currency)}
                </span>
                <span className="text-[11px] text-[#feca4d] font-medium">
                  Gross revenue generated
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#2a1a17] border border-[#3e2723] text-[#feca4d] flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Roastery Inventory Alerts Banner */}
          {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
            <div className="bg-amber-950/40 border border-amber-800/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-900/60 text-amber-300 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-200">
                    Stock Attention Required ({outOfStockItems.length} Out of Stock, {lowStockItems.length} Low Stock)
                  </h4>
                  <p className="text-xs text-amber-300/80">
                    Items set to 0 stock automatically show as "Out of Stock" on the customer website.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#271310] font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                Manage in Inventory Control →
              </button>
            </div>
          )}

          {/* Low Stock Alerts Section */}
          {lowStockItems.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Low & Out of Stock Alerts ({lowStockItems.length} items)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs text-rose-800 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Open Inventory Manager</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockItems.slice(0, 6).map((item) => {
                  const isOut = (item.stockQuantity ?? 0) <= 0;
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-3 rounded-xl border border-rose-200 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#271310] truncate">{item.name}</p>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isOut
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {isOut ? 'OUT OF STOCK (0)' : `Only ${item.stockQuantity} units left`}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setStockDrafts((prev) => ({ ...prev, [item.id]: 50 }));
                          setActiveTab('inventory');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#271310] hover:bg-[#785a00] text-white text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Restock
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#271310]">Recent Orders</h3>
                <p className="text-xs text-[#827472]">Latest coffee purchases made by customers</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="text-xs text-[#785a00] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Orders ({orders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#827472] border border-dashed border-[#d3c3c0] rounded-xl">
                No orders recorded yet. Fresh customer orders will show up here in real time.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#d3c3c0]/50 text-[10px] uppercase tracking-wider text-[#827472]">
                      <th className="py-2.5 px-3">Order ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d3c3c0]/40">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.orderId} className="hover:bg-[#faf2f0]/60">
                        <td className="py-3 px-3 font-mono font-bold text-[#785a00]">
                          {ord.orderId}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-[#271310]">{ord.customerName}</p>
                          <p className="text-[10px] text-[#827472]">{ord.cityPincode}</p>
                        </td>
                        <td className="py-3 px-3 text-[#504442]">
                          {ord.items.length} item(s)
                        </td>
                        <td className="py-3 px-3 font-bold text-[#271310]">
                          {formatPrice(ord.finalTotalINR, currency)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : ord.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-[11px] text-[#827472]">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Filters & Export Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#d3c3c0]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
                <input
                  type="text"
                  value={searchOrdersQuery}
                  onChange={(e) => setSearchOrdersQuery(e.target.value)}
                  placeholder="Search by Order ID, name, email, phone, city..."
                  className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#271310] focus:outline-none focus:border-[#785a00]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] focus:outline-none focus:border-[#785a00] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="placed">Order Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                type="button"
                onClick={handleExportOrdersJSON}
                className="px-3 py-2 rounded-xl bg-[#271310] hover:bg-[#3d201c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#feca4d]" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#d3c3c0]/70 text-center space-y-2">
              <Package className="w-8 h-8 text-[#827472] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#271310]">No matching orders found</p>
              <p className="text-xs text-[#827472]">Try changing your search query or status filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isEditingAwb = editingAwbOrderId === order.orderId;

                return (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-2xl border border-[#d3c3c0]/80 p-5 shadow-xs hover:shadow-sm transition-all space-y-4"
                  >
                    {/* Order Top Line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#d3c3c0]/50">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-[#785a00]">
                            {order.orderId}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : order.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : order.status === 'In Transit'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#827472] mt-0.5">
                          Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'} • Payment: {order.paymentMethod}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#827472] block">
                          Total Amount
                        </span>
                        <span className="text-base font-bold text-[#271310] font-serif">
                          {formatPrice(order.finalTotalINR, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Shipping Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-[#faf2f0]/70 p-3 rounded-xl border border-[#d3c3c0]/40 space-y-1">
                        <span className="text-[10px] font-bold text-[#785a00] uppercase block">
                          Customer Details
                        </span>
                        <p className="font-bold text-[#271310]">{order.customerName}</p>
                        <p className="text-[#504442]">{order.customerEmail}</p>
                        <p className="text-[#504442]">{order.customerPhone}</p>
                      </div>

                      <div className="bg-[#faf2f0]/70 p-3 rounded-xl border border-[#d3c3c0]/40 space-y-1">
                        <span className="text-[10px] font-bold text-[#785a00] uppercase block">
                          Delivery Address
                        </span>
                        <p className="text-[#271310]">{order.shippingAddress}</p>
                        <p className="text-[#504442]">{order.cityPincode}</p>
                        {order.landmark && <p className="text-[#827472]">Landmark: {order.landmark}</p>}
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#827472] uppercase block">
                        Ordered Items ({order.items.length})
                      </span>
                      <div className="divide-y divide-[#d3c3c0]/40 border border-[#d3c3c0]/60 rounded-xl overflow-hidden bg-white">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-[#271310]">{item.name}</p>
                                <p className="text-[11px] text-[#827472]">
                                  {item.selectedSize} {item.selectedGrind ? `• ${item.selectedGrind}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-[#271310]">
                                {item.quantity} × {formatPrice(item.unitPriceINR, currency)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Changer & Courier AWB */}
                    <div className="pt-2 border-t border-[#d3c3c0]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Status Stepper */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-[#827472] mr-1">
                          Update Status:
                        </span>
                        {(['Order Placed', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'] as OrderState[]).map(
                          (st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleOrderStatusChange(order.orderId, st)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                order.status === st
                                  ? 'bg-[#271310] text-[#feca4d] border-[#271310]'
                                  : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0] hover:bg-white'
                              }`}
                            >
                              {st}
                            </button>
                          )
                        )}
                      </div>

                      {/* Courier Tracking */}
                      <div>
                        {isEditingAwb ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={courierInput}
                              onChange={(e) => setCourierInput(e.target.value)}
                              placeholder="Courier (e.g. Bluedart)"
                              className="bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2 py-1 text-[11px] w-28"
                            />
                            <input
                              type="text"
                              value={awbInput}
                              onChange={(e) => setAwbInput(e.target.value)}
                              placeholder="Tracking AWB"
                              className="bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2 py-1 text-[11px] w-32"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCourierDetails(order.orderId)}
                              className="p-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAwbOrderId(null)}
                              className="p-1 rounded-lg bg-stone-200 text-stone-700 text-[10px] cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {order.trackingNumber ? (
                              <span className="text-[11px] text-[#271310] bg-[#faf2f0] px-2 py-1 rounded-lg border border-[#d3c3c0]/60">
                                <strong>{order.courierPartner || 'Courier'}:</strong> {order.trackingNumber}
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#827472] italic">No AWB assigned</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAwbOrderId(order.orderId);
                                setAwbInput(order.trackingNumber || '');
                                setCourierInput(order.courierPartner || 'Bluedart Express');
                              }}
                              className="text-[11px] text-[#785a00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{order.trackingNumber ? 'Edit' : 'Add AWB'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVENTORY CONTROL */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#d3c3c0]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-base text-[#271310]">Inventory Control</h3>
              <p className="text-xs text-[#827472]">
                Editable stock quantity for each product. Setting stock to <strong>0</strong> immediately marks it <strong>Out of Stock</strong> on the live customer storefront.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAllStock}
                className="px-4 py-2 rounded-xl bg-[#271310] hover:bg-[#3d201c] text-[#feca4d] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save All Inventory</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
              <input
                type="text"
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                placeholder="Search products by name or notes..."
                className="w-full bg-white border border-[#d3c3c0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#271310] focus:outline-none focus:border-[#785a00]"
              />
            </div>
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="bg-white border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] focus:outline-none focus:border-[#785a00]"
            >
              <option value="all">All Categories</option>
              <option value="flavoured-coffee">Flavoured Coffee</option>
              <option value="coffee-powder">Coffee Powders</option>
              <option value="instant-coffee">Instant Coffee</option>
              <option value="whole-bean">Whole Beans</option>
              <option value="brewing-gear">Brewing Gear</option>
            </select>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf2f0] border-b border-[#d3c3c0]/60 text-[10px] uppercase tracking-wider text-[#827472]">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Live Status</th>
                    <th className="py-3 px-4">Stock Quantity</th>
                    <th className="py-3 px-4">Quick Actions</th>
                    <th className="py-3 px-4 text-right">Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d3c3c0]/40">
                  {filteredProducts.map((prod) => {
                    const currentStock = stockDrafts[prod.id] !== undefined ? stockDrafts[prod.id] : (prod.stockQuantity ?? 50);
                    const isOut = currentStock <= 0;
                    const isLow = currentStock > 0 && currentStock <= 10;
                    const isSaving = savingRows[prod.id];

                    return (
                      <tr key={prod.id} className="hover:bg-[#faf2f0]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-11 h-11 rounded-lg object-cover bg-stone-100 shrink-0 border border-[#d3c3c0]/40"
                            />
                            <div>
                              <p className="font-bold text-[#271310]">{prod.name}</p>
                              <p className="text-[10px] text-[#785a00] italic">{prod.vietnameseName}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#504442] capitalize">
                          {prod.category.replace('-', ' ')}
                        </td>

                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Low Stock ({currentStock})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              In Stock ({currentStock})
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={currentStock}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setStockDrafts((prev) => ({ ...prev, [prod.id]: val }));
                              }}
                              className={`w-20 px-2.5 py-1.5 rounded-lg border text-xs font-bold text-center focus:outline-none ${
                                isOut
                                  ? 'bg-rose-50 border-rose-400 text-rose-900'
                                  : 'bg-white border-[#d3c3c0] text-[#271310] focus:border-[#785a00]'
                              }`}
                            />
                            <span className="text-[11px] text-[#827472]">units</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setStockDrafts((prev) => ({ ...prev, [prod.id]: 0 }));
                              }}
                              className="px-2 py-1 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Set stock to 0 (Mark Out of Stock)"
                            >
                              Set 0 (Out)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStockDrafts((prev) => ({
                                  ...prev,
                                  [prod.id]: (prev[prod.id] || 0) + 25,
                                }));
                              }}
                              className="px-2 py-1 rounded-md bg-[#faf2f0] hover:bg-[#eee3e1] text-[#271310] text-[10px] font-semibold border border-[#d3c3c0] transition-colors cursor-pointer"
                            >
                              +25
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStockDrafts((prev) => ({
                                  ...prev,
                                  [prod.id]: (prev[prod.id] || 0) + 50,
                                }));
                              }}
                              className="px-2 py-1 rounded-md bg-[#faf2f0] hover:bg-[#eee3e1] text-[#271310] text-[10px] font-semibold border border-[#d3c3c0] transition-colors cursor-pointer"
                            >
                              +50
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveStock(prod.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#271310] hover:bg-[#785a00] disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRICE CONTROL */}
      {activeTab === 'prices' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#d3c3c0]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-base text-[#271310]">Price Control</h3>
              <p className="text-xs text-[#827472]">
                Edit base prices in INR (₹). Price changes reflect in real time on the live customer storefront without needing a redeployment.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveAllPrices}
              className="px-4 py-2 rounded-xl bg-[#271310] hover:bg-[#3d201c] text-[#feca4d] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All Prices</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
              <input
                type="text"
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                placeholder="Search products by name..."
                className="w-full bg-white border border-[#d3c3c0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#271310] focus:outline-none focus:border-[#785a00]"
              />
            </div>
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="bg-white border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] focus:outline-none focus:border-[#785a00]"
            >
              <option value="all">All Categories</option>
              <option value="flavoured-coffee">Flavoured Coffee</option>
              <option value="coffee-powder">Coffee Powders</option>
              <option value="instant-coffee">Instant Coffee</option>
              <option value="whole-bean">Whole Beans</option>
              <option value="brewing-gear">Brewing Gear</option>
            </select>
          </div>

          {/* Price Control Table */}
          <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf2f0] border-b border-[#d3c3c0]/60 text-[10px] uppercase tracking-wider text-[#827472]">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Original Base Price</th>
                    <th className="py-3 px-4">New Base Price (₹)</th>
                    <th className="py-3 px-4">Customer Preview ({currency})</th>
                    <th className="py-3 px-4">Change</th>
                    <th className="py-3 px-4 text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d3c3c0]/40">
                  {filteredProducts.map((prod) => {
                    const currentPrice = priceDrafts[prod.id] !== undefined ? priceDrafts[prod.id] : prod.basePriceINR;
                    const diff = currentPrice - prod.basePriceINR;
                    const isSaving = savingRows[prod.id];

                    return (
                      <tr key={prod.id} className="hover:bg-[#faf2f0]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-11 h-11 rounded-lg object-cover bg-stone-100 shrink-0 border border-[#d3c3c0]/40"
                            />
                            <div>
                              <p className="font-bold text-[#271310]">{prod.name}</p>
                              <p className="text-[10px] text-[#785a00] italic">{prod.vietnameseName}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-[#504442]">
                          ₹{prod.basePriceINR}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-[#785a00]">₹</span>
                            <input
                              type="number"
                              min="1"
                              value={currentPrice}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                setPriceDrafts((prev) => ({ ...prev, [prod.id]: val }));
                              }}
                              className="w-24 px-3 py-1.5 rounded-lg border border-[#d3c3c0] bg-white text-xs font-bold text-[#271310] focus:outline-none focus:border-[#785a00]"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-[#271310] font-serif">
                          {formatPrice(currentPrice, currency)}
                        </td>

                        <td className="py-3 px-4">
                          {diff === 0 ? (
                            <span className="text-[#827472] text-[11px]">Unchanged</span>
                          ) : diff > 0 ? (
                            <span className="text-emerald-700 font-bold text-[11px]">+₹{diff}</span>
                          ) : (
                            <span className="text-rose-700 font-bold text-[11px]">-₹{Math.abs(diff)}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            disabled={isSaving || diff === 0}
                            onClick={() => handleSavePrice(prod.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#785a00] hover:bg-[#8e6b00] disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            {isSaving ? 'Saving...' : 'Apply'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#d3c3c0]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="font-serif font-bold text-base text-[#271310]">Product Catalog Management</h3>
              <p className="text-xs text-[#827472]">
                Add new Vietnamese coffee roasts, edit existing descriptions/variants, or toggle visibility on the live store.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setProductFormState({
                  category: 'flavoured-coffee',
                  basePriceINR: 390,
                  stockQuantity: 50,
                  caffeineScore: 4,
                  isActive: true,
                });
                setIsNewProductModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#271310] hover:bg-[#3d201c] text-[#feca4d] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const isHidden = prod.isActive === false;

              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
                    isHidden ? 'border-dashed border-stone-400 opacity-70' : 'border-[#d3c3c0]/80 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Image & Badges */}
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-100 border border-[#d3c3c0]/40">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="bg-[#271310]/90 text-[#feca4d] text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          {prod.category.replace('-', ' ')}
                        </span>
                        {isHidden && (
                          <span className="bg-rose-700 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            Hidden / Inactive
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 right-2 bg-white/95 text-[#271310] text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                        {formatPrice(prod.basePriceINR, currency)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#271310] font-serif line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-[#785a00] italic truncate">
                        {prod.vietnameseName}
                      </p>
                      <p className="text-xs text-[#504442] line-clamp-2 mt-1">
                        {prod.tagline}
                      </p>
                    </div>

                    <div className="text-[11px] text-[#827472] flex items-center justify-between pt-1 border-t border-[#d3c3c0]/40">
                      <span>Stock: <strong>{prod.stockQuantity ?? 50} units</strong></span>
                      <span>Energy: <strong>{prod.caffeineScore}/5</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#d3c3c0]/40 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleProductActive(prod)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isHidden
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isHidden ? 'Publish to Live' : 'Hide from Store'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(prod);
                          setProductFormState({
                            ...prod,
                            tastingNotes: prod.tastingNotes,
                          });
                          setIsNewProductModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-[#faf2f0] hover:bg-[#eee3e1] text-[#785a00] border border-[#d3c3c0] transition-colors cursor-pointer"
                        title="Edit Product Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-[#d3c3c0] my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#d3c3c0]/60">
              <h3
                className="font-serif font-bold text-lg text-[#271310]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Vietnamese Coffee Product'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsNewProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-[#827472] hover:text-[#271310] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#827472] uppercase block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={productFormState.name || ''}
                    onChange={(e) => setProductFormState({ ...productFormState, name: e.target.value })}
                    placeholder="e.g. Đà Lạt Highland Typica Arabica"
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-[#271310] focus:outline-none focus:border-[#785a00]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#827472] uppercase block mb-1">
                    Authentic Vietnamese Name
                  </label>
                  <input
                    type="text"
                    value={productFormState.vietnameseName || ''}
                    onChange={(e) => setProductFormState({ ...productFormState, vietnameseName: e.target.value })}
                    placeholder="e.g. Cà Phê Culi Đắk Lắk"
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-[#271310] focus:outline-none focus:border-[#785a00]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#827472] uppercase block mb-1">
                  Tagline / Brief Summary
                </label>
                <input
                  type="text"
                  value={productFormState.tagline || ''}
                  onChange={(e) => setProductFormState({ ...productFormState, tagline: e.target.value })}
                  placeholder="Single-line headline for cards"
                  className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-[#271310] focus:outline-none focus:border-[#785a00]"
                />
              </div>

              <div>
                <label className="font-bold text-[#827472] uppercase block mb-1">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={productFormState.description || ''}
                  onChange={(e) => setProductFormState({ ...productFormState, description: e.target.value })}
                  placeholder="Detailed roastery notes, terroir, harvest info..."
                  className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl p-3 text-[#271310] focus:outline-none focus:border-[#785a00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-[#827472] uppercase block mb-1">
                    Category *
                  </label>
                  <select
                    value={productFormState.category || 'flavoured-coffee'}
                    onChange={(e) =>
                      setProductFormState({
                        ...productFormState,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-[#271310] focus:outline-none focus:border-[#785a00]"
                  >
                    <option value="flavoured-coffee">Flavoured Coffee</option>
                    <option value="coffee-powder">Coffee Powders</option>
                    <option value="instant-coffee">Instant Coffee</option>
                    <option value="whole-bean">Whole Beans</option>
                    <option value="brewing-gear">Brewing Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#827472] uppercase block mb-1">
                    Base Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={productFormState.basePriceINR || 350}
                    onChange={(e) =>
                      setProductFormState({ ...productFormState, basePriceINR: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-[#271310] focus:outline-none focus:border-[#785a00]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#827472] uppercase block mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productFormState.stockQuantity ?? 50}
                    onChange={(e) =>
                      setProductFormState({ ...productFormState, stockQuantity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-[#271310] focus:outline-none focus:border-[#785a00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#827472] uppercase block mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={productFormState.imageUrl || ''}
                    onChange={(e) => setProductFormState({ ...productFormState, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-[#271310] focus:outline-none focus:border-[#785a00]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#827472] uppercase block mb-1">
                    Caffeine Energy Score (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={productFormState.caffeineScore || 4}
                    onChange={(e) =>
                      setProductFormState({ ...productFormState, caffeineScore: parseInt(e.target.value) || 4 })
                    }
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-[#271310] focus:outline-none focus:border-[#785a00]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#d3c3c0]/60">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#271310] hover:bg-[#785a00] text-[#feca4d] font-bold transition-colors cursor-pointer shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE ADMIN PASSWORD */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#d3c3c0] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#d3c3c0]/60">
              <h3 className="font-serif font-bold text-base text-[#271310]">
                Change Roastery Admin Password
              </h3>
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="text-[#827472] hover:text-[#271310]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <p className="text-[#504442]">
                Update the server-side password for logging into this private roastery portal.
              </p>

              <div>
                <label className="font-bold text-[#827472] uppercase block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2.5 text-[#271310] focus:outline-none focus:border-[#785a00]"
                />
              </div>

              {changePasswordMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold ${
                    changePasswordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {changePasswordMsg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#271310] hover:bg-[#785a00] text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
