import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

type PriceCardProps = {
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h?: number | null;
    onClick?: () => void;
};

export default function PriceCard({
    symbol,
    name,
    current_price,
    price_change_percentage_24h,
    onClick,
}: PriceCardProps) {
    const { t } = useTranslation();
    const isPositive = (price_change_percentage_24h ?? 0) >= 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={onClick}
            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md transition-all hover:bg-white/10 ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-sm font-bold text-white shadow-inner">
                            {symbol.substring(0, 1)}
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                {symbol}
                            </p>
                            <h3 className="mt-0.5 text-lg font-bold tracking-tight text-white">{name}</h3>
                        </div>
                    </div>
                </div>

                <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${isPositive
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
                        }`}
                >
                    {isPositive ? "▲" : "▼"} {Math.abs(price_change_percentage_24h ?? 0).toFixed(2)}%
                </span>
            </div>

            <div className="relative mt-8">
                <p className="text-sm font-medium text-slate-400">{t("dashboard.currentPrice")}</p>
                <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-slate-400">
                        {symbol.endsWith("-TRY") ? "₺" : "$"}
                    </span>
                    <p className="text-3xl font-bold tracking-tight text-white">
                        {current_price.toLocaleString(undefined, { 
                            minimumFractionDigits: current_price < 1 ? 4 : 2, 
                            maximumFractionDigits: current_price < 1 ? 8 : 2 
                        })}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}