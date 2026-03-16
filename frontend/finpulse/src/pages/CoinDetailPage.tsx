import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Clock,
    Zap,
    DollarSign,
    BadgeTurkishLira,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import api from "../api/axios";

interface CoinDetail {
    id: string;
    symbol: string;
    name: string;
    image: { large: string };
    market_cap_rank: number;
    description: { en: string; tr: string };
    links: {
        homepage: string[];
        blockchain_site: string[];
    };
    market_data: {
        current_price: { usd: number; try: number };
        price_change_percentage_24h: number;
        market_cap: { usd: number; try: number };
        total_volume: { usd: number; try: number };
        high_24h: { usd: number; try: number };
        low_24h: { usd: number; try: number };
        circulating_supply: number;
        ath: { usd: number; try: number };
        atl: { usd: number; try: number };
        sparkline_7d: { price: number[] };
        last_updated: string;
    };
}

export default function CoinDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [coin, setCoin] = useState<CoinDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // "try" or "usd" (default usd)
    const currencyParam = searchParams.get("currency") === "try" ? "try" : "usd";
    const [activeCurrency, setActiveCurrency] = useState<"usd" | "try">(currencyParam);

    const isTRY = activeCurrency === "try";
    const currencySymbol = isTRY ? "₺" : "$";
    const currencyLabel = isTRY ? "TRY" : "USD";

    const switchCurrency = (c: "usd" | "try") => {
        setActiveCurrency(c);
        setSearchParams(c === "try" ? { currency: "try" } : {});
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/market/coins/${id}`);
                setCoin(response.data);
            } catch (err: any) {
                const detail = err?.response?.data?.detail;
                if (err?.response?.status === 503 || err?.response?.status === 429) {
                    setError(detail || "CoinGecko API şu an rate-limit nedeniyle yanıt veremiyor. Lütfen birkaç saniye sonra tekrar deneyin.");
                } else if (err?.response?.status === 404) {
                    setError(`'${id}' coin'i bulunamadı.`);
                } else {
                    setError("Coin detayları yüklenirken bir hata oluştu.");
                }
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020617]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] text-white px-4">
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <TrendingDown className="h-10 w-10 text-rose-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Veri Alınamadı</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold text-sm transition-all"
                        >
                            Tekrar Dene
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all"
                        >
                            Geri Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!coin) return null;

    const md = coin.market_data;
    const isPositive = (md?.price_change_percentage_24h ?? 0) > 0;
    const chartData = md?.sparkline_7d?.price?.map((price, index) => ({
        time: index,
        price,
    })) || [];

    // Current values based on selected currency
    const price = isTRY ? md.current_price.try : md.current_price.usd;
    const marketCap = isTRY ? md.market_cap.try : md.market_cap.usd;
    const volume = isTRY ? md.total_volume.try : md.total_volume.usd;
    const high24h = isTRY ? md.high_24h.try : md.high_24h.usd;
    const low24h = isTRY ? md.low_24h.try : md.low_24h.usd;
    const ath = isTRY ? md.ath.try : md.ath.usd;
    const atl = isTRY ? md.atl.try : md.atl.usd;

    const formatVal = (val: number) => {
        if (val >= 1_000_000_000_000) return `${currencySymbol}${(val / 1_000_000_000_000).toFixed(2)}T`;
        if (val >= 1_000_000_000) return `${currencySymbol}${(val / 1_000_000_000).toFixed(2)}B`;
        if (val >= 1_000_000) return `${currencySymbol}${(val / 1_000_000).toFixed(2)}M`;
        return `${currencySymbol}${val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: val < 1 ? 6 : 2 })}`;
    };

    const formatPrice = (val: number) => {
        if (val >= 100_000) return `${currencySymbol}${val.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;
        if (val >= 1) return `${currencySymbol}${val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        return `${currencySymbol}${val.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`;
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
                {/* Top bar: Back + Currency Toggle */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        {t("coinDetail.backToMarket")}
                    </button>

                    {/* Currency switcher */}
                    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                        <button
                            onClick={() => switchCurrency("usd")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                !isTRY
                                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <DollarSign className="h-3 w-3" /> USD
                        </button>
                        <button
                            onClick={() => switchCurrency("try")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isTRY
                                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            <BadgeTurkishLira className="h-3 w-3" /> TRY
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Info & Chart */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                                        <img src={coin.image.large} alt={coin.name} className="h-20 w-20 relative" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h1 className="text-4xl font-bold">{coin.name}</h1>
                                            <span className="px-3 py-1 rounded-lg bg-white/10 text-slate-400 font-mono text-sm uppercase">
                                                {coin.symbol}
                                            </span>
                                            <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                                                #{coin.market_cap_rank}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {t("coinDetail.lastUpdated")}: {new Date(md.last_updated).toLocaleString("tr-TR")}
                                        </p>
                                    </div>
                                </div>

                                {/* Price / Change */}
                                <div className="text-right">
                                    <div className="text-4xl font-black mb-2 tracking-tight">
                                        {formatPrice(price)}
                                    </div>
                                    <div className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">
                                        {currencyLabel}
                                    </div>
                                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-sm ${
                                        isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                    }`}>
                                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {md.price_change_percentage_24h?.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            {/* Main Chart */}
                            <div className="h-[400px] w-full mt-10">
                                <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-cyan-400" />
                                    {t("coinDetail.priceChart")}
                                    <span className="text-xs text-slate-600 normal-case tracking-normal ml-1">(USD – 7 gün sparkline)</span>
                                </h3>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="time" hide />
                                            <YAxis
                                                domain={["auto", "auto"]}
                                                orientation="right"
                                                stroke="#64748b"
                                                fontSize={12}
                                                tickFormatter={(val) => `$${val.toLocaleString()}`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#0f172a",
                                                    border: "1px solid #1e293b",
                                                    borderRadius: "12px",
                                                    color: "#fff",
                                                }}
                                                itemStyle={{ color: "#22d3ee" }}
                                                labelStyle={{ display: "none" }}
                                                formatter={(value: any) => [`$${value?.toLocaleString()}`, "Fiyat (USD)"]}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke={isPositive ? "#10b981" : "#f43f5e"}
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorPrice)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm italic">
                                        <TrendingDown className="h-8 w-8 mb-2 opacity-20" />
                                        Bu coin için geçmiş veri bulunamadı.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Statistics */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
                        >
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-cyan-400" />
                                {t("coinDetail.performance")}
                            </h2>
                            {/* Active currency info */}
                            <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
                                {isTRY
                                    ? <><BadgeTurkishLira className="h-3 w-3" /> Türk Lirası (TRY) cinsinden gösteriliyor</>
                                    : <><DollarSign className="h-3 w-3" /> Amerikan Doları (USD) cinsinden gösteriliyor</>
                                }
                            </p>

                            <div className="space-y-6">
                                <StatItem label={t("coinDetail.marketCap")} value={formatVal(marketCap)} />
                                <StatItem label={t("coinDetail.volume")} value={formatVal(volume)} />
                                <StatItem label={t("coinDetail.high24h")} value={formatPrice(high24h)} color="text-emerald-400" />
                                <StatItem label={t("coinDetail.low24h")} value={formatPrice(low24h)} color="text-rose-400" />
                                <StatItem
                                    label={t("coinDetail.circulatingSupply")}
                                    value={`${md.circulating_supply.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ${coin.symbol.toUpperCase()}`}
                                />
                                <div className="pt-4 border-t border-white/5 space-y-4">
                                    <StatItem label={t("coinDetail.allTimeHigh")} value={formatPrice(ath)} />
                                    <StatItem label={t("coinDetail.allTimeLow")} value={formatPrice(atl)} />
                                </div>
                            </div>

                            {/* Quick currency switch inside card too */}
                            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                                <button
                                    onClick={() => switchCurrency("usd")}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                        !isTRY ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-slate-500 hover:text-slate-300"
                                    }`}
                                >
                                    $ USD
                                </button>
                                <button
                                    onClick={() => switchCurrency("try")}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                        isTRY ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-white/5 text-slate-500 hover:text-slate-300"
                                    }`}
                                >
                                    ₺ TRY
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({
    label,
    value,
    color = "text-white",
    subValue,
}: {
    label: string;
    value: string;
    color?: string;
    subValue?: string;
}) {
    return (
        <div className="flex justify-between items-start">
            <span className="text-slate-500 text-sm font-medium">{label}</span>
            <div className="text-right">
                <div className={`font-bold ${color}`}>{value}</div>
                {subValue && <div className="text-[10px] text-slate-600 mt-0.5">{subValue}</div>}
            </div>
        </div>
    );
}
