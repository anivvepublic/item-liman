import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { Anchor, Search, Menu, X, User, LogIn, UserPlus, Wallet, LogOut, PlusCircle } from 'lucide-react'

const Navbar = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setIsDropdownOpen(false)
      navigate('/')
    }
  }

  const displayUsername = profile?.username || (user?.email ? user.email.split('@')[0] : 'Kullanıcı')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <Anchor className="w-7 h-7 text-purple-500 transition-transform duration-300 hover:rotate-45" />
            <span className="text-xl md:text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              İTEM LİMAN
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Oyun, eşya veya hesap ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* YENİ EŞYA SAT BUTONU */}
                <Link to="/sell" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg hover:from-yellow-300 hover:to-orange-300 shadow-lg shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
                  <PlusCircle className="w-4 h-4" />
                  Eşya Sat
                </Link>

                <div className="flex items-center gap-2 bg-gray-800/60 px-4 py-2 rounded-lg border border-gray-700/50">
                  <Wallet className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-300">
                    {profile?.balance || 0} TL
                  </span>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 bg-gray-800 p-2.5 pr-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300"
                  >
                    <User className="w-5 h-5 text-gray-300" />
                    <span className="text-sm text-gray-200 font-medium">{displayUsername}</span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fadeIn">
                      <div className="p-3 border-b border-gray-800">
                        <p className="text-sm font-semibold text-white truncate">{displayUsername}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button onClick={() => { setIsDropdownOpen(false); navigate('/profile') }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors">
                          Profilim
                        </button>
                        <button onClick={() => { setIsDropdownOpen(false); navigate('/orders') }} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors">
                          Siparişlerim
                        </button>
                      </div>
                      <div className="border-t border-gray-800 py-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-all duration-300">
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </Link>
                <Link to="/auth" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105">
                  <UserPlus className="w-4 h-4" />
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-6 h-6" />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="md:hidden pb-4 animate-slideDown">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Ara..." className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all" autoFocus />
            </div>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 animate-fadeIn">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="p-3 border-b border-gray-800 mb-2">
                  <p className="text-sm font-bold text-white">{displayUsername}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                {/* MOBİL EŞYA SAT BUTONU */}
                <Link to="/sell" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 p-3 text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg font-bold">
                  <PlusCircle className="w-5 h-5" />
                  Eşya Sat
                </Link>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-sm text-gray-400">Bakiye</span>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-300">{profile?.balance || 0} TL</span>
                  </div>
                </div>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/profile') }} className="w-full text-left p-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                  Profilim
                </button>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 p-3 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 p-3 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </Link>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 p-3 text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold">
                  <UserPlus className="w-5 h-5" />
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar