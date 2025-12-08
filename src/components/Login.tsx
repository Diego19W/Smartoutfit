import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LoginProps {
  onNavigate: (page: string) => void;
  redirectPage?: string;
}

export function Login({ onNavigate, redirectPage = 'home' }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost/E-commerce Fashion Store Mockup 2/api/auth.php?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        login(data.user);
        onNavigate(redirectPage);
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'azure') => {
    setLoading(true);
    setError('');

    try {
      let result;

      // Import Firebase functions dynamically
      const { signInWithGoogle, signInWithFacebook, signInWithMicrosoft, syncFirebaseUserWithBackend, getAuthErrorMessage } = await import('../utils/authService');

      // Call appropriate provider function
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'azure':
          result = await signInWithMicrosoft();
          break;
      }

      // Sync with backend
      const backendData = await syncFirebaseUserWithBackend(result.user);

      // Login with AuthContext
      if (backendData.user) {
        login(backendData.user);
        onNavigate(redirectPage);
      }

    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      const { getAuthErrorMessage } = await import('../utils/authService');
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl tracking-[0.3em] mb-2">SMARTOUTFIT</h1>
          <p className="text-sm opacity-60 tracking-wider">INICIAR SESIÓN</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-black/20 hover:bg-black/5 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm tracking-wider">Continuar con Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-black/20 hover:bg-black/5 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#1877F2"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            <span className="text-sm tracking-wider">Continuar con Facebook</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('azure')}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-black/20 hover:bg-black/5 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#0078D4"
                d="M0 0v11.408h11.408V0zm12.594 0v11.408H24V0zM0 12.594V24h11.408V12.594zm12.594 0V24H24V12.594z"
              />
            </svg>
            <span className="text-sm tracking-wider">Continuar con Outlook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white opacity-60 tracking-wider">O CONTINUAR CON</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm tracking-wider mb-2 opacity-60">
              CORREO ELECTRÓNICO
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm tracking-wider mb-2 opacity-60">
              CONTRASEÑA
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 border border-black/20 bg-white focus:border-black outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-40 hover:opacity-70"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm tracking-wider opacity-60 hover:opacity-100 transition-opacity"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm tracking-wider">
              {loading ? "CARGANDO..." : "INICIAR SESIÓN"}
            </span>
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-sm tracking-wider opacity-60">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => onNavigate('register')}
              className="opacity-100 hover:underline"
            >
              Regístrate
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-sm tracking-wider opacity-40 hover:opacity-70 transition-opacity"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
