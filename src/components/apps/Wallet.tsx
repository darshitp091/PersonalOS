import React from 'react';
import { Wallet as WalletIcon, Coffee, Zap, Package, ExternalLink, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';

const products = [
  { id: 'coffee', amount: 500, label: 'Buy me a coffee', icon: Coffee, desc: 'Support the OS development with a quick caffeine boost.', color: '#00F5FF' },
  { id: 'freelance', amount: 5000, label: 'Freelance Deposit', icon: Zap, desc: 'Kickstart our collaboration with a secure initial deposit.', color: '#7C3AED' },
  { id: 'assets', amount: 2900, label: 'Pro UI Asset Pack', icon: Package, desc: 'Get access to my exclusive glassmorphism component library.', color: '#10B981' },
];

export default function Wallet() {
  const handlePayment = async (amount: number, name: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, productName: name }),
      });
      
      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const err = await response.json();
          alert(`Payment Error: ${err.error}`);
        } else {
          const text = await response.text();
          alert(`Server Error: ${text.substring(0, 100)}`);
        }
        return;
      }

      const session = await response.json();
      const stripe = await loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || "");
      if (stripe && session.id) {
        window.location.href = `https://checkout.stripe.com/pay/${session.id}`;
      }
    } catch (e: any) {
      alert(`Connection failed: ${e.message}`);
    }
  };

  return (
    <div className="h-full p-8 overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-os-accent mb-2">
              <WalletIcon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Finance Center</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Hire me / Support</h1>
            <p className="text-white/40 mt-1 max-w-md">Secure transactions powered by Stripe. Choose an option below to collaborate or support my work.</p>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/5 text-right">
            <div className="text-[10px] text-os-accent uppercase font-bold tracking-widest mb-1">Status</div>
            <div className="text-2xl font-bold flex items-center justify-end gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -8, borderColor: p.color + '40' }}
              className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-4 relative overflow-hidden group transition-all"
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${p.color}15`, color: p.color }}
              >
                <p.icon className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="font-bold text-xl">{p.label}</h3>
                <p className="text-xs text-white/40 mt-2 leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Pricing</div>
                  <div className="text-2xl font-bold">${p.amount / 100}</div>
                </div>
                <button 
                  onClick={() => handlePayment(p.amount, p.label)}
                  className="px-4 py-2 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Confirm
                </button>
              </div>

              {/* Decorative background shape */}
              <div 
                className="absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-20 pointer-events-none transition-all group-hover:opacity-40"
                style={{ backgroundColor: p.color }}
              />
            </motion.div>
          ))}
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-full">
              <CreditCard className="w-6 h-6 text-white/40" />
            </div>
            <div>
              <div className="font-bold">Enterprise Inquiry</div>
              <p className="text-xs text-white/30">For larger contracts, let's discuss via the terminal.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-os-accent text-xs font-bold uppercase tracking-widest hover:underline">
            View Resume <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
