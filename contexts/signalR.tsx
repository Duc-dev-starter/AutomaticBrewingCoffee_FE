"use client";

import React, {
    createContext,
    useContext,
    useRef,
    useEffect,
    useCallback,
    useState,
} from "react";
import * as signalR from "@microsoft/signalr";
import { getAccessTokenFromCookie } from "@/utils/cookie";

interface ISignalRContext {
    connection: signalR.HubConnection | null;
    startConnection: () => Promise<void>;
    stopConnection: () => Promise<void>;
    on: (methodName: string, newMethod: (...args: any[]) => void) => void;
    off: (methodName: string, method: (...args: any[]) => void) => void;
    invoke: (methodName: string, ...args: any[]) => Promise<void>;
}

const SignalRContext = createContext<ISignalRContext | null>(null);

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [connectionReady, setConnectionReady] = useState(false);

    const url = process.env.NEXT_PUBLIC_SIGNALR_URL;
    if (!url) throw new Error("Missing SignalR URL");

    // ✅ Create connection once (on client only)
    useEffect(() => {
        if (typeof window === "undefined") return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(url, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
                accessTokenFactory: () => getAccessTokenFromCookie() || "",
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection.onreconnected((connectionId) => {
            console.log(`🔌 Reconnected: ${connectionId}`);
        });

        connection.onclose((error) => {
            console.log(`⚠️ Connection closed: ${error}`);
        });

        connectionRef.current = connection;
        setConnectionReady(true);
    }, [url]);

    const startConnection = useCallback(async () => {
        try {
            if (
                connectionRef.current &&
                connectionRef.current.state !== signalR.HubConnectionState.Connected
            ) {
                await connectionRef.current.start();
                console.log("✅ SignalR Connected");
            }
        } catch (error) {
            console.error("❌ Error starting SignalR:", error);
            setTimeout(startConnection, 5000);
        }
    }, []);

    const stopConnection = useCallback(async () => {
        try {
            if (connectionRef.current) {
                await connectionRef.current.stop();
                console.log("🛑 SignalR Disconnected");
            }
        } catch (error) {
            console.error("❌ Error stopping SignalR:", error);
        }
    }, []);

    const on = useCallback((methodName: string, newMethod: (...args: any[]) => void) => {
        connectionRef.current?.on(methodName, newMethod);
    }, []);

    const off = useCallback((methodName: string, method: (...args: any[]) => void) => {
        connectionRef.current?.off(methodName, method);
    }, []);

    const invoke = useCallback(async (methodName: string, ...args: any[]) => {
        try {
            await connectionRef.current?.invoke(methodName, ...args);
        } catch (error) {
            console.error(`❌ Error invoking ${methodName}:`, error);
        }
    }, []);

    useEffect(() => {
        return () => {
            stopConnection();
        };
    }, [stopConnection]);

    return (
        <SignalRContext.Provider
            value={{
                connection: connectionRef.current,
                startConnection,
                stopConnection,
                on,
                off,
                invoke,
            }}
        >
            {connectionReady ? children : null}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => {
    const ctx = useContext(SignalRContext);
    if (!ctx) throw new Error("useSignalR must be used within a SignalRProvider");
    return ctx;
};
