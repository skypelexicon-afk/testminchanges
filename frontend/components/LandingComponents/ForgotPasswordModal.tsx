'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/doFetch';
import Image from 'next/image';
import { IoCloseSharp } from 'react-icons/io5';

export default function ForgotPasswordModal() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await fetchApi.post('api/users/forgot-password', { email });
            alert("Check your mail for password reset link.");
            handleClose();
        } catch (err) {
            setError('Failed to send password reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [handleClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50 ">
            <div className="bg-white p-6 rounded-2xl shadow-md relative w-full max-w-sm md:max-w-md md: overflow-hidden mt-16">

                <Image
                    src="/images/logo.png"
                    alt="Tending to Infinity Logo"
                    width={48}
                    height={48}
                    className="mx-auto rounded-full mb-4"
                />

                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                        Forgot Password
                    </h2>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border p-2 rounded w-full mb-4"
                    />
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-violet-600 hover:bg-purple-700 text-white py-2 rounded w-full"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
