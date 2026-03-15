import { useEffect, useState } from "react";
import { addWatchlistItem, deleteWatchlistItem } from "../api/watchlist";
import { useAppStore } from "../store/useAppStore";
import Skeleton from "../components/Skeleton";
import { toast } from "sonner";
import { Star, Trash2, Plus } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function WatchlistPage() {
    const { watchlist: items, fetchWatchlist, loadingWatchlist: loading } = useAppStore();
    const [submitting, setSubmitting] = useState(false);
    const [symbol, setSymbol] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        if (items.length === 0) {
            fetchWatchlist();
        }
    }, [fetchWatchlist, items.length]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addWatchlistItem({ symbol });
            setSymbol("");
            await fetchWatchlist();
            toast.success(t("watchlist.toastAdded"));
        } catch (err) {
            toast.error(t("watchlist.toastAddError"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteWatchlistItem(id);
            await fetchWatchlist();
            toast.success(t("watchlist.toastDeleted"));
        } catch (err) {
            toast.error(t("watchlist.toastDeleteError"));
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
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white">{t("watchlist.title")}</h1>
                <p className="mt-2 text-slate-400">
                    {t("watchlist.description")}
                </p>
            </motion.div>

            <motion.section variants={containerVariants} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md lg:col-span-1 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <Plus className="h-5 w-5 text-cyan-400" />
                        <h2 className="text-xl font-bold tracking-tight">{t("watchlist.addFavorite")}</h2>
                    </div>

                    <form onSubmit={handleAddItem} className="space-y-4">
                        <input
                            type="text"
                            placeholder={t("common.symbolPlaceholder")}
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20"
                            required
                        />

                        <button
                            type="submit"
                            disabled={submitting || !symbol.trim()}
                            className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3.5 font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {submitting ? t("watchlist.adding") : t("watchlist.addButton")}
                        </button>
                    </form>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md lg:col-span-2 shadow-2xl relative overflow-hidden">
                    <h2 className="text-xl font-bold tracking-tight text-white mb-6">{t("watchlist.myFavorites")}</h2>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 py-16 text-center"
                        >
                            <div className="h-16 w-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                                <Star className="h-8 w-8 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">{t("watchlist.emptyState")}</h3>
                            <p className="mt-2 text-sm text-slate-400 px-8 text-center">{t("watchlist.emptyStateDesc")}</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10 shadow-sm hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-bold text-white shadow-inner">
                                            {item.symbol.substring(0, 1)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                {t("common.coin")}
                                            </p>
                                            <h3 className="mt-0.5 text-lg font-bold tracking-tight text-white">
                                                {item.symbol}
                                            </h3>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex items-center justify-center rounded-lg bg-rose-500/10 p-2.5 text-rose-400 transition-all hover:bg-rose-500/20 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 focus:opacity-100 focus:scale-100"
                                        title={t("common.delete")}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.section>
        </motion.div>
    );
}