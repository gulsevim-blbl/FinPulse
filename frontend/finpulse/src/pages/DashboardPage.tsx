import { useEffect, useMemo } from "react";
import PriceCard from "../components/PriceCard";
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
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                            {t("dashboard.liveMarketPrices")}
                        </h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">
                            {t("dashboard.realTimeData")}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((n) => (
                            <Skeleton key={n} className="h-32 w-full" />
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
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {prices.map((coin) => (
                            <PriceCard
                                key={coin.symbol}
                                symbol={coin.symbol}
                                name={coin.name}
                                current_price={coin.current_price}
                                price_change_percentage_24h={coin.price_change_percentage_24h}
                            />
                        ))}
                    </div>
                )}
            </motion.section>
        </motion.div>
    );
}

