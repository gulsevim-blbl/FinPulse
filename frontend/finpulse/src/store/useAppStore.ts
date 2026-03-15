import { create } from "zustand";
import { getPortfolioItems, type PortfolioItemSummary } from "../api/portfolio";
import { getWatchlistItems, type WatchlistItem } from "../api/watchlist";
import { getAlerts, type AlertItem } from "../api/alerts";

interface AppState {
    portfolio: PortfolioItemSummary[];
    watchlist: WatchlistItem[];
    alerts: AlertItem[];
    
    // Loading states
    loadingPortfolio: boolean;
    loadingWatchlist: boolean;
    loadingAlerts: boolean;

    // Actions
    fetchPortfolio: () => Promise<void>;
    fetchWatchlist: () => Promise<void>;
    fetchAlerts: () => Promise<void>;
    fetchAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
    portfolio: [],
    watchlist: [],
    alerts: [],
    
    loadingPortfolio: false,
    loadingWatchlist: false,
    loadingAlerts: false,

    fetchPortfolio: async () => {
        set({ loadingPortfolio: true });
        try {
            const data = await getPortfolioItems();
            set({ portfolio: data.items });
        } catch (error) {
            console.error("Portföy getirilemedi", error);
        } finally {
            set({ loadingPortfolio: false });
        }
    },

    fetchWatchlist: async () => {
        set({ loadingWatchlist: true });
        try {
            const data = await getWatchlistItems();
            set({ watchlist: data });
        } catch (error) {
            console.error("Watchlist getirilemedi", error);
        } finally {
            set({ loadingWatchlist: false });
        }
    },

    fetchAlerts: async () => {
        set({ loadingAlerts: true });
        try {
            const data = await getAlerts();
            set({ alerts: data });
        } catch (error) {
            console.error("Alarmlar getirilemedi", error);
        } finally {
            set({ loadingAlerts: false });
        }
    },

    fetchAll: async () => {
        set({ loadingPortfolio: true, loadingWatchlist: true, loadingAlerts: true });
        try {
            const [portfolioData, watchlistData, alertsData] = await Promise.all([
                getPortfolioItems(),
                getWatchlistItems(),
                getAlerts()
            ]);
            set({ 
                portfolio: portfolioData.items, 
                watchlist: watchlistData, 
                alerts: alertsData 
            });
        } catch (error) {
            console.error("Dashboard verileri alınamadı", error);
        } finally {
            set({ loadingPortfolio: false, loadingWatchlist: false, loadingAlerts: false });
        }
    }
}));
