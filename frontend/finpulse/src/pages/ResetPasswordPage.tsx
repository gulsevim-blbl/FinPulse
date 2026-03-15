import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../api/axios";

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [form, setForm] = useState({
        new_password: "",
        confirm_password: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (form.new_password !== form.confirm_password) {
            toast.error(t("common.error")); // Şifreler eşleşmiyor gibi bir anahtar da eklenebilir ama common.error şimdilik yeterli
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/reset-password", {
                token,
                new_password: form.new_password
            });
            setSuccess(true);
            toast.success(t("auth.passwordResetSuccess"));
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            toast.error(t("auth.passwordResetFailed"));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020617] p-4 text-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-2xl"
                >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{t("auth.passwordResetSuccess")}</h1>
                    <p className="text-slate-400 mb-8">{t("auth.backToLogin")}...</p>
                    <Link to="/login" className="text-cyan-400 font-medium hover:underline">
                        {t("auth.backToLogin")}
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative"
            >
                <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <Lock className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t("auth.resetPasswordTitle")}</h1>
                        <p className="text-slate-400 text-sm">{t("auth.resetPasswordDesc")}</p>
                    </div>

                    {!token ? (
                        <div className="text-center p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                           {t("auth.passwordResetFailed")}
                           <Link to="/login" className="block mt-4 text-sm font-bold text-white hover:underline">
                               {t("auth.backToLogin")}
                           </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">
                                    {t("auth.newPassword")}
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10"
                                        placeholder="••••••••"
                                        value={form.new_password}
                                        onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">
                                    {t("auth.confirmPassword")}
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10"
                                        placeholder="••••••••"
                                        value={form.confirm_password}
                                        onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? t("common.loading") : t("auth.updatePassword")}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <Link 
                            to="/login" 
                            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t("auth.backToLogin")}
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
