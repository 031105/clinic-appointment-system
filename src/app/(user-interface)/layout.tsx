'use client';

import { MainLayout } from '@/components/layout/MainLayout';
// import AIAssistant from '@/components/ui/AIAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}