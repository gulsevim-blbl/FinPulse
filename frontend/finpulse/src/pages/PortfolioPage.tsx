import { useEffect, useMemo, useState } from "react";
import { addPortfolioItem, deletePortfolioItem, refreshPortfolioPrices } from "../api/portfolio";
import { useAppStore } from "../store/useAppStore";
import Skeleton from "../components/Skeleton";
import { toast } from "sonner";
import { Wallet, Trash2, RefreshCw, Plus } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function PortfolioPage() {
    const { portfolio: items, fetchPortfolio, loadingPortfolio: loading } = useAppStore();
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { t } = useTranslation();

    const [form, setForm] = useState({
        symbol: "",
        quantity: "",
        average_buy_price: "",
    });

    useEffect(() => {
        if (items.length === 0) {
            fetchPortfolio();
        }
    }, [fetchPortfolio, items.length]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addPortfolioItem({
                symbol: form.symbol,
                quantity: Number(form.quantity),
                average_buy_price: Number(form.average_buy_price),
            });

            setForm({
                symbol: "",
                quantity: "",
                average_buy_price: "",
            });

            await fetchPortfolio();
            toast.success(t("portfolio.toastAdded"));
        } catch (err) {
            toast.error(t("portfolio.toastAddError"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRefreshPrices = async () => {
        setRefreshing(true);
        try {
            await refreshPortfolioPrices();
            await fetchPortfolio();
            toast.success(t("portfolio.toastRefreshed"));
        } catch (err) {
            toast.error(t("portfolio.toastRefreshError"));
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deletePortfolioItem(id);
            await fetchPortfolio();
            toast.success(t("portfolio.toastDeleted"));
        } catch (err) {
            toast.error(t("portfolio.toastDeleteError"));
        }
    };

    const summary = useMemo(() => {
        const totalCost = items.reduce((acc, item) => acc + item.total_cost, 0);
        const currentValue = items.reduce((acc, item) => acc + item.current_value, 0);
        const profitLoss = items.reduce((acc, item) => acc + item.profit_loss, 0);

        return {
            totalCost,
            currentValue,
            profitLoss,
        };
    }, [items]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
            className="pb-10"
        >
            <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">{t("portfolio.title")}</h1>
                    <p className="mt-2 text-slate-400">
                        {t("portfolio.description")}
                    </p>
                </div>

                <button
                    onClick={handleRefreshPrices}
                    disabled={refreshing}
                    className="flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-5 py-3 text-cyan-400 font-medium transition-all hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/10 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? t("portfolio.refreshing") : t("portfolio.refreshPrices")}
                </button>
            </motion.div>

            <motion.section variants={containerVariants} className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{t("portfolio.totalCost")}</p>
                    {loading ? <Skeleton className="mt-3 h-8 w-32" /> : (
                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                            {t("common.priceSymbol")}{summary.totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </h3>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{t("portfolio.currentValue")}</p>
                    {loading ? <Skeleton className="mt-3 h-8 w-32" /> : (
                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                            {t("common.priceSymbol")}{summary.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </h3>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{t("portfolio.totalProfitLoss")}</p>
                    {loading ? <Skeleton className="mt-3 h-8 w-32" /> : (
                        <h3
                            className={`mt-2 text-3xl font-bold tracking-tight ${summary.profitLoss >= 0 ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]"
                                }`}
                        >
                            {summary.profitLoss >= 0 ? "+" : ""}{t("common.priceSymbol")}{summary.profitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </h3>
                    )}
                </motion.div>
            </motion.section>

            <motion.section variants={containerVariants} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md lg:col-span-1 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <Plus className="h-5 w-5 text-cyan-400" />
                        <h2 className="text-xl font-bold tracking-tight">{t("portfolio.addNew")}</h2>
                    </div>

                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                name="symbol"
                                placeholder={t("common.symbolPlaceholder")}
                                value={form.symbol}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="number"
                                step="any"
                                name="quantity"
                                placeholder={t("portfolio.quantityPlaceholder")}
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="number"
                                step="any"
                                name="average_buy_price"
                                placeholder={t("portfolio.avgBuyPricePlaceholder")}
                                value={form.average_buy_price}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3.5 font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {submitting ? t("portfolio.adding") : t("portfolio.addButton")}
                        </button>
                    </form>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md lg:col-span-2 shadow-2xl relative overflow-hidden">
                    <h2 className="text-xl font-bold tracking-tight text-white mb-6">{t("portfolio.listTitle")}</h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 py-16 text-center"
                        >
                            <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                                <Wallet className="h-8 w-8 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{t("portfolio.emptyState")}</h3>
                            <p className="mt-2 text-sm text-slate-400">{t("portfolio.emptyStateDesc")}</p>
                        </motion.div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-slate-400 font-medium">
                                        <th className="pb-4 pr-4">{t("common.coin")}</th>
                                        <th className="pb-4 pr-4">{t("portfolio.tableQuantity")}</th>
                                        <th className="pb-4 pr-4">{t("portfolio.tableBuy")}</th>
                                        <th className="pb-4 pr-4">{t("portfolio.tableCurrent")}</th>
                                        <th className="pb-4 pr-4">{t("portfolio.tableCost")}</th>
                                        <th className="pb-4 pr-4">{t("portfolio.tableValue")}</th>
                                        <th className="pb-4 pr-4">{t("portfolio.tableProfitLoss")}</th>
                                        <th className="pb-4 pr-4">{t("common.action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 pr-4 font-bold text-white">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-xs text-white shadow-inner">
                                                        {item.symbol.substring(0, 1)}
                                                    </div>
                                                    {item.symbol}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4 text-slate-300">{item.quantity}</td>
                                            <td className="py-4 pr-4 text-slate-300">{t("common.priceSymbol")}{item.average_buy_price}</td>
                                            <td className="py-4 pr-4 text-white font-medium">{t("common.priceSymbol")}{item.current_price}</td>
                                            <td className="py-4 pr-4 text-slate-300">{t("common.priceSymbol")}{item.total_cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            <td className="py-4 pr-4 text-white font-medium">{t("common.priceSymbol")}{item.current_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            <td
                                                className={`py-4 pr-4 font-bold ${item.profit_loss >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                                            >
                                                {item.profit_loss >= 0 ? "+" : ""}{t("common.priceSymbol")}{item.profit_loss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 pr-4">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="flex items-center justify-center rounded-lg bg-rose-500/10 p-2 text-rose-400 transition-colors hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    title={t("common.delete")}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </motion.section>
        </motion.div>
    );
}