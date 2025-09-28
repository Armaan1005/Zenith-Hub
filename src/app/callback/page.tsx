"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSpotifyAccessToken } from '@/app/actions';

const LS_ACCESS_TOKEN = 'spotify_access_token';
const LS_REFRESH_TOKEN = 'spotify_refresh_token';
const LS_EXPIRES_AT = 'spotify_expires_at';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Authenticating with Spotify, please wait...");

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Spotify login failed: ${errorParam}. Redirecting to homepage...`);
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    if (code) {
      getSpotifyAccessToken(code)
        .then(data => {
          if ('accessToken' in data && data.accessToken) {
            const expiresAt = Date.now() + data.expiresIn! * 1000;
            localStorage.setItem(LS_ACCESS_TOKEN, data.accessToken);
            localStorage.setItem(LS_REFRESH_TOKEN, data.refreshToken!);
            localStorage.setItem(LS_EXPIRES_AT, expiresAt.toString());
            setMessage("Authentication successful! Redirecting...");
            router.push('/');
          } else {
            setError('Failed to retrieve Spotify access token. Redirecting to homepage...');
            setTimeout(() => router.push('/'), 3000);
          }
        })
        .catch(err => {
            console.error("Error in getSpotifyAccessToken:", err);
            setError('An error occurred during authentication. Redirecting to homepage...');
            setTimeout(() => router.push('/'), 3000);
        });
    } else {
        // If no code and no error, maybe the user visited the callback url directly
        setMessage("No authentication code found. Redirecting to homepage...");
        setTimeout(() => router.push('/'), 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
        {error ? (
            <p className="text-destructive">{error}</p>
        ) : (
            <p>{message}</p>
        )}
        </div>
    </div>
  );
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<p className="text-center mt-8">Loading...</p>}>
            <CallbackContent />
        </Suspense>
    )
}
