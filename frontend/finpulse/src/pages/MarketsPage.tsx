import { useState, useMemo } from "react";
import { useLivePrices } from "../hooks/useLivePrices";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Star, TrendingUp, TrendingDown, Flame, StarOff } from "lucide-react";
import { useTranslation } from "react-i18next";

const SYMBOL_TO_ID: Record<string, string> = {
    "BTC-USDT": "bitcoin", "ETH-USDT": "ethereum", "SOL-USDT": "solana",
    "ADA-USDT": "cardano", "AVAX-USDT": "avalanche-2", "XRP-USDT": "ripple",
    "DOT-USDT": "polkadot", "DOGE-USDT": "dogecoin", "PEPE-USDT": "pepe",
    "TON-USDT": "the-open-network", "BTC-TRY": "bitcoin", "ETH-TRY": "ethereum",
    "SOL-TRY": "solana", "XRP-TRY": "ripple", "DOGE-TRY": "dogecoin",
    "USDT-TRY": "tether",
};

function getCoinId(symbol: string) {
    return SYMBOL_TO_ID[symbol] || symbol.split("-")[0].toLowerCase();
}

function formatPrice(price: number): string {
    if (price < 0.001) return price.toLocaleString("tr-TR", { minimumFractionDigits: 5, maximumFractionDigits: 8 });
    if (price < 1) return price.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    if (price < 10) return price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MiniSparkline({ positive }: { positive: boolean }) {
    const color = positive ? "#22c55e" : "#ef4444";
    const points = positive
        ? "0,28 10,22 20,25 30,18 40,20 50,14 60,16 70,10 80,12 90,8 100,10"
        : "0,10 10,14 20,12 30,18 40,16 50,22 60,20 70,24 80,22 90,26 100,28";

    return (
        <svg width="100" height="36" viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <polygon
                points={`0,36 ${points} 100,36`}
                fill={`url(#grad-${positive})`}
            />
        </svg>
    );
}

type TabType = "trending" | "gainers" | "losers" | "favorites";

export default function MarketsPage() {
    const { prices } = useLivePrices();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>("trending");
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
    };

    const trending = useMemo(() => [...prices].slice(0, 8), [prices]);
    const gainers = useMemo(
        () => [...prices].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)).slice(0, 8),
        [prices]
    );
    const losers = useMemo(
        () => [...prices].sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)).slice(0, 8),
        [prices]
    );
    const favoriteCoins = useMemo(() => prices.filter((p) => favorites.has(p.symbol)), [prices, favorites]);

    const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(symbol)) next.delete(symbol);
            else next.add(symbol);
            return next;
        });
    };

    const columnCoins = { trending, gainers: gainers.slice(0, 4), losers: losers.slice(0, 4) };

    const tabData: Record<TabType, typeof prices> = {
        trending,
        gainers,
        losers,
        favorites: favoriteCoins,
    };

    const tabs: { key: TabType; label: string; icon: React.ReactNode; color: string }[] = [
        { key: "trending", label: t("markets.trending"), icon: <Flame className="h-4 w-4" />, color: "text-orange-400 border-orange-400" },
        { key: "gainers", label: t("markets.gainers"), icon: <TrendingUp className="h-4 w-4" />, color: "text-emerald-400 border-emerald-400" },
        { key: "losers", label: t("markets.losers"), icon: <TrendingDown className="h-4 w-4" />, color: "text-rose-400 border-rose-400" },
        { key: "favorites", label: t("markets.favorites"), icon: <Star className="h-4 w-4" />, color: "text-yellow-400 border-yellow-400" },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10">
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold tracking-tight text-white">{t("markets.title")}</h1>
            </motion.div>

            {/* 3-column cards */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* Trending */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span className="font-semibold text-white text-sm">{t("markets.trending")}</span>
                    </div>
                    <div className="overflow-y-auto max-h-72 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {columnCoins.trending.slice(0, 4).map((coin) => (
                            <div
                                key={coin.symbol}
                                onClick={() => navigate(`/coin/${getCoinId(coin.symbol)}${coin.symbol.endsWith("-TRY") ? "?currency=try" : ""}`)}
                                className="flex items-center justify-between px-5 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500/30 to-yellow-500/20 flex items-center justify-center text-xs font-bold text-orange-300 flex-shrink-0">
                                        {coin.symbol.split("-")[0].substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white leading-none">{coin.symbol}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{coin.symbol.split("-")[0]}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">{formatPrice(coin.current_price)} {coin.symbol.endsWith("-TRY") ? "TRY" : "USDT"}</p>
                                    <p className={`text-xs font-medium mt-0.5 ${(coin.price_change_percentage_24h ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                        {(coin.price_change_percentage_24h ?? 0) >= 0 ? "▲" : "▼"} %{Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Gainers */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="font-semibold text-white text-sm">{t("markets.gainers")}</span>
                    </div>
                    <div className="overflow-y-auto max-h-72 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {columnCoins.gainers.map((coin) => (
                            <div
                                key={coin.symbol}
                                onClick={() => navigate(`/coin/${getCoinId(coin.symbol)}${coin.symbol.endsWith("-TRY") ? "?currency=try" : ""}`)}
                                className="flex items-center justify-between px-5 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-emerald-300 flex-shrink-0">
                                        {coin.symbol.split("-")[0].substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white leading-none">{coin.symbol}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{coin.symbol.split("-")[0]}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">{formatPrice(coin.current_price)} {coin.symbol.endsWith("-TRY") ? "TRY" : "USDT"}</p>
                                    <p className="text-xs font-medium mt-0.5 text-emerald-400">
                                        ▲ %{Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Losers */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
                        <TrendingDown className="h-4 w-4 text-rose-400" />
                        <span className="font-semibold text-white text-sm">{t("markets.losers")}</span>
                    </div>
                    <div className="overflow-y-auto max-h-72 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {columnCoins.losers.map((coin) => (
                            <div
                                key={coin.symbol}
                                onClick={() => navigate(`/coin/${getCoinId(coin.symbol)}${coin.symbol.endsWith("-TRY") ? "?currency=try" : ""}`)}
                                className="flex items-center justify-between px-5 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-500/30 to-pink-500/20 flex items-center justify-center text-xs font-bold text-rose-300 flex-shrink-0">
                                        {coin.symbol.split("-")[0].substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white leading-none">{coin.symbol}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{coin.symbol.split("-")[0]}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">{formatPrice(coin.current_price)} {coin.symbol.endsWith("-TRY") ? "TRY" : "USDT"}</p>
                                    <p className="text-xs font-medium mt-0.5 text-rose-400">
                                        ▼ %{Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Tabs + Detail Table */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                {/* Tab Bar */}
                <div className="flex items-center border-b border-white/10 px-2 pt-1 gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                                activeTab === tab.key
                                    ? `${tab.color} border-current`
                                    : "text-slate-400 border-transparent hover:text-slate-200"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-white/5">
                    <div className="w-8"></div>
                    <div>{t("markets.coinName")}</div>
                    <div className="text-right">{t("markets.price")}</div>
                    <div className="text-right">{t("markets.change24h")}</div>
                    <div className="text-right">{t("markets.chart")}</div>
                </div>

                {/* Table Rows */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {tabData[activeTab].length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <StarOff className="h-10 w-10 text-slate-600 mb-3" />
                                <p className="text-slate-400 font-medium">{t("markets.noFavorites")}</p>
                                <p className="text-slate-500 text-sm mt-1">{t("markets.noFavoritesDesc")}</p>
                            </div>
                        ) : (
                            tabData[activeTab].map((coin) => {
                                const isPos = (coin.price_change_percentage_24h ?? 0) >= 0;
                                const isFav = favorites.has(coin.symbol);
                                return (
                                    <div
                                        key={coin.symbol}
                                        onClick={() => navigate(`/coin/${getCoinId(coin.symbol)}${coin.symbol.endsWith("-TRY") ? "?currency=try" : ""}`)}
                                        className="grid grid-cols-[auto_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors group"
                                    >
                                        {/* Star */}
                                        <button
                                            onClick={(e) => toggleFavorite(coin.symbol, e)}
                                            className={`w-8 flex items-center justify-center transition-colors ${isFav ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400"}`}
                                        >
                                            <Star className="h-4 w-4" fill={isFav ? "currentColor" : "none"} />
                                        </button>

                                        {/* Coin Name */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                isPos
                                                    ? "bg-emerald-500/20 text-emerald-300"
                                                    : "bg-rose-500/20 text-rose-300"
                                            }`}>
                                                {coin.symbol.split("-")[0].substring(0, 2)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white leading-none truncate">{coin.symbol}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{coin.symbol.split("-")[0]}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-white">
                                                {formatPrice(coin.current_price)} {coin.symbol.endsWith("-TRY") ? "TRY" : "USDT"}
                                            </p>
                                        </div>

                                        {/* Change */}
                                        <div className="text-right">
                                            <span className={`text-sm font-semibold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                                                {isPos ? "+" : ""}{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                                            </span>
                                        </div>

                                        {/* Sparkline */}
                                        <div className="flex justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                                            <MiniSparkline positive={isPos} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
