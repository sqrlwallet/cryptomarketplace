import { BookOpen, ShoppingBag, Store, Wallet, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Tutorial() {
    return (
        <div className="max-w-6xl mx-auto space-y-16 pb-20">
            {/* Header Section */}
            <div className="text-center space-y-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 bg-primary/5 -skew-y-3 -z-10 blur-3xl" />
                <h1 className="text-6xl md:text-8xl font-black font-display uppercase tracking-tighter text-white drop-shadow-[4px_4px_0px_rgba(255,0,0,1)]">
                    How to <span className="text-primary">Ripework</span>
                </h1>
                <p className="text-2xl text-gray-400 font-mono max-w-2xl mx-auto border-l-4 border-primary pl-6 text-left">
                    Master the decentralized marketplace. Buy exclusive content. Sell your creations. Secure & Anonymous.
                </p>
            </div>

            {/* Getting Started - Hero Card */}
            <div className="neo-card p-8 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen className="w-64 h-64 text-white" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="p-4 bg-primary border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            <Zap className="w-10 h-10 text-black" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold font-display uppercase tracking-wide text-white">
                            The Basics
                        </h2>
                    </div>
                    <p className="text-xl text-gray-300 leading-relaxed font-mono max-w-3xl">
                        Ripework is a next-gen marketplace for digital goods. We cut out the middleman using blockchain technology.
                        <span className="text-primary font-bold"> No accounts required for browsing.</span>
                        <span className="text-white font-bold"> Instant payments.</span>
                        <span className="text-primary font-bold"> Zero censorship.</span>
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* For Buyers */}
                <div className="neo-card p-8 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-br from-surface to-surface/50">
                    <div className="flex items-center space-x-4 mb-8 border-b-2 border-white/20 pb-6">
                        <div className="p-3 bg-blue-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            <ShoppingBag className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-3xl font-bold font-display uppercase tracking-wide text-white">
                            For Buyers
                        </h2>
                    </div>

                    <div className="space-y-8 font-mono">
                        {[
                            { title: "Browse", desc: "Find exclusive digital goods. Filter by category, price, or seller.", icon: "01" },
                            { title: "Connect", desc: "Link your crypto wallet. We support major networks for instant settlement.", icon: "02" },
                            { title: "Own", desc: "Pay and instantly download. You own the files forever.", icon: "03" }
                        ].map((step, i) => (
                            <div key={i} className="flex items-start space-x-4 group">
                                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-transparent leading-none opacity-50 group-hover:opacity-100 transition-opacity">
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors flex items-center">
                                        {step.title} <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* For Sellers */}
                <div className="neo-card p-8 hover:-translate-y-2 transition-transform duration-300 bg-gradient-to-br from-surface to-surface/50">
                    <div className="flex items-center space-x-4 mb-8 border-b-2 border-white/20 pb-6">
                        <div className="p-3 bg-green-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            <Store className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-3xl font-bold font-display uppercase tracking-wide text-white">
                            For Sellers
                        </h2>
                    </div>

                    <div className="space-y-8 font-mono">
                        {[
                            { title: "Join", desc: "Click 'Start Selling'. Set your alias. No KYC required.", icon: "01" },
                            { title: "List", desc: "Upload files. Set your price in crypto. Add a killer description.", icon: "02" },
                            { title: "Earn", desc: "Get paid instantly to your wallet when someone buys. 10% platform fee.", icon: "03" }
                        ].map((step, i) => (
                            <div key={i} className="flex items-start space-x-4 group">
                                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-500 to-transparent leading-none opacity-50 group-hover:opacity-100 transition-opacity">
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors flex items-center">
                                        {step.title} <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Wallet & Security */}
            <div className="neo-card p-8 border-l-8 border-l-purple-500">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="flex items-center space-x-6">
                        <div className="p-4 bg-purple-500 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            <ShieldCheck className="w-8 h-8 text-black" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold font-display uppercase tracking-wide text-white mb-2">
                                Security First
                            </h2>
                            <p className="text-gray-400 font-mono text-sm max-w-md">
                                Your safety is paramount. We use smart contracts to ensure trustless transactions.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-black/50 p-4 border border-white/10">
                            <h4 className="text-purple-400 font-bold mb-1 uppercase text-xs">Encryption</h4>
                            <p className="text-white text-sm">End-to-end secure</p>
                        </div>
                        <div className="bg-black/50 p-4 border border-white/10">
                            <h4 className="text-purple-400 font-bold mb-1 uppercase text-xs">Custody</h4>
                            <p className="text-white text-sm">Self-custodial</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
