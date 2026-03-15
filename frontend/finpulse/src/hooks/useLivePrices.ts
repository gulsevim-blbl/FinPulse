import { useEffect, useState } from "react";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { retry, timer, BehaviorSubject } from "rxjs";

export type LivePriceItem = {
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h?: number | null;
};

type WebSocketMessage = {
    type: string;
    data: LivePriceItem[];
};

// Singleton state to share across multiple hook instances
const prices$ = new BehaviorSubject<LivePriceItem[]>([]);
const connected$ = new BehaviorSubject<boolean>(false);
let subject: WebSocketSubject<any> | null = null;

/**
 * Hook for live crypto prices via WebSocket.
 * Uses a singleton connection to avoid multiple WS connections.
 */
export function useLivePrices() {
    const [prices, setPrices] = useState<LivePriceItem[]>(prices$.getValue());
    const [connected, setConnected] = useState(connected$.getValue());

    useEffect(() => {
        // Initialize WebSocket connection only once
        if (!subject) {
            subject = webSocket({
                url: "ws://127.0.0.1:8000/ws/prices",
                openObserver: {
                    next: () => {
                        console.log("WebSocket connection established");
                        connected$.next(true);
                    }
                },
                closeObserver: {
                    next: () => {
                        console.log("WebSocket connection closed");
                        connected$.next(false);
                    }
                }
            });

            subject
                .pipe(
                    retry({
                        delay: (error) => {
                            console.error("Retrying WebSocket connection:", error);
                            return timer(3000);
                        }
                    })
                )
                .subscribe({
                    next: (message: any) => {
                        const wsMessage = message as WebSocketMessage;
                        if (wsMessage.type === "price_update") {
                            prices$.next(wsMessage.data);
                        }
                    },
                    error: (err) => {
                        console.error("WebSocket error:", err);
                        connected$.next(false);
                        // The subject will be re-created on the next retry or we can just let retry handle it
                    }
                });
        }

        // Subscribe to the shared state
        const pricesSub = prices$.subscribe(setPrices);
        const connectedSub = connected$.subscribe(setConnected);

        return () => {
            pricesSub.unsubscribe();
            connectedSub.unsubscribe();
        };
    }, []);

    return { prices, connected };
}