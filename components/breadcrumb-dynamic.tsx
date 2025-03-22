"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const formatSegment = (segment: string) => {
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
};

const Breadcrumbs = () => {
    const pathname = usePathname();

    const pathSegments = pathname.split('/').filter(Boolean);
    const baseSegment = pathSegments.length > 0 ? pathSegments[0] : null;
    const baseLabel = baseSegment ? formatSegment(baseSegment) : "Home";

    console.log('====================================');
    console.log("pathSegments", pathSegments);
    console.log("baseSegment", baseSegment);
    console.log("baseLabel", baseLabel);
    console.log('====================================');

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {baseSegment && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/${baseSegment}/dashboard`}>
                                {baseLabel}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </>
                )}

                {pathSegments.slice(1).map((segment, index) => {
                    const isLast = index === pathSegments.slice(1).length - 1;
                    const href = `/${pathSegments.slice(0, index + 2).join("/")}`;

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem>
                                {!isLast ? (
                                    <BreadcrumbLink href={href}>
                                        {formatSegment(segment)}
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>
                                        {formatSegment(segment)}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default Breadcrumbs;