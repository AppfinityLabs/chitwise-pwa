'use client';

import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Bell, Moon, Globe, HelpCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const { user } = useAuth();

    const settings = [
        { icon: Bell, label: 'Notifications', description: 'Manage push notifications', coming: true },
        { icon: Moon, label: 'Dark Mode', description: 'Always on', coming: false },
        { icon: Globe, label: 'Language', description: 'English', coming: true },
        { icon: Shield, label: 'Privacy', description: 'Data & security settings', coming: true },
        { icon: HelpCircle, label: 'Help & Support', description: 'FAQs and contact', coming: true },
    ];

    return (
        <div className="page">
            <div className="page-header flex items-center gap-3">
                <Link href="/more" className="p-2 -ml-2 rounded-lg">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="page-title">Settings</h1>
            </div>

            <div className="page-content">
                <div className="rounded-xl overflow-hidden">
                    {settings.map((item, idx) => (
                        <div key={idx} className="list-item">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                                <item.icon size={20} className="text-[var(--primary)]" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-[var(--text-muted)]">{item.description}</p>
                            </div>
                            {item.coming && (
                                <span className="text-xs text-[var(--text-muted)] bg-[var(--card-hover)] px-2 py-1 rounded">
                                    Soon
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center text-[var(--text-muted)]">
                    <p className="text-sm">ChitWise Org PWA</p>
                    <p className="text-xs mt-1">Version 1.0.0</p>
                    <p className="text-xs mt-1">© 2026 ChitWise</p>
                </div>
            </div>
        </div>
    );
}
