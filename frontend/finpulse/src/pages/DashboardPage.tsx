import { useEffect, useMemo } from "react";
import { useLivePrices } from "../hooks/useLivePrices";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import Skeleton from "../components/Skeleton";
import { toast } from "sonner";
import { Activity, ArrowRight, TrendingUp } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
    const { prices, connected } = useLivePrices();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const {
        portfolio: portfolioItems,
        watchlist: watchlistItems,
        alerts,
        loadingPortfolio,
        loadingWatchlist,
        loadingAlerts,
        fetchAll,
    } = useAppStore();

    const loading = loadingPortfolio || loadingWatchlist || loadingAlerts;

    useEffect(() => {
        fetchAll().catch(() => toast.error(t("dashboard.fetchError")));
    }, [fetchAll, t]);

    const summary = useMemo(() => {
        const totalCost = portfolioItems.reduce((acc, item) => acc + item.total_cost, 0);
        const currentValue = portfolioItems.reduce(
            (acc, item) => acc + item.current_value,
            0
        );
        const profitLoss = portfolioItems.reduce((acc, item) => acc + item.profit_loss, 0);
        const activeAlerts = alerts.filter((alert) => alert.is_active).length;

        return {
            totalCost,
            currentValue,
            profitLoss,
            activeAlerts,
            portfolioCount: portfolioItems.length,
        };
    }, [portfolioItems, alerts]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            <motion.section
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-[#0B0F19] to-cyan-500/10 p-8 shadow-2xl backdrop-blur-xl"
            >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl mix-blend-screen" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-cyan-400 font-semibold mb-3">
                        <TrendingUp className="h-4 w-4" />
                        FinPulse {t("dashboard.title")}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                        {t("dashboard.description")}
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-slate-400">
                        {t("dashboard.subDescription")}
                    </p>

                    <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-md">
                        <span
                            className={`inline-block h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" : "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]"
                                }`}
                        />
                        {connected ? t("dashboard.liveDataActive") : t("dashboard.noWebSocket")}
                    </div>
                </div>
            </motion.section>

            <motion.section variants={containerVariants} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{t("dashboard.totalCost")}</p>
                    {loading ? <Skeleton className="mt-3 h-8 w-32" /> : (
                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                            ${summary.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </h3>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{t("dashboard.currentValue")}</p>
                    {loading ? <Skeleton className="mt-3 h-8 w-32" /> : (
                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                            ${summary.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </h3>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{t("dashboard.totalProfitLoss")}</p>
                    {loading ? <Skeleton className="mt-3 h-8 w-32" /> : (
                        <h3
                            className={`mt-2 text-3xl font-bold tracking-tight ${summary.profitLoss >= 0 ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]"
                                }`}
                        >
                            {summary.profitLoss >= 0 ? "+" : ""}${summary.profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </h3>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{t("dashboard.activeAlertCount")}</p>
                    {loading ? <Skeleton className="mt-3 h-8 w-16" /> : (
                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                            {summary.activeAlerts}
                        </h3>
                    )}
                </motion.div>
            </motion.section>

            <motion.section variants={containerVariants} className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md flex flex-col justify-between group hover:border-white/10 transition-all">
                    <div>
                        <p className="text-sm font-medium text-slate-400">{t("dashboard.coinCountInPortfolio")}</p>
                        {loadingPortfolio ? <Skeleton className="mt-3 h-8 w-16" /> : (
                            <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                                {summary.portfolioCount}
                            </h3>
                        )}
                    </div>
                    <button
                        onClick={() => navigate("/portfolio")}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 hover:gap-3 w-fit"
                    >
                        {t("dashboard.goToPortfolio")} <ArrowRight className="h-4 w-4 text-cyan-400" />
                    </button>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md flex flex-col justify-between group hover:border-white/10 transition-all">
                    <div>
                        <p className="text-sm font-medium text-slate-400">{t("dashboard.watchlistCount")}</p>
                        {loadingWatchlist ? <Skeleton className="mt-3 h-8 w-16" /> : (
                            <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                                {watchlistItems.length}
                            </h3>
                        )}
                    </div>
                    <button
                        onClick={() => navigate("/watchlist")}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 hover:gap-3 w-fit"
                    >
                        {t("dashboard.goToWatchlist")} <ArrowRight className="h-4 w-4 text-cyan-400" />
                    </button>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md flex flex-col justify-between group hover:border-white/10 transition-all">
                    <div>
                        <p className="text-sm font-medium text-slate-400">{t("dashboard.alertManagement")}</p>
                        {loadingAlerts ? <Skeleton className="mt-3 h-8 w-24" /> : (
                            <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                                {summary.activeAlerts} <span className="text-lg font-normal text-slate-500">{t("dashboard.active")}</span>
                            </h3>
                        )}
                    </div>
                    <button
                        onClick={() => navigate("/alerts")}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 hover:gap-3 w-fit"
                    >
                        {t("dashboard.goToAlerts")} <ArrowRight className="h-4 w-4 text-cyan-400" />
                    </button>
                </motion.div>
            </motion.section>

            <motion.section variants={itemVariants} className="pt-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">{t("dashboard.marketsLabel")}</p>
                    <h2 className="text-3xl font-bold tracking-tight text-white">{t("dashboard.discoverPrices")}</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <Skeleton key={n} className="h-24 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : prices.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/5 py-16 text-center backdrop-blur-md"
                    >
                        <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                            <Activity className="h-8 w-8 text-cyan-400 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{t("dashboard.waitingForData")}</h3>
                        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{t("dashboard.waitingForDataDesc")}</p>
                    </motion.div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {prices.slice(0, 8).map((coin) => {
                                const symbolToId: Record<string, string> = {
                                    "BTC-USDT": "bitcoin", "ETH-USDT": "ethereum",
                                    "SOL-USDT": "solana", "ADA-USDT": "cardano",
                                    "AVAX-USDT": "avalanche-2", "XRP-USDT": "ripple",
                                    "DOT-USDT": "polkadot", "DOGE-USDT": "dogecoin",
                                    "PEPE-USDT": "pepe", "TON-USDT": "the-open-network",
                                    "BTC-TRY": "bitcoin", "ETH-TRY": "ethereum",
                                    "SOL-TRY": "solana", "XRP-TRY": "ripple",
                                    "DOGE-TRY": "dogecoin", "USDT-TRY": "tether"
                                };
                                const coinId = symbolToId[coin.symbol] || coin.symbol.split('-')[0].toLowerCase();
                                const isPos = (coin.price_change_percentage_24h ?? 0) >= 0;
                                const currency = coin.symbol.endsWith("-TRY") ? "TRY" : "USDT";
                                const ticker = coin.symbol.split("-")[0];

                                return (
                                    <motion.div
                                        key={coin.symbol}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -3, scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                                        onClick={() => navigate(`/coin/${coinId}${coin.symbol.endsWith("-TRY") ? "?currency=try" : ""}`)}
                                        className="group relative rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] px-4 py-4 cursor-pointer transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                                {ticker.substring(0, 2)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white leading-tight truncate">{coin.symbol}</p>
                                                <p className="text-[10px] text-slate-500">{ticker}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between gap-1">
                                            <div>
                                                <p className="text-sm font-bold text-white leading-none">
                                                    {coin.current_price < 1
                                                        ? coin.current_price.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 6 })
                                                        : coin.current_price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{currency}</p>
                                            </div>
                                            <span className={`text-xs font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                                                {isPos ? "▲" : "▼"} %{Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* "Tümünü Gör" button */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => navigate("/markets")}
                                className="relative px-10 py-3 rounded-full font-semibold text-sm text-white transition-all
                                    bg-gradient-to-r from-cyan-500 to-indigo-500
                                    hover:from-cyan-400 hover:to-indigo-400
                                    shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40
                                    hover:scale-105 active:scale-95
                                    border border-white/10"
                            >
                                {t("dashboard.viewAll")}
                            </button>
                        </div>
                    </>
                )}
            </motion.section>
        </motion.div>
    );
}

