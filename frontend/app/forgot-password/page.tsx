'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchApi } from '@/lib/doFetch';
import Image from "next/image";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const VerifyEmail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleNewPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (newPassword.trim() === "") {
                setPasswordError("Password is required!")
                return;
            }
            if (newPassword.trim().length < 6) {
                setPasswordError("Password must be at least 6 characters!")
                return;
            }

            await fetchApi.post('api/users/reset-password', {
                email,
                verificationCode: code,
                newPassword,
            });
            router.push("/");
        } catch (err) {
            setError('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center bg-white shadow-md p-8 rounded-xl border border-gray-200">
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50 ">
                    <div className="bg-white p-6 rounded-2xl shadow-md relative w-full max-w-sm md:max-w-md md: overflow-hidden mt-16">

                        <Image
                            src="/images/logo.png"
                            alt="Tending to Infinity Logo"
                            width={48}
                            height={48}
                            className="mx-auto rounded-full mb-4"
                        />

                        <div>

                        </div>
                        <form onSubmit={handleNewPasswordSubmit}>
                            <h2 className="text-xl font-semibold mb-4 text-center">
                                New Password
                            </h2>
                            <div>
                                <div className="relative my-4">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter your Password"
                                        className={`w-full p-2 rounded-lg bg-gray-200 text-black shadow-lg ${passwordError ? 'border-2 border-red-500' : ''
                                            }`}
                                    />
                                    <span
                                        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-lg text-gray-600"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {passwordError && (<p className="text-red-500 text-sm mt-1">{passwordError}</p>)}
                            </div>
                            {error && (
                                <p className="text-red-500 mb-1">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-violet-600 hover:bg-purple-700 text-white py-2 rounded w-full"
                            >
                                {isLoading ? 'Sending...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default VerifyEmail;
