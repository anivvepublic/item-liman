import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { SlidersHorizontal, X, PackageOpen, ChevronDown } from 'lucide-react'

const MarketPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [games, setGames] = useState([])
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const activeGame = searchParams.get('game') || ''
  const activeCategory = searchParams.get('category') || ''
  const sortBy = searchParams.get('sort') || 'newest'

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchItems()
  }, [activeGame, activeCategory, sortBy])

  const fetchFilters = async () => {
    const { data: gData } = await supabase.from('games').select('*')
    if (gData) setGames(gData)
    const { data: cData } = await supabase.from('categories').select('*')
    if (cData) setCategories(cData)
  }

  const fetchItems = async () => {
    setLoading(true)
    let query = supabase.from('items').select('*, games(name), categories(name)').eq('status', 'active')
    if (activeGame) query = query.eq('game_id', activeGame)
    if (activeCategory) query = query.eq('category_id', activeCategory)
    if (sortBy === 'price_low') query = query.order('price', { ascending: true })
    else if (sortBy === 'price_high') query = query.order('price', { ascending: false })
    else query = query.order('created_at', { ascending: false })
    const { data } = await query
    setItems(data || [])
    setLoading(false)
  }

  const updateFilter = (key, value) => {
    if (value) {
      setSearchParams(prev => { prev.set(key, value); return prev })
    } else {
      setSearchParams(prev => { prev.delete(key); return prev })
    }
  }

  const clearFilters = () => setSearchParams({})

  const FilterUI = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-purple-400" /> Filtreler
        </h3>
        {(activeGame || activeCategory) && (
          <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 transition-colors">Temizle</button>
        )}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Oyun</h4>
        <div className="space-y-2">
          {games.map((game) => (
            <button key={game.id} onClick={() => updateFilter('game', activeGame === game.id ? '' : game.id)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 ${activeGame === game.id ? 'bg-purple-500/10 border border-purple-500/50 text-purple-300' : 'text-gray-300 border border-transparent hover:bg-gray-800/50 hover:text-white'}`}>
              <img src={game.image_url} alt="" className="w-6 h-6 rounded object-cover" />
              {game.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Kategori</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => updateFilter('category', activeCategory === cat.id ? '' : cat.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeCategory === cat.id ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300' : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sıralama</h4>
        <div className="relative">
          <select value={sortBy} onChange={(e) => updateFilter('sort', e.target.value)} className="w-full appearance-none bg-gray-800/50 border border-gray-700 text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer">
            <option value="newest">En Yeni</option>
            <option value="price_low">Fiyat: Düşükten Yükseğe</option>
            <option value="price_high">Fiyat: Yüksekten Düşüğe</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Keşif</h1>
            <p className="text-gray-400 text-sm mt-1">{loading ? 'Yükleniyor...' : `${items.length} eşya bulundu`}</p>
          </div>
          <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-medium hover:bg-gray-700 transition-colors">
            <SlidersHorizontal className="w-4 h-4" /> Filtrele
          </button>
        </div>

        <div className="flex gap-8">
          
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <FilterUI />
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="h-48 bg-gray-800 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                      <div className="h-6 bg-gray-800 rounded w-1/3 animate-pulse mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                  <PackageOpen className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Eşya Bulunamadı</h3>
                <p className="text-gray-500 text-sm max-w-md">Bu filtrelere uygun eşya şu an bulunmuyor.</p>
                <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors">Filtreleri Temizle</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link to={`/item/${item.id}`} key={item.id} className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10 hover:border-gray-600 block">
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {item.games && <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-xs font-bold text-purple-300 rounded-md">{item.games.name}</span>}
                        {item.categories && <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-xs font-semibold text-gray-300 rounded-md">{item.categories.name}</span>}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-white font-bold text-lg mb-1 truncate group-hover:text-purple-300 transition-colors">{item.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                      <div className="flex items-end justify-between pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Fiyat</p>
                          <p className="text-2xl font-extrabold text-yellow-400">{item.price} <span className="text-sm text-yellow-600">TL</span></p>
                        </div>
                        <span className="px-4 py-2 text-sm font-bold text-gray-300 border border-gray-700 rounded-lg group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-200">İncele</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-gray-950 border-r border-gray-800 shadow-2xl transform transition-transform duration-300 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Filtreler</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <FilterUI />
            <button onClick={() => setIsMobileFilterOpen(false)} className="w-full mt-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
              {items.length} Eşyayı Göster
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketPage