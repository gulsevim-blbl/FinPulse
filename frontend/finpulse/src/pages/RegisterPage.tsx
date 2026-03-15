import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
        setSuccess("");
        setIsLoading(true);

        try {
            await registerUser(form);
            setSuccess("Hesabınız oluşturuldu. Yönlendiriliyorsunuz...");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            setError("Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500/30">
            {/* Background elements */}
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl"
            >
                <div className="mb-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, rotate: -15, y: 10 }}
                        animate={{ opacity: 1, rotate: 0, y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 mb-5 shadow-lg shadow-purple-500/30"
                    >
                        <User className="text-white w-7 h-7" />
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Hesap Oluştur</h1>
                    <p className="mt-2 text-slate-400 text-sm">FinPulse ile yatırımlarınızı kolayca yönetmeye başlayın.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Ad Soyad</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Örn: John Doe"
                                value={form.full_name}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">E-posta</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="ornek@email.com"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Şifre</label>
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
                                className="w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-slate-600"
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

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3 text-center flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {success}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || !!success}
                        className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3.5 flex items-center justify-center gap-2 hover:from-purple-400 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : success ? (
                            <span>Yönlendiriliyor...</span>
                        ) : (
                            <>
                                <span>Kayıt Ol</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Zaten hesabınız var mı?{" "}
                    <Link to="/" className="font-semibold text-white hover:text-purple-400 transition-colors">
                        Giriş Yapın
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}