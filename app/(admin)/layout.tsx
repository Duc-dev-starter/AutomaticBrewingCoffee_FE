"use client"
import { AdminSearchbar, AdminSidebar } from "@/components/layout"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useSignalR } from "@/contexts/signalR";
import { useToast } from "@/hooks/use-toast";
import { registerToast } from "@/utils";
import { useEffect, useState } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { logout } from "@/services/auth.service";
import { scheduleTokenRefresh } from "@/utils/cookie";
import Cookies from 'js-cookie'
import { NotificationBell } from "@/components/common";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const [unreadCount, setUnreadCount] = useState<number>(3)
    useEffect(() => {
        registerToast(toast);
    }, [toast]);
    const { connection, invoke, off, startConnection, on } = useSignalR();

    const [connectionState, setConnectionState] = useState<HubConnectionState | null>(null);

    useEffect(() => {
        startConnection();
        const handleForceLogout = (data: any) => {
            console.log("Logout:", data);
            logout();
        };

        const handleReceiveNotification = (notification: any) => {
            console.log("New Notification:", notification);
            toast({
                title: notification.title || "Thông báo mới",
                description: notification.message || "Bạn có thông báo mới",
            });
            // Tăng số lượng chưa đọc nếu cần
            setUnreadCount(prev => prev + 1);
        };

        on("ForceLogout", handleForceLogout);
        on("ReceiveNotification", handleReceiveNotification);

        if (connection) {
            setConnectionState(connection.state);

            const handleStateChange = () => setConnectionState(connection.state);

            connection.onreconnected(() => {
                setConnectionState(connection.state);
                toast({
                    title: "Kết nối lại SignalR thành công!",
                    description: "Bạn đã kết nối lại với server.",
                });
            });
            connection.onclose(() => {
                setConnectionState(connection.state);
                toast({
                    title: "Mất kết nối SignalR!",
                    description: "Không thể kết nối tới server, sẽ tự động thử lại...",
                    variant: "destructive",
                });
            });
            connection.onreconnecting(() => {
                setConnectionState(connection.state);
                toast({
                    title: "Đang kết nối lại SignalR...",
                    description: "Mất kết nối, đang thử lại...",
                    variant: "warning",
                });
            });

            const interval = setInterval(handleStateChange, 1000);

            return () => {
                clearInterval(interval);
                off("ForceLogout", handleForceLogout);
                off("ReceiveNotification", handleReceiveNotification);
            };
        } else {
            setConnectionState(null);
        }
    }, [connection]);

    useEffect(() => {
        const accessToken = Cookies.get("accessToken");
        if (accessToken) {
            scheduleTokenRefresh(accessToken);
        }
    }, []);

    const renderConnectionState = () => {
        if (connectionState === HubConnectionState.Connected) return <span className="text-green-600">Đã kết nối server</span>
        if (connectionState === HubConnectionState.Connecting) return <span className="text-yellow-500">Đang kết nối...</span>
        if (connectionState === HubConnectionState.Reconnecting) return <span className="text-orange-500">Đang kết nối lại...</span>
        if (connectionState === HubConnectionState.Disconnected) return <span className="text-red-600">Mất kết nối!</span>
        return null;
    }


    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="ml-2">{renderConnectionState()}</div>
                    </div>

                    {/* Searchbar takes up remaining space */}
                    <div className="flex-1">
                        <AdminSearchbar />
                    </div>

                    {/* Notification bell positioned at the far right */}
                    <div className="px-4">
                        <NotificationBell />
                    </div>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}