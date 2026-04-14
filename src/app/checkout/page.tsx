'use client';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Lock, CreditCard, Wallet, Banknote, Tag, Check, X, 
  Loader2, ShieldCheck, Truck 
} from 'lucide-react';

const PAYMENT_METHODS = [
  { 
    id: 'COD', 
    name: 'Cash on Delivery', 
    icon: Banknote, 
    description: 'Pay when you receive',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  { 
    id: 'GCASH', 
    name: 'GCash', 
    icon: Wallet, 
    description: 'Pay via GCash e-wallet',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  { 
    id: 'CARD', 
    name: 'Credit / Debit Card', 
    icon: CreditCard, 
    description: 'Visa, Mastercard, etc.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

interface VoucherData {
  valid: boolean;
  code: string;
  description: string;
  discount: number;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, getCartTotal, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherData | null>(null);
  const [voucherError, setVoucherError] = useState('');

  // Profile auto-fill
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  // Pre-fill from user profile
  useEffect(() => {
    if (session?.user) {
      setEmail(session.user.email || '');
      const nameParts = (session.user.name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');

      fetch('/api/user/profile')
        .then(r => r.json())
        .then(data => {
          if (data) {
            if (data.phone) setPhone(data.phone);
            if (data.address) setAddress(data.address);
            if (data.city) setCity(data.city);
            if (data.zip) setZip(data.zip);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const subtotal = getCartTotal();
  const shipping = 10;
  const tax = subtotal * 0.08;
  const discount = appliedVoucher?.discount || 0;
  const total = subtotal + shipping + tax - discount;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError('');
    setAppliedVoucher(null);

    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.trim(), subtotal }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedVoucher(data);
      } else {
        setVoucherError(data.error || 'Invalid voucher');
      }
    } catch {
      setVoucherError('Failed to validate voucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
  };

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const shippingDetails = {
      email,
      firstName,
      lastName,
      address,
      zip,
      city,
      phone,
    };
    
    try {
      const response = await fetch('/api/checkout', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items, 
          shippingDetails,
          paymentMethod,
          voucherCode: appliedVoucher?.code || null,
        }) 
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
           alert('You must be logged in to checkout.');
           window.location.href = '/api/auth/signin';
           return;
        }
        throw new Error(data.error || 'Something went wrong');
      }

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">Cannot process checkout</h2>
        <p className="text-gray-500 mb-8 max-w-md">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Checkout Form */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
            <h1 className="text-2xl font-bold text-[#1A1A2E] mb-8 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-[#0F3460]" />
              Secure Checkout
            </h1>
            
            <form onSubmit={handleCheckout} id="checkout-form" className="space-y-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="john@example.com" 
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+63 912 345 6789" 
                      value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-neutral-400" />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={firstName} 
                      onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={lastName} 
                      onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={address} 
                    onChange={e => setAddress(e.target.value)} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2 col-span-1">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" name="zip" value={zip} 
                      onChange={e => setZip(e.target.value)} required />
                  </div>
                  <div className="grid gap-2 col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={city} 
                      onChange={e => setCity(e.target.value)} required />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#0F3460]" />
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? `${method.borderColor} ${method.bgColor} shadow-md scale-[1.02]`
                        : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    {isSelected && (
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${method.bgColor}`}>
                        <Check className={`h-3 w-3 ${method.color}`} />
                      </div>
                    )}
                    <Icon className={`h-7 w-7 ${isSelected ? method.color : 'text-neutral-400'}`} />
                    <span className={`font-semibold text-sm ${isSelected ? 'text-neutral-900' : 'text-neutral-600'}`}>
                      {method.name}
                    </span>
                    <span className="text-xs text-neutral-400">{method.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voucher Section */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#E94560]" />
              Platform Voucher
            </h2>

            {appliedVoucher ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 text-sm">{appliedVoucher.code}</p>
                    <p className="text-green-600 text-xs">{appliedVoucher.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-700 font-bold">-${appliedVoucher.discount.toFixed(2)}</span>
                  <button onClick={handleRemoveVoucher} className="p-1 hover:bg-green-100 rounded-md transition-colors">
                    <X className="h-4 w-4 text-green-600" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Input
                    value={voucherCode}
                    onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(''); }}
                    placeholder="Enter voucher code"
                    className="flex-1 uppercase tracking-wider font-mono"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={voucherLoading || !voucherCode.trim()}
                    className="bg-[#E94560] hover:bg-[#d63d56] text-white px-6"
                  >
                    {voucherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
                {voucherError && (
                  <p className="text-sm text-red-500 font-medium">{voucherError}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-xl p-6 border border-neutral-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">Order Summary</h2>
            <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg bg-neutral-50 border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-6 pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Shipping</p>
                <p className="font-medium">${shipping.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Taxes</p>
                <p className="font-medium">${tax.toFixed(2)}</p>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <p className="font-medium">Voucher Discount</p>
                  <p className="font-bold">-${discount.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                <p className="text-[#1A1A2E]">Total</p>
                <p className="text-[#E94560]">${total.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment method badge */}
            <div className="mt-4 mb-4 flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg p-3 border">
              {(() => {
                const selected = PAYMENT_METHODS.find(m => m.id === paymentMethod);
                const Icon = selected?.icon || CreditCard;
                return (
                  <>
                    <Icon className={`h-4 w-4 ${selected?.color || ''}`} />
                    <span>Paying with <strong className="text-neutral-700">{selected?.name}</strong></span>
                  </>
                );
              })()}
            </div>

            <Button 
              type="submit"
              form="checkout-form"
              size="lg" 
              className="w-full h-14 text-lg bg-[#0F3460] hover:bg-[#1A1A2E] text-white flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              <Lock className="w-5 h-5" />
              <span>{isLoading ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
