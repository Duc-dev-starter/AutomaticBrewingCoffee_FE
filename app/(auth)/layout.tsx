"use client"
import { scheduleTokenRefresh } from "@/utils/cookie";
import React, { useEffect } from "react";
import Cookies from 'js-cookie'

const Layout = ({ children }: { children: React.ReactNode }) => {

    useEffect(() => {
        const accessToken = Cookies.get("accessToken");
        if (accessToken) {
            scheduleTokenRefresh(accessToken);
        }
    }, []);

    return (
        <>
            {children}
        </>
    );
};

export default Layout;