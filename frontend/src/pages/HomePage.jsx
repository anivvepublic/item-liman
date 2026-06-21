import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Gamepad2, Flame, TrendingUp, ChevronRight } from 'lucide-react'

const HomePage = () => {
  const [games, setGames] = useState([])
  const [latestItems, setLatestItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      // Oyunları çek
      const { data: gamesData } = await supabase.from('games').select('*')
      if (gamesData) setGames(gamesData)

      // Son eklenen 6 eşyayı çek (fiyatına göre büyükten küçüğe değil, en yeniye göre)
      const { data: itemsData } = await supabase
        .from('items')
        .select(`*, games(name)`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)
        
      if (itemsData) setLatestItems(itemsData)
    } catch (error) {
      console.error("Veriler çekilemedi:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 md:pt-20"> {/* Navbar yüksekliği kadar üst boşluk */}

      {/* HERO BÖLÜMÜ */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Arka plan efektleri (CSS ile yapıldı, video lag yapmaz) */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/50 to-gray-950"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-700/50 mb-8">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-300 font-medium">Türkiye'nin En Güvenilir Oyun Pazarı</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Eşyalarını <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Güvenle</span> Sat
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Hesaplarını ve değerli eşyalarını Escrow (Güvenli Ödeme) sistemiyle koruma altına al. Binlerce oyuncuyla tanış.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/market" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              Hemen Keşfet
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/sell" className="px-8 py-4 border border-gray-600 hover:border-white text-white font-bold rounded-xl transition-all duration-300 hover:bg-white/5 flex items-center justify-center gap-2">
              Eşya Sat
            </Link>
          </div>
        </div>
      </section>

      {/* OYUNLAR BÖLÜMÜ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <Gamepad2 className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">Popüler Oyunlar</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-800/50 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {games.map((game) => (
              <Link 
                to={`/market?game=${game.slug}`} 
                key={game.id} 
                className="group relative h-48 md:h-56 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-500 shadow-lg hover:shadow-purple-500/10"
              >
                <img 
                  src={game.image_url} 
                  alt={game.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold text-white">{game.name}</h3>
                  <div className="mt-1 text-xs text-purple-300 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Mağazaya Git <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* SON EKLENEN EŞYALAR BÖLÜMÜ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Sıcak Fırsatlar</h2>
          </div>
          <Link to="/market" className="text-sm text-purple-400 hover:text-purple-300 font-medium hidden md:flex items-center gap-1 transition-colors">
            Tümünü Gör <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => <div key={i} className="min-w-[280px] h-[350px] bg-gray-800/50 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          /* Mobilde yatay kaydırma (scroll) sağlayan alan */
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {latestItems.map((item) => (
              <Link 
                to={`/item/${item.id}`} 
                key={item.id} 
                className="min-w-[260px] md:min-w-[300px] h-[340px] md:h-[360px] bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-gray-600 overflow-hidden group transition-all duration-300 snap-start flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.games && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-xs font-semibold text-purple-300">
                      {item.games.name}
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-white font-bold mb-1 truncate">{item.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                    <span className="text-xl font-extrabold text-yellow-400">{item.price} TL</span>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Satın Al</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

export default HomePage