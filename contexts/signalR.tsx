"use client";
import React, { createContext, useContext, useRef, useEffect, useCallback } from "react";
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
    const url = process.env.NEXT_PUBLIC_SIGNALR_URL;
    if (!url) {
        throw new Error("Missing SignalR URL environment variable.");
    }
    if (!connectionRef.current) {
        connectionRef.current = new signalR.HubConnectionBuilder()
            .withUrl(url, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
                accessTokenFactory: () => getAccessTokenFromCookie() || "",
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connectionRef.current.onreconnected((connectionId) => {
            console.log(`Reconnected: ${connectionId}`);
        });

        connectionRef.current.onclose((error) => {
            console.log(`Connection closed due to error: ${error}`);
        });
    }

    // Hàm start/stop
    const startConnection = useCallback(async () => {
        try {
            if (connectionRef.current?.state !== signalR.HubConnectionState.Connected) {
                await connectionRef.current?.start();
                console.log("Connected to SignalR Hub");
            }
        } catch (error) {
            console.log(`Error while establishing connection: ${error}`);
            setTimeout(startConnection, 5000);
        }
    }, []);

    const stopConnection = useCallback(async () => {
        try {
            await connectionRef.current?.stop();
            console.log("Disconnected from SignalR Hub");
        } catch (error) {
            console.log(`Error while stopping connection: ${error}`);
        }
    }, []);

    // on, off, invoke
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
            console.error(`Error while invoking ${methodName}: ${error}`);
        }
    }, []);

    // Cleanup khi unmount
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
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => {
    const ctx = useContext(SignalRContext);
    if (!ctx) throw new Error("useSignalR must be used within a SignalRProvider");
    return ctx;
};