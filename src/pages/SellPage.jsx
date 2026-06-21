import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ImagePlus, FileText, Gamepad2, Coins, UploadCloud, X, Loader2, CheckCircle, Search } from 'lucide-react'

const SellPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [games, setGames] = useState([])
  const [categories, setCategories] = useState([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game_id: '',
    category_id: '',
    price: ''
  })

  const [gameSearch, setGameSearch] = useState('')
  const [catSearch, setCatSearch] = useState('')
  const [isGameDDOpen, setIsGameDDOpen] = useState(false)
  const [isCatDDOpen, setIsCatDDOpen] = useState(false)

  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const gameDDRef = useRef(null)
  const catDDRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (gameDDRef.current && !gameDDRef.current.contains(e.target)) setIsGameDDOpen(false)
      if (catDDRef.current && !catDDRef.current.contains(e.target)) setIsCatDDOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!user) navigate('/auth')
    fetchFilters()
  }, [user])

  const fetchFilters = async () => {
    const { data: gData } = await supabase.from('games').select('*').order('name')
    if (gData) setGames(gData)
    const { data: cData } = await supabase.from('categories').select('*').order('name')
    if (cData) setCategories(cData)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const filteredGames = games.filter(g => g.name.toLowerCase().includes(gameSearch.toLowerCase()))
  const filteredCats = categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))

  const selectGame = (game) => {
    setFormData({ ...formData, game_id: game.id })
    setGameSearch(game.name)
    setIsGameDDOpen(false)
  }

  const selectCat = (cat) => {
    setFormData({ ...formData, category_id: cat.id })
    setCatSearch(cat.name)
    setIsCatDDOpen(false)
  }

  const handleFileChange = (e) => addFiles(Array.from(e.target.files))
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)) }

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/')).slice(0, 5 - selectedFiles.length)
    const updatedFiles = [...selectedFiles, ...validFiles]
    const newPreviews = updatedFiles.map(file => URL.createObjectURL(file))
    setSelectedFiles(updatedFiles)
    setPreviews(newPreviews)
  }

  const removeImage = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validGame = games.find(g => g.name === gameSearch)
    const validCat = categories.find(c => c.name === catSearch)
    if (!validGame || !validCat) return alert('Lütfen listeden geçerli bir oyun ve kategori seçin.')

    setIsUploading(true)
    
    try {
      let finalImageUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80"

      if (selectedFiles.length > 0) {
        const file = selectedFiles[0]
        const reader = new FileReader()
        
        const base64File = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })

        const formDataImgBb = new FormData()
        formDataImgBb.append('key', import.meta.env.VITE_IMGBB_API_KEY)
        formDataImgBb.append('image', base64File.split(',')[1])

        const response = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formDataImgBb
        })

        const result = await response.json()
        
        if (result.success) {
          finalImageUrl = result.data.display_url
        } else {
          alert('Resim yüklenirken hata, varsayılan resim kaydedilecek.')
        }
      }

      const { data: itemData, error: insertError } = await supabase.from('items').insert([{
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        game_id: validGame.id,
        category_id: validCat.id,
        image_url: finalImageUrl,
        seller_id: user.id, 
        status: 'active'
      }]).select()

      if (insertError) throw insertError
      
      if (itemData && itemData.length > 0) {
        setIsSuccess(true)
        setTimeout(() => navigate(`/item/${itemData[0].id}`), 1500)
      } else {
        throw new Error("Veritabanı eşyayı ekledi ama ID döndürmedi.")
      }

    } catch (error) {
      alert('Hata: ' + error.message)
      setIsUploading(false)
    }
  }

  if (isSuccess) return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6 animate-bounce" />
        <h2 className="text-3xl font-extrabold text-white mb-2">İlan Başarıyla Oluşturuldu!</h2>
        <p className="text-gray-400">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )

  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-gray-950 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Eşyanızı Satışa Çıkarın</h1>
          <p className="text-gray-400">İlanınızı oluşturun ve binlerce oyuncuya ulaşın.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg"><ImagePlus className="w-5 h-5 text-purple-400" /></div>
              <div>
                <h2 className="text-xl font-bold text-white">Görseller</h2>
                <p className="text-xs text-gray-500">İlk seçtiğiniz fotoğraf kapak olur.</p>
              </div>
            </div>

            <div 
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-64 ${isDragging ? 'border-purple-500 bg-purple-500/5' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'}`}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-purple-400' : 'text-gray-600'}`} />
              <p className="text-sm text-gray-400 font-medium">Sürükle & Bırak veya Tıkla</p>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG, WEBP</p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-6">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-700">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-1 text-[10px] font-bold">
                        KAPAK
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 rounded-lg"><FileText className="w-5 h-5 text-blue-400" /></div>
              <div>
                <h2 className="text-xl font-bold text-white">Temel Bilgiler</h2>
                <p className="text-xs text-gray-500">Eşyanın ne olduğunu net bir şekilde açıklayın.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">İlan Başlığı</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Örn: Diamond 1 Smurf Hesap" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"/>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Açıklama</label>
                <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} placeholder="Açıklama yazın..." className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-y-6">
                
                <div className="relative w-full" ref={gameDDRef}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Oyun</label>
                  <div className="relative">
                    <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={gameSearch} onChange={(e) => { setGameSearch(e.target.value); setIsGameDDOpen(true) }} onFocus={() => setIsGameDDOpen(true)} placeholder="Oyun ara..." className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"/>
                  </div>
                  {isGameDDOpen && filteredGames.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-xl">
                      {filteredGames.map(game => (
                        <button type="button" key={game.id} onClick={() => selectGame(game)} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-white transition-colors flex items-center gap-3">
                          <img src={game.image_url} className="w-5 h-5 rounded object-cover" />
                          {game.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative w-full" ref={catDDRef}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Kategori</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={catSearch} onChange={(e) => { setCatSearch(e.target.value); setIsCatDDOpen(true) }} onFocus={() => setIsCatDDOpen(true)} placeholder="Kategori ara..." className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"/>
                  </div>
                  {isCatDDOpen && filteredCats.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-xl">
                      {filteredCats.map(cat => (
                        <button type="button" key={cat.id} onClick={() => selectCat(cat)} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-blue-500/20 hover:text-white transition-colors">
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/10 rounded-lg"><Coins className="w-5 h-5 text-yellow-400" /></div>
              <div>
                <h2 className="text-xl font-bold text-white">Fiyatlandırma</h2>
                <p className="text-xs text-gray-500">Uygun fiyat, hızlı satış demektir.</p>
              </div>
            </div>
            <div className="relative">
              <input type="number" name="price" required min="1" step="0.01" value={formData.price} onChange={handleChange} placeholder="0.00" className="w-full pl-4 pr-16 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-2xl font-extrabold placeholder-gray-600 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"/>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500 font-bold text-lg pointer-events-none">TL</div>
            </div>
            <p className="text-xs text-gray-600 mt-2">* Satış gerçekleştiğinde %3 platform komisyonu düşülecektir.</p>
          </div>

          <button type="submit" disabled={isUploading} className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
            {isUploading ? (<><Loader2 className="w-6 h-6 animate-spin" /> Yükleniyor...</>) : 'İlanı Yayınla'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SellPage