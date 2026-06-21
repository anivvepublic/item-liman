import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Loader2, CheckCircle, AlertTriangle, ArrowLeft, User, ImageOff } from 'lucide-react'

const ItemDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, refreshBalance } = useAuth()
  
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState('')
  const [imgError, setImgError] = useState(false) // GÖRSEL HATA DURUMU
  const [purchaseState, setPurchaseState] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    setLoading(true)
    setImgError(false) // Sayfa değiştiğinde hatayı sıfırla
    const { data, error } = await supabase
      .from('items')
      .select(`*, games(name), categories(name)`)
      .eq('id', id)
      .single()

    if (error) {
      navigate('/market')
      return
    }
    
    setItem(data)
    setMainImage(data.image_url)
    setLoading(false)
  }

  const handlePurchase = async () => {
    if (!user) {
      navigate('/auth')
      return
    }

    setPurchaseState('loading')
    setErrorMessage('')

    try {
      const { data, error } = await supabase.rpc('purchase_item', {
        p_item_id: id,
        p_buyer_id: user.id
      })

      if (error) throw new Error('Sunucu hatası')
      
      if (data === 'success') {
        setPurchaseState('success')
        refreshBalance()
      } else {
        throw new Error(data)
      }
    } catch (error) {
      setPurchaseState('error')
      setErrorMessage(error.message)
    }
  }

  if (loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
    </div>
  )

  if (!item) return null

  const isOwner = user && user.id === item.seller_id
  const isPurchasable = item.status === 'active' && !isOwner

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-gray-950 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Geri Dön</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* SOL - GÖRSEL ALANI */}
          <div>
            <div className="w-full aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 mb-4 relative">
              {/* EĞER GÖRSEL YÜKLENEMEZSE BU ŞIK EKRAN ÇIKACAK */}
              {!imgError ? (
                <img 
                  src={mainImage} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)} // Fotoğraf çökerse imgError'ı true yap
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/30">
                  <ImageOff className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-500 text-sm font-medium">Görsel Bulunamadı</p>
                </div>
              )}
            </div>
            
            {/* Alt küçük görseller (Şimdilik tek resim kullandığımız için latent kalabilir) */}
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => { setMainImage(item.image_url); setImgError(false) }}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${!imgError ? 'border-purple-500 opacity-100' : 'border-gray-800 opacity-50'}`}
              >
                {!imgError ? (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center"><ImageOff className="w-5 h-5 text-gray-700"/></div>
                )}
              </button>
            </div>
          </div>

          {/* SAĞ - BİLGİ VE SATIN AL ALANI */}
          <div className="flex flex-col">
            <div className="flex gap-2 mb-4">
              {item.games && <span className="px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-bold rounded-md border border-purple-500/30">{item.games.name}</span>}
              {item.categories && <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-semibold rounded-md border border-gray-700">{item.categories.name}</span>}
              {item.status !== 'active' && <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-md border border-red-500/30">SATILDI / REZERVE</span>}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{item.title}</h1>
            
            <p className="text-gray-400 leading-relaxed mb-8 flex-1">
              {item.description}
            </p>

            <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800 mb-8">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Satıcı</p>
                <p className="text-sm font-semibold text-white">Kullanıcı #{item.seller_id?.toString().substring(0,6)}</p>
              </div>
            </div>

            <div className="hidden md:block border-t border-gray-800 pt-8">
              {isOwner ? (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-sm font-medium text-center">
                  Bu ilan size ait.
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Satın Alma Fiyatı</p>
                    <p className="text-4xl font-extrabold text-yellow-400">{item.price} <span className="text-lg text-yellow-600">TL</span></p>
                  </div>
                  
                  {purchaseState === 'success' ? (
                    <div className="flex items-center justify-center gap-3 p-4 bg-green-900/30 border border-green-700 text-green-400 rounded-xl font-bold">
                      <CheckCircle className="w-6 h-6" />
                      Satın Alma Başarılı! Güvenli Ödeme Beklemede.
                    </div>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={!isPurchasable || purchaseState === 'loading'}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-extrabold text-lg rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {purchaseState === 'loading' ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-6 h-6" />
                      )}
                      {isPurchasable ? 'Güvenli Satın Al' : 'Müsait Değil'}
                    </button>
                  )}

                  {purchaseState === 'error' && (
                    <div className="flex items-start gap-2 mt-4 p-3 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      {errorMessage}
                    </div>
                  )}

                  {!user && isPurchasable && (
                    <p className="text-center text-xs text-gray-500 mt-3">Satın almak için giriş yapmalısınız.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBİL ALT SABİT BUTON */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 p-4 z-40">
        {isOwner ? (
           <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-sm font-medium text-center">
             Bu ilan size ait.
           </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Fiyat</p>
              <p className="text-2xl font-extrabold text-yellow-400">{item.price} TL</p>
            </div>
            {purchaseState === 'success' ? (
               <div className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-900/30 border border-green-700 text-green-400 rounded-xl font-bold text-sm">
                 <CheckCircle className="w-5 h-5" /> Başarılı
               </div>
            ) : (
              <button 
                onClick={handlePurchase}
                disabled={!isPurchasable || purchaseState === 'loading'}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 font-bold rounded-xl disabled:opacity-50"
              >
                {purchaseState === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Güvenli Satın Al
              </button>
            )}
          </div>
        )}
      </div>
      
      {purchaseState === 'error' && (
        <div className="md:hidden fixed bottom-24 left-4 right-4 z-50 flex items-start gap-2 p-3 bg-red-900/95 backdrop-blur border border-red-800 text-red-400 text-sm rounded-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {errorMessage}
        </div>
      )}

    </div>
  )
}

export default ItemDetailPage