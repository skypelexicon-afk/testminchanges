'use client';

import ClientLayout from '@/app/ClientLayout';
import FloatingTestPortalButton from '@/components/test/FloatingTestPortalButton';
import { Suspense } from 'react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ClientLayout>
                {children}
                <FloatingTestPortalButton userRole="student" />
            </ClientLayout>
        </Suspense>
    );
}
