'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/doFetch';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface Coupon {
    id: number;
    coupon_code: string;
    discount: number;
    max_availability: number;
    course_id?: number | null;
    bundle_id?: number | null;
}

type NewCouponPayload = {
    coupon_code: string;
    discount: number;
    max_availability: number;
    course_id?: number[];
    bundle_id?: number[];
};

export default function AdminCouponsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);

    // form state (string inputs for comma-separated IDs)
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState<number>(0);
    const [maxAvailability, setMaxAvailability] = useState<number>(1);
    const [courseIdsInput, setCourseIdsInput] = useState<string>(''); // e.g. "1,2,3"
    const [bundleIdsInput, setBundleIdsInput] = useState<string>(''); // e.g. "4,5"

    const isAdmin = (role?: string) =>
        role === 'admin' || role === 'super_admin';

    // Auth guard
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push('/');
            else if (!isAdmin(user?.role)) router.push('/');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // fetch coupons
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = await fetchApi.get<Coupon[]>('api/coupons');
            setCoupons(data);
        } catch (err) {
            console.error('Error fetching coupons:', err);
            toast.error('Failed to fetch coupons.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && isAdmin(user?.role)) fetchCoupons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

    // parse a comma-separated string into number[] (filters invalid)
    const parseCsvToNumberArray = (s: string): number[] =>
        s
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
            .map((x) => Number(x))
            .filter((n) => !Number.isNaN(n) && Number.isFinite(n));

    // whether each side has values (to disable the other)
    const hasCourse = courseIdsInput.trim().length > 0;
    const hasBundle = bundleIdsInput.trim().length > 0;

    // Create coupon
    const handleCreateCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Coupon code cannot be empty');
            return;
        }

        const courseIds = parseCsvToNumberArray(courseIdsInput);
        const bundleIds = parseCsvToNumberArray(bundleIdsInput);

        if (courseIds.length === 0 && bundleIds.length === 0) {
            toast.error(
                'Provide at least one Course ID or Bundle ID (comma-separated)',
            );
            return;
        }

        const payload: NewCouponPayload = {
            coupon_code: couponCode.trim(),
            discount,
            max_availability: maxAvailability,
        };

        // Prefer courseIds if both somehow provided — but UI disables the other
        if (courseIds.length) payload.course_id = courseIds;
        else if (bundleIds.length) payload.bundle_id = bundleIds;

        try {
            // Tell TS we expect Coupon | Coupon[]
            const created = await fetchApi.post<
                NewCouponPayload,
                Coupon | Coupon[]
            >('api/coupons', payload);

            // Type-guard
            const isCoupon = (v: unknown): v is Coupon =>
                typeof v === 'object' &&
                v !== null &&
                'id' in v &&
                typeof (v as { id: unknown }).id === 'number';

            // Type guard for Coupon array
            const isCouponArray = (v: unknown): v is Coupon[] =>
                Array.isArray(v) && v.every(isCoupon);

            if (isCouponArray(created)) {
                // created is now Coupon[]
                const normalized = created.map((c) => ({
                    ...c,
                    id: Number(c.id),
                    course_id: c.course_id != null ? Number(c.course_id) : null,
                    bundle_id: c.bundle_id != null ? Number(c.bundle_id) : null,
                }));

                setCoupons((prev) => [...prev, ...normalized]);
            } else if (isCoupon(created)) {
                // created is now a single Coupon
                const single: Coupon = {
                    ...created,
                    id: Number(created.id),
                    course_id:
                        created.course_id != null
                            ? Number(created.course_id)
                            : null,
                    bundle_id:
                        created.bundle_id != null
                            ? Number(created.bundle_id)
                            : null,
                };

                setCoupons((prev) => [...prev, single]);
            } else {
                // Unknown type → fallback to safe refresh
                await fetchCoupons();
            }

            // reset form
            setCouponCode('');
            setDiscount(0);
            setMaxAvailability(1);
            setCourseIdsInput('');
            setBundleIdsInput('');
            toast.success('Coupon(s) created successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create coupon.');
        }
    };

    // Delete coupon
    const handleDeleteCoupon = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await fetchApi.delete(`api/coupons/${id}`, {});
            setCoupons((prev) => prev.filter((c) => c.id !== id));
            toast.success('Coupon deleted successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete coupon.');
        }
    };

    // UI states
    if (isLoading)
        return (
            <div className="p-6 text-center">Checking authentication...</div>
        );
    if (!isAuthenticated || !isAdmin(user?.role))
        return <div className="p-6 text-center">Unauthorized</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin Coupon Management</h1>

            {/* Create Coupon Form */}
            <div className="bg-white p-4 shadow rounded mb-6">
                <h2 className="font-semibold mb-2">Create New Coupon</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="border rounded px-2 py-1"
                    />
                    <input
                        type="number"
                        placeholder="Discount (%)"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="border rounded px-2 py-1"
                    />
                    <input
                        type="number"
                        placeholder="Max Availability"
                        value={maxAvailability}
                        onChange={(e) =>
                            setMaxAvailability(Number(e.target.value))
                        }
                        className="border rounded px-2 py-1"
                    />
                </div>

                {/* Course IDs (comma-separated) */}
                <div className="mb-3">
                    <label className="font-medium">
                        Course IDs (comma-separated)
                        {hasCourse && (
                            <span className="ml-2 text-sm text-gray-500">
                                — bundle input disabled
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. 12, 34,56"
                        value={courseIdsInput}
                        onChange={(e) => {
                            setCourseIdsInput(e.target.value);
                            if (e.target.value.trim() !== '')
                                setBundleIdsInput('');
                        }}
                        className="w-full border rounded px-2 py-1 mt-2"
                        disabled={hasBundle}
                    />
                </div>

                {/* Bundle IDs (comma-separated) */}
                <div className="mb-3">
                    <label className="font-medium">
                        Bundle IDs (comma-separated)
                        {hasBundle && (
                            <span className="ml-2 text-sm text-gray-500">
                                — course input disabled
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. 3,4"
                        value={bundleIdsInput}
                        onChange={(e) => {
                            setBundleIdsInput(e.target.value);
                            if (e.target.value.trim() !== '')
                                setCourseIdsInput('');
                        }}
                        className="w-full border rounded px-2 py-1 mt-2"
                        disabled={hasCourse}
                    />
                </div>

                <div className="mt-3">
                    <button
                        onClick={handleCreateCoupon}
                        className="bg-violet-600 text-white rounded px-4 py-1 hover:bg-violet-700 transition"
                    >
                        Create
                    </button>
                </div>
            </div>

            {/* Coupon List */}
            <div className="bg-white p-4 shadow rounded">
                <h2 className="font-semibold mb-2">Existing Coupons</h2>
                {loading ? (
                    <p>Loading coupons...</p>
                ) : coupons.length === 0 ? (
                    <p>No coupons available.</p>
                ) : (
                    <ul className="space-y-2">
                        {coupons.map((coupon) => (
                            <li
                                key={coupon.id}
                                className="flex justify-between items-center border-b py-2"
                            >
                                <div>
                                    <span className="font-semibold">
                                        {coupon.coupon_code}
                                    </span>{' '}
                                    - {coupon.discount}% off - Max:{' '}
                                    {coupon.max_availability}{' '}
                                    {coupon.course_id != null &&
                                        `| Course: ${coupon.course_id}`}{' '}
                                    {coupon.bundle_id != null &&
                                        `| Bundle: ${coupon.bundle_id}`}
                                </div>
                                <button
                                    onClick={() =>
                                        handleDeleteCoupon(coupon.id)
                                    }
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
