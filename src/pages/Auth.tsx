import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome to SIS Time Tracker</h1>
            <p className="text-neutral-600">Sign in to access your dashboard</p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              style: {
                button: {
                  background: '#16a34a',
                  color: 'white',
                  borderRadius: '8px',
                },
                anchor: {
                  color: '#16a34a',
                },
              },
            }}
            providers={[]}
            theme="default"
            view="sign_in"
            showLinks={true}
            magicLink={false}
            redirectTo={`${window.location.origin}/reset-password`}
          />
          
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500">
              Secure login powered by Supabase
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}