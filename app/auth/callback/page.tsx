// app/auth/callback/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

// Komponen utama yang menggunakan useSearchParams
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticateWithToken = async () => {
      if (!token) {
        setError('No authentication token provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Attempting to sign in with token...');
        
        // Sign in ke FNG App menggunakan token dari login app
        const result = await signIn('cross-app-token', {
          token: token,
          redirect: false,
        });

        console.log('Sign in result:', result);

        if (result?.error) {
          setError(`Authentication failed: ${result.error}`);
          setLoading(false);
          return;
        }

        // Redirect ke dashboard FNG setelah berhasil login
        console.log('Authentication successful, redirecting to dashboard...');
        router.push('/dashboard');
        
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication error occurred');
        setLoading(false);
      }
    };

    authenticateWithToken();
  }, [token, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h1>
          <p className="text-gray-600">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = 'https://fng-login-app.vercel.app'}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Login App
            </button>
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Loading component untuk Suspense fallback
function AuthCallbackLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        <p className="text-gray-600">Preparing authentication...</p>
      </div>
    </div>
  );
}

// Main component dengan Suspense boundary
export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}