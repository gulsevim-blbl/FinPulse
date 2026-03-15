import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const data = await loginUser(form);
            localStorage.setItem("access_token", data.access_token);
            navigate("/dashboard");
        } catch (err) {
            setError(t("auth.loginFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500/30">
            {/* Background elements */}
            <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl"
            >
                <div className="mb-10 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-6 shadow-lg shadow-indigo-500/30"
                    >
                        <span className="text-2xl font-bold text-white tracking-tighter">FP</span>
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{t("auth.welcomeBack")}</h1>
                    <p className="mt-3 text-slate-400 text-sm">{t("auth.loginDescription")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">{t("auth.email")}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder={t("auth.emailPlaceholder")}
                                value={form.email}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("auth.password")}</label>
                            <Link to="/forgot-password" id="forgot-password-link" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">{t("auth.forgotPassword")}</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative group overflow-hidden rounded-xl bg-white text-slate-950 font-semibold py-3.5 flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>{t("auth.login")}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                    {t("auth.noAccount")}{" "}
                    <Link to="/register" className="font-semibold text-white hover:text-indigo-400 transition-colors">
                        {t("auth.registerNow")}
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}