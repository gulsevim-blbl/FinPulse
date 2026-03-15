import { useEffect, useState } from "react";
import { addAlert, checkAlerts, deleteAlert, type AlertCheckResult } from "../api/alerts";
import { useAppStore } from "../store/useAppStore";
import Skeleton from "../components/Skeleton";
import { toast } from "sonner";
import { Bell, Trash2, ShieldCheck, Plus, History, TrendingUp } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";

import ConfirmModal from "../components/ConfirmModal";

export default function AlertsPage() {
    const { alerts, fetchAlerts, loadingAlerts: loading } = useAppStore();
    const [results, setResults] = useState<AlertCheckResult[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [checking, setChecking] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const { t } = useTranslation();

    const [form, setForm] = useState({
        symbol: "",
        target_price: "",
        condition_type: "above" as "above" | "below",
    });

    useEffect(() => {
        if (alerts.length === 0) {
            fetchAlerts();
        }
    }, [fetchAlerts, alerts.length]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addAlert({
                symbol: form.symbol,
                target_price: Number(form.target_price),
                condition_type: form.condition_type,
            });

            setForm({
                symbol: "",
                target_price: "",
                condition_type: "above",
            });

            await fetchAlerts();
            toast.success(t("alerts.toastCreated"));
        } catch (err) {
            toast.error(t("alerts.toastCreateError"));
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (itemToDelete === null) return;
        try {
            await deleteAlert(itemToDelete);
            await fetchAlerts();
            toast.success(t("alerts.toastDeleted"));
        } catch (err) {
            toast.error(t("alerts.toastDeleteError"));
        } finally {
            setItemToDelete(null);
        }
    };

    const handleCheckAlerts = async () => {
        setChecking(true);

        try {
            const data = await checkAlerts();
            setResults(data);
            await fetchAlerts();
            toast.success(t("alerts.toastChecked"));
        } catch (err) {
            toast.error(t("alerts.toastCheckError"));
        } finally {
            setChecking(false);
        }
    };

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
                    <h1 className="text-3xl font-bold tracking-tight text-white">{t("alerts.title")}</h1>
                    <p className="mt-2 text-slate-400">
                        {t("alerts.description")}
                    </p>
                </div>

                <button
                    onClick={handleCheckAlerts}
                    disabled={checking}
                    className="flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-5 py-3 text-cyan-400 font-medium transition-all hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/10 disabled:opacity-50"
                >
                    <ShieldCheck className={`h-4 w-4 ${checking ? "animate-pulse" : ""}`} />
                    {checking ? t("alerts.checking") : t("alerts.checkManual")}
                </button>
            </motion.div>

            <motion.section variants={containerVariants} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md lg:col-span-1 shadow-2xl h-fit">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <Plus className="h-5 w-5 text-cyan-400" />
                        <h2 className="text-xl font-bold tracking-tight">{t("alerts.createNew")}</h2>
                    </div>

                    <form onSubmit={handleAddAlert} className="space-y-4">
                        <input
                            type="text"
                            name="symbol"
                            placeholder={t("common.symbolPlaceholder")}
                            value={form.symbol}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20"
                            required
                        />

                        <input
                            type="number"
                            step="any"
                            name="target_price"
                            placeholder={t("alerts.targetPricePlaceholder")}
                            value={form.target_price}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20"
                            required
                        />

                        <div className="relative">
                            <select
                                name="condition_type"
                                value={form.condition_type}
                                onChange={handleChange}
                                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20"
                            >
                                <option value="above" className="bg-slate-900">{t("alerts.conditionAbove")}</option>
                                <option value="below" className="bg-slate-900">{t("alerts.conditionBelow")}</option>
                            </select>
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !form.symbol.trim() || !form.target_price}
                            className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3.5 font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {submitting ? t("alerts.creating") : t("alerts.createButton")}
                        </button>
                    </form>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md lg:col-span-2 shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
                    <h2 className="text-xl font-bold tracking-tight text-white mb-6">{t("alerts.activeAndPast")}</h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{t("alerts.emptyState")}</h3>
                            <p className="mt-2 text-sm text-slate-400 px-8 text-center">{t("alerts.emptyStateDesc")}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto flex-1">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-left text-slate-400 font-medium">
                                        <th className="pb-4 pr-4">{t("common.coin")}</th>
                                        <th className="pb-4 pr-4">{t("common.condition")}</th>
                                        <th className="pb-4 pr-4">{t("common.targetPrice")}</th>
                                        <th className="pb-4 pr-4">{t("common.status")}</th>
                                        <th className="pb-4 pr-4">{t("common.action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.map((alert) => (
                                        <tr key={alert.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 pr-4 font-bold text-white">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-xs text-white shadow-inner">
                                                        {alert.symbol.substring(0, 1)}
                                                    </div>
                                                    {alert.symbol}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4 text-slate-300">
                                                {alert.condition_type === "above"
                                                    ? <span className="text-emerald-400 flex items-center gap-1"><TrendingUp className="h-3 w-3" />{t("alerts.conditionAbove").split(" (")[0]}</span>
                                                    : <span className="text-rose-400 flex items-center gap-1"><TrendingUp className="h-3 w-3 rotate-180" />{t("alerts.conditionBelow").split(" (")[0]}</span>}
                                            </td>
                                            <td className="py-4 pr-4 text-white font-medium">${alert.target_price}</td>
                                            <td className="py-4 pr-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${alert.is_active
                                                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                                                            : "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30"
                                                        }`}
                                                >
                                                    {alert.is_active ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
                                                    {alert.is_active ? t("alerts.statusActive") : t("alerts.statusCompleted")}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <button
                                                    onClick={() => {
                                                        setItemToDelete(alert.id);
                                                        setIsConfirmOpen(true);
                                                    }}
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

            {results.length > 0 && (
                <motion.section variants={itemVariants} className="mt-8 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <History className="h-5 w-5 text-cyan-400" />
                        <h2 className="text-xl font-bold tracking-tight">{t("alerts.lastResults")}</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {results.map((result) => (
                            <div
                                key={result.alert_id}
                                className="rounded-2xl border border-white/5 bg-white/5 p-5 hover:bg-white/10 transition-colors relative"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white tracking-tight">
                                        {result.symbol}
                                    </h3>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${result.triggered
                                                ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30"
                                                : "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30"
                                            }`}
                                    >
                                        {result.triggered ? <Bell className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                                        {result.triggered ? t("alerts.triggered") : t("alerts.pending")}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2 text-sm text-slate-400">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span>{t("common.condition")}:</span>
                                        <span className="font-medium text-white">
                                            {result.condition_type === "above"
                                                ? t("alerts.conditionAbove").split(" (")[0]
                                                : t("alerts.conditionBelow").split(" (")[0]}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <span>{t("common.targetPrice")}:</span>
                                        <span className="font-medium text-white">
                                            ${result.target_price}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>{t("dashboard.currentValue")}:</span>
                                        <span className="font-bold text-cyan-400">
                                            ${result.current_price}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => {
                    setIsConfirmOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={confirmDelete}
            />
        </motion.div>
    );
}