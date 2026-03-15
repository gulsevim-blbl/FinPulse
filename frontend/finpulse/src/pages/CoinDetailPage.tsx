import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
    ArrowLeft, 
    TrendingUp, 
    TrendingDown, 
    BarChart3, 
    Clock,
    Zap
} from "lucide-react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from "recharts";
import api from "../api/axios";
import { toast } from "sonner";

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
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [coin, setCoin] = useState<CoinDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/market/coins/${id}`);
                setCoin(response.data);
            } catch (error) {
                toast.error(t("common.error"));
                navigate("/dashboard");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id, navigate, t]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020617]">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
        );
    }

    if (!coin) return null;

    const isPositive = (coin.market_data?.price_change_percentage_24h ?? 0) > 0;
    const chartData = coin.market_data?.sparkline_7d?.price?.map((price, index) => ({
        time: index,
        price: price
    })) || [];

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
                {/* Header / Nav */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    {t("coinDetail.backToMarket")}
                </button>

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
                                            {t("coinDetail.lastUpdated")}: {new Date(coin.market_data.last_updated).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-5xl font-black mb-2 tracking-tight">
                                        ${coin.market_data.current_price.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-sm ${
                                        isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                    }`}>
                                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {coin.market_data.price_change_percentage_24h?.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            {/* Main Chart */}
                            <div className="h-[400px] w-full mt-10">
                                <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-cyan-400" />
                                    {t("coinDetail.priceChart")}
                                </h3>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="time" hide />
                                            <YAxis 
                                                domain={['auto', 'auto']} 
                                                orientation="right" 
                                                stroke="#64748b" 
                                                fontSize={12}
                                                tickFormatter={(val) => `$${val.toLocaleString()}`}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: '#0f172a', 
                                                    border: '1px solid #1e293b',
                                                    borderRadius: '12px',
                                                    color: '#fff'
                                                }}
                                                itemStyle={{ color: '#22d3ee' }}
                                                labelStyle={{ display: 'none' }}
                                                formatter={(value: any) => [`$${value?.toLocaleString()}`, 'Price']}
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
                                        No historical data available for this coin.
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
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-cyan-400" />
                                {t("coinDetail.performance")}
                            </h2>
                            <div className="space-y-6">
                                <StatItem label={t("coinDetail.marketCap")} value={`$${coin.market_data.market_cap.usd.toLocaleString()}`} />
                                <StatItem label={t("coinDetail.volume")} value={`$${coin.market_data.total_volume.usd.toLocaleString()}`} />
                                <StatItem label={t("coinDetail.high24h")} value={`$${coin.market_data.high_24h.usd.toLocaleString()}`} color="text-emerald-400" />
                                <StatItem label={t("coinDetail.low24h")} value={`$${coin.market_data.low_24h.usd.toLocaleString()}`} color="text-rose-400" />
                                <StatItem label={t("coinDetail.circulatingSupply")} value={`${coin.market_data.circulating_supply.toLocaleString()} ${coin.symbol.toUpperCase()}`} />
                                <div className="pt-4 border-t border-white/5 space-y-4">
                                    <StatItem label={t("coinDetail.allTimeHigh")} value={`$${coin.market_data.ath.usd.toLocaleString()}`} subValue={new Date().toLocaleDateString()} />
                                    <StatItem label={t("coinDetail.allTimeLow")} value={`$${coin.market_data.atl.usd.toLocaleString()}`} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, color = "text-white", subValue }: { label: string; value: string; color?: string; subValue?: string }) {
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
