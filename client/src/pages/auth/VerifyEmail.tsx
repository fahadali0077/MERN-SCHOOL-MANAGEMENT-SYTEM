import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { School, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiSlice } from '../../store/api/apiSlice';
import { useWindowTitle } from '../../hooks';

// FIX: The verification email links to /auth/verify-email?token=... but there was no
// route/page to handle it — the link 404'd. This page reads the token and verifies it.
const verifyApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    verifyEmail: b.mutation<any, string>({
      query: (token) => ({ url: `/auth/verify-email?token=${encodeURIComponent(token)}`, method: 'GET' }),
    }),
  }),
  overrideExisting: false,
});

const { useVerifyEmailMutation } = verifyApi;

export default function VerifyEmail() {
  useWindowTitle('Verify Email');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [verifyEmail, { isLoading, isSuccess, isError }] = useVerifyEmailMutation();
  const triedRef = useRef(false);

  useEffect(() => {
    if (token && !triedRef.current) {
      triedRef.current = true;
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const status = !token ? 'no-token' : isLoading ? 'loading' : isSuccess ? 'success' : isError ? 'error' : 'loading';

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-glow">
            <School size={20} className="text-white" />
          </div>
        </div>
        <div className="card p-8 text-center animate-fade-up">
          {status === 'loading' && (
            <>
              <Loader2 size={32} className="text-accent animate-spin mx-auto mb-4" />
              <h2 className="font-display font-bold text-xl text-text-primary">Verifying your email…</h2>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h2 className="font-display font-bold text-xl text-text-primary">Email verified!</h2>
              <p className="text-text-secondary text-sm mt-2">Your email has been confirmed. You can now sign in.</p>
              <Link to="/auth/login" className="btn-primary text-sm mt-6 inline-flex">Go to login</Link>
            </>
          )}
          {(status === 'error' || status === 'no-token') && (
            <>
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <XCircle size={28} className="text-danger" />
              </div>
              <h2 className="font-display font-bold text-xl text-text-primary">Verification failed</h2>
              <p className="text-text-secondary text-sm mt-2">
                {status === 'no-token'
                  ? 'No verification token was provided in the link.'
                  : 'This verification link is invalid or has expired.'}
              </p>
              <Link to="/auth/login" className="btn-secondary text-sm mt-6 inline-flex">Back to login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
