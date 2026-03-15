import { useNavigate } from "react-router-dom";

type NavbarProps = {
    fullName?: string;
};

export default function Navbar({ fullName }: NavbarProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/");
    };

    return (
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">FinPulse</h1>
                    <p className="text-sm text-slate-500">
                        Crypto Portfolio & Market Intelligence Platform
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Hoş geldin</p>
                        <p className="font-semibold text-slate-900">
                            {fullName || "Kullanıcı"}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>
        </header>
    );
}