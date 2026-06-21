import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { User, Package, ArrowRight, Clock, CheckCircle, XCircle, AlertTriangle, Wallet, Save, X, Pencil, MapPin, Phone, BarChart3, ShieldCheck } from 'lucide-react'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    phone: ''
  })

  const [userItems, setUserItems] = useState([])
  const [userTransactions, setUserTransactions] = useState([])

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    setFormData({ username: profile?.username || '', bio: profile?.bio || '', location: profile?.location || '', phone: profile?.phone || '' })
    fetchUserStats()
  }, [user])

  const fetchUserStats = async () => {
    try {
      const [itemsRes, transRes] = await Promise.all([
        supabase.from('items').select('id, status, title, price, image_url, games(name)').eq('seller_id', user.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').or('buyer_id.eq.' + user.id, 'seller_id.eq.' + user.id).order('created_at', { ascending: false })
      ])
      if (itemsRes.data) setUserItems(itemsRes.data)
      if (transRes.data) setUserTransactions(transRes.data)
    } catch (error) { console.error("Hata:", error) }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setSaveMessage(null)
    
    try {
      const { data, error } = await supabase.from('profiles').update({ 
        username: formData.username, 
        bio: formData.bio, 
        location: formData.location, 
        phone: formData.phone 
      }).eq('id', user.id)

      if (error) throw error
      
      refreshProfile()
      setIsEditing(false)
      setSaveMessage('success')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage('error')
      setTimeout(() => setSaveMessage(null), 500)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEditing = () => {
    setFormData({ username: profile?.username || '', bio: profile?.bio || '', location: profile?.location || '', phone: profile?.phone || '' })
    setIsEditing(false)
  }

  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending': return { text: 'Beklemede', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Clock }
      case 'completed': return { text: 'Tamamlandı', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: CheckCircle }
      case 'cancelled': return { text: 'İptal / İade', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: XCircle }
      case 'reserved': return { text: 'Rezerve', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: AlertTriangle }
      case 'active': return { text: 'Satışta', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: Package }
      default: return { text: 'Bilinmiyor', color: 'text-gray-400', bg: 'bg-gray-800/50 border-gray-700', icon: X }
    }
  }

  const displayUsername = formData.username || (user?.email ? user.email.split('@')[0] : 'Kullanıcı')
  const activeSales = userItems.filter(i => i.status === 'active' || i.status === 'reserved').length
  const totalRevenue = userTransactions.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-gray-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ÜST PROFİL KARTI VE BİLGİLER */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/5 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group self-start">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-900/30 flex-shrink-0 border-2 border-purple-500/30">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-28 h-28 rounded-2xl object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="absolute -bottom-2 -right-2 p-2 bg-gray-800 border border-gray-700 rounded-full opacity-0 group-hover:opacity-100 hover:bg-purple-600 hover:border-purple-500 transition-all shadow-xl"
                title="Düzenle"
              >
                {isEditing ? <X className="w-4 h-4 text-white" /> : <Pencil className="w-4 h-4 text-gray-300" />}
              </button>
            </div>
            
            <div className="flex-1 w-full">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Kullanıcı Adı</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                        placeholder="Kullanıcı adını girin"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Konum (Şehir)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                          placeholder="Örn: İstanbul"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Telefon (Gizli, kimse görmesin)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                          placeholder="05XX XXX XX XX"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hakkında</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                        placeholder="Hakkınızda bir şeyler yazın..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button type="button" onClick={cancelEditing} className="px-6 py-2.5 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors">
                      İptal
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">{displayUsername}</h1>
                  <p className="text-sm text-gray-400 mb-4">{user?.email} {formData.location ? `- ${formData.location}` : ''}</p>
                  
                  {formData.bio && <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">{formData.bio}</p>}
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-center gap-1.5 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700/50">
                      <BarChart3 className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-300">{activeSales} Aktif İlan</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700/50">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs font-semibold text-green-300">{userTransactions.filter(t => t.status === 'completed').length} Başarılış</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="hidden md:flex flex-col items-end gap-1 bg-gray-800/60 border border-gray-700/50 rounded-xl px-6 py-4 min-w-[220px]">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Mevcut Bakiye</span>
              <div className="flex items-center gap-2">
                <Wallet className="w-6 h-6 text-yellow-400" />
                <span className="text-3xl font-extrabold text-yellow-400">{profile?.balance || 0} <span className="text-sm text-yellow-600">TL</span></span>
              </div>
            </div>
          </div>

          {/* Mobil Cüzdan */}
          <div className="md:hidden mt-6 p-4 bg-gray-800/60 border border-gray-700/50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mevcut Bakiye</span>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-extrabold text-yellow-400">{profile?.balance || 0} <span className="text-sm text-yellow-600">TL</span></span>
              </div>
            </div>
          </div>

          {/* BAŞARILAR VE HATALAR */}
          {saveMessage && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 border ${saveMessage === 'success' ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
              {saveMessage === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
              {saveMessage === 'success' ? 'Bilgiler başarıyla güncellendi.' : 'Güncellenirken bir hata oluştu.'}
            </div>
          )}
        </div>

        {/* SEKME MENÜLERİ */}
        <div className="flex gap-1 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-1.5 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'items' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
          >
            İlanlarım ({userItems.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'transactions' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
          >
            İşlemlerim ({userTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'security' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
          >
            Güvenlik
          </button>
        </div>

        {/* İÇERİKLER */}
        
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Satış İstatistikleri
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                  <span className="text-sm text-gray-400">Toplam İlan Sayısı</span>
                  <span className="text-sm font-bold text-white">{userItems.length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                  <span className="text-sm text-gray-400">Aktif İlan Sayısı</span>
                  <span className="text-sm font-bold text-purple-400">{activeSales}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                  <span className="text-sm text-gray-400">Tamamlanan İşlem</span>
                  <span className="text-sm font-bold text-green-400">{userTransactions.filter(t => t.status === 'completed').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Toplam Kazanç</span>
                  <span className="text-sm font-extrabold text-yellow-400">{totalRevenue.toFixed(2)} TL</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Hızlı İşlemler
              </h3>
              {userTransactions.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">Henüz işlem yapmadınız.</p>
              ) : (
                <div className="space-y-3">
                  {userTransactions.slice(0, 5).map((tr) => {
                    const statusInfo = getStatusDetails(tr.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <div key={tr.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${statusInfo.bg}`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          </div>
                          <span className="text-xs text-gray-300 truncate">{new Date(tr.created_at).toLocaleDateString('tr-TR')} - {statusInfo.text}</span>
                        </div>
                        <span className="text-sm font-bold text-white whitespace-nowrap ml-2">{tr.amount} TL</span>
                      </div>
                    )
                  })}
                  <button onClick={() => setActiveTab('transactions')} className="w-full text-center text-sm text-purple-400 hover:text-purple-300 font-medium mt-2">Tümünü Görüntüle</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-4">
            {userItems.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500 mb-2">Henüz ilanınız yok</h3>
                <p className="text-gray-600 text-sm mb-6">İlk eşyanızı satışa çıkararak kazanmaya başlayın.</p>
                <button 
                  onClick={() => navigate('/sell')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                >
                  İlk İlanı Oluştur <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              userItems.map((item) => {
                const statusInfo = getStatusDetails(item.status)
                const StatusIcon = statusInfo.icon
                return (
                  <div key={item.id} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 hover:border-gray-600 transition-all group">
                    <div className="flex items-center gap-4">
                      <img src={item.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-700 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold truncate">{item.title}</h3>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.text}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{item.games?.name}</span>
                          <span className="text-yellow-500 font-bold">{item.price} TL</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/item/${item.id}`)}
                        className="opacity-0 group-hover:opacity-100 bg-gray-800 p-2 rounded-lg transition-all hover:bg-purple-600"
                      >
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {userTransactions.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500 mb-2">Henüz işlem yok</h3>
                <p className="text-gray-600 text-sm">Marketplace'den alışveriş yaparak burada takip edebilirsiniz.</p>
              </div>
            ) : (
              userTransactions.map((tr) => {
                const statusInfo = getStatusDetails(tr.status)
                const StatusIcon = statusInfo.icon
                const isBuyer = tr.buyer_id === user.id
                return (
                  <div key={tr.id} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 hover:border-gray-600 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center flex-shrink-0 justify-center ${statusInfo.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.text}</span>
                          <span className="text-xs text-gray-600">{new Date(tr.created_at).toLocaleString('tr-TR')}</span>
                        </div>
                        <p className="text-sm text-gray-300">
                          {isBuyer ? 'Satın Alındı:' : 'Satıldı:'} <span className="text-xs text-gray-500">İşlem No: ...{tr.id.toString().substring(0, 10)}</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 mt-2 sm:mt-0 sm:text-right">
                        <p className="text-lg font-extrabold text-white">{tr.amount} <span className="text-sm text-yellow-500">TL</span></p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-green-400" />
                Hesap Güvenliği
              </h3>
              <p className="text-sm text-gray-400 mb-8">Hesabınızı güvende tutmak için şifrenizi düzenli tutun ve gereksiz uygulamalara tıklayın.</p>
              
              <div className="space-y-5">
                <div className="p-5 bg-red-900/10 border border-red-800/30 rounded-xl">
                  <h4 className="text-red-400 font-semibold mb-2">Şifre Değiştir</h4>
                  <p className="text-xs text-red-300 mb-4">Mevcut şifrenizi girin ve yeni şifrenizi belirleyin. En az 8 karakter, en az 1 büyük harf ve 1 sayı içermeli.</p>
                  <div className="space-y-3">
                    <input type="password" placeholder="Mevcut Şifre" className="w-full px-4 py-3 bg-gray-800/50 border border-red-900/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all" />
                    <input type="password" placeholder="Yeni Şifre" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all" />
                    <button className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20">Şifreyi Güncelle</button>
                  </div>
                </div>

                <div className="p-5 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                  <h4 className="text-white font-semibold mb-2">Oturum Yönetimi</h4>
                  <p className="text-xs text-gray-500 mb-4">Aktif oturumlarınızı burada görebilir ve gereksiz oturumları kapatabilirsiniz.</p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                      <span>Windows 10 / 11</span>
                      <span className="text-green-400 font-medium">Aktif (Şu an kullanıyorsun)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                      <span>Linux (Ubuntu)</span>
                      <span className="text-yellow-400 font-medium">Etkinlik yok</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-6">
              <h3 className="text-red-400 font-bold text-center mb-4">Geri Alınamaz İşlem (TEHLİKELİ BÖLGE)!</h3>
              <p className="text-sm text-red-300 text-center mb-4">Hesabınızı sildiğinde tüm eşyalar, bakiye ve işlem geçmişiniz silinecektir. Bu işlem geri alınamaz!</p>
              <div className="flex gap-3 justify-center">
                <button className="px-6 py-2.5 border-2 border-red-800 text-red-400 hover:bg-red-900 rounded-xl text-sm font-bold transition-colors">İptal Et</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProfilePage