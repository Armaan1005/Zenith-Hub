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

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Spotify login failed: ${errorParam}`);
      return;
    }

    if (code) {
      getSpotifyAccessToken(code).then(data => {
        if ('accessToken' in data && data.accessToken) {
          const expiresAt = Date.now() + data.expiresIn! * 1000;
          localStorage.setItem(LS_ACCESS_TOKEN, data.accessToken);
          localStorage.setItem(LS_REFRESH_TOKEN, data.refreshToken!);
          localStorage.setItem(LS_EXPIRES_AT, expiresAt.toString());
          router.push('/');
        } else {
          setError('Failed to retrieve Spotify access token.');
        }
      });
    } else {
        router.push('/');
    }
  }, [searchParams, router]);

  if (error) {
    return <p className="text-destructive text-center mt-8">{error}</p>;
  }

  return <p className="text-center mt-8">Authenticating with Spotify, please wait...</p>;
}

export default function CallbackPage() {
    return (
        <Suspense fallback={<p className="text-center mt-8">Loading...</p>}>
            <CallbackContent />
        </Suspense>
    )
}
