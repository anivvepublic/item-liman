import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Anchor, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'

const AuthPage = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (loginError) throw loginError
        // GİRİŞ BAŞARILIYSA ANA SAYFAYA YÖNLENDİR
        if (data.session) navigate('/')
      } else {
        if (formData.username.length < 3) {
          throw new Error('Kullanıcı adı en az 3 karakter olmalıdır.')
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username
            }
          }
        })
        if (signUpError) throw signUpError
        
        // Email onayını kapattığımız için kayıt olunca direkt giriş yapıp ana sayfaya gönderebiliriz
        // ama güvenli olması adına kullanıcıya başarılı mesajı gösterelim
        setError('Başarıyla kayıt oldunuz! Şimdi giriş yapabilirsiniz.')
        setIsLogin(true) // Formu otomatik giriş ekranına çevir
      }
      
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-gray-950">
      <div className="w-full max-w-5xl flex bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden">
        
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-12 flex-col justify-center items-center border-r border-gray-700/30 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="relative z-10 text-center">
            <Anchor className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-extrabold text-white mb-4">Güvenli Limanınıza Hoş Geldiniz</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Eşya ve hesaplarınızı güvence altına alın, 
              oyuncularla güvenli şekilde ticaret yapın.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white">
              {isLogin ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
            </h3>
            <p className="text-gray-400 mt-2 text-sm">
              {isLogin ? 'Lütfen giriş bilgilerinizi girin.' : 'Ticaret yapmaya hemen başlayın.'}
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-3 rounded-lg text-sm border ${error.includes('Başarıyla') ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  name="username"
                  placeholder="Kullanıcı Adı"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="E-posta Adresi"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Şifre"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Giriş Yap' : 'Kayıt Ol'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            {isLogin ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null) }}
              className="font-semibold text-purple-400 hover:text-purple-300 transition-colors ml-1"
            >
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage