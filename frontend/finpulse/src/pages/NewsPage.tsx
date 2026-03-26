import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
        name: string;
    };
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        fetchNews(1, false);
    }, []);

    const fetchNews = async (page: number, append: boolean = false) => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);

            const response = await axios.get(
                `https://newsapi.org/v2/everything?q=crypto+OR+bitcoin+OR+finance&apiKey=30d2219846e541dfaa859b6d001ae180&language=en&sortBy=publishedAt&pageSize=12&page=${page}`
            );

            const newArticles = response.data.articles;
            if (append) {
                setNews(prev => [...prev, ...newArticles]);
            } else {
                setNews(newArticles);
            }

            // Eğer gelen haber sayısı pageSize'dan azsa, daha fazla haber yok
            if (newArticles.length < 12) {
                setHasMore(false);
            }
        } catch (err) {
            setError(t("news.error"));
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchNews(nextPage, true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-slate-400">{t("news.loading")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <p className="text-slate-400 text-sm">
                    {t("news.apiRequired")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">{t("news.title")}</h1>
                <p className="text-slate-400">{t("news.description")}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.map((article, index) => (
                    <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                    >
                        {article.urlToImage && (
                            <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="w-full h-48 object-cover rounded-xl mb-4"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                            {article.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                            {article.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{article.source.name}</span>
                            <span>{new Date(article.publishedAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                        >
                            {t("news.readMore")}
                        </a>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="text-center py-8">
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-6 py-3 rounded-xl hover:bg-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMore ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                                {t("news.loading")}
                            </div>
                        ) : (
                            t("news.loadMore")
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}