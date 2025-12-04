import { useState } from "react";
import { Sparkles, ShoppingCart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CustomSelect } from "./CustomSelect";

interface Outfit {
  id: number;
  name: string;
  items: string[];
  image: string;
  price: number;
}

export function AIStylist() {
  const [formData, setFormData] = useState({
    temporada: "",
    ocasion: "",
    situacion: "",
    coloresEvitar: "",
    genero: "",
  });
  
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setShowResults(true);
    
    // TODO: Conectar con API de IA para generar recomendaciones reales
    // const response = await fetch('/api/ai-stylist', {
    //   method: 'POST',
    //   body: JSON.stringify(formData)
    // })
    // const recommendations = await response.json()
    // setOutfits(recommendations)
    
    // Simulación de respuesta de IA
    const generatedOutfits: Outfit[] = [
      {
        id: 1,
        name: "Look Elegante",
        items: ["Blazer Premium", "Pantalón de Corte", "Zapatos de Cuero"],
        image: "https://images.unsplash.com/photo-1565128260358-318e131efbb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGNvYXQlMjBvdXRmaXR8ZW58MXx8fHwxNzY0MjI3NTk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 4299,
      },
      {
        id: 2,
        name: "Look Casual Chic",
        items: ["Vestido Minimal", "Chaqueta Ligera", "Sneakers Designer"],
        image: "https://images.unsplash.com/photo-1542219550-2da790bf52e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZmFzaGlvbiUyMGNsb3RoaW5nfGVufDF8fHx8MTc2NDE1NTQ1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        price: 3199,
      },
      {
        id: 3,
        name: "Look Sofisticado",
        items: ["Vestido de Noche", "Abrigo Statement", "Clutch Luxury"],
        image: "https://images.unsplash.com/photo-1760287363707-851f4780b98c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZHJlc3MlMjBtYW5uZXF1aW58ZW58MXx8fHwxNzY0MjI3NTk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        price: 5499,
      },
    ];
    
    setOutfits(generatedOutfits);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8" />
            <h2 className="tracking-[0.2em]">AI STYLIST</h2>
          </div>
          <p className="opacity-60 max-w-2xl mx-auto">
            Deja que nuestra inteligencia artificial cree el outfit perfecto para ti
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Parte A - Formulario */}
          <div className="bg-neutral-50 p-8 border border-black/10">
            <h3 className="tracking-wider mb-6">TUS PREFERENCIAS</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm tracking-wider mb-3 opacity-70">
                  GÉNERO
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Hombre", "Mujer", "Unisex"].map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => setFormData({ ...formData, genero: gen })}
                      className={`py-3 border transition-colors ${
                        formData.genero === gen
                          ? "bg-black text-white border-black"
                          : "bg-white border-black/20 hover:border-black"
                      }`}
                    >
                      {gen}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm tracking-wider mb-3 opacity-70">
                  TEMPORADA
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Primavera", "Verano", "Otoño", "Invierno"].map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setFormData({ ...formData, temporada: temp })}
                      className={`py-3 border transition-colors ${
                        formData.temporada === temp
                          ? "bg-black text-white border-black"
                          : "bg-white border-black/20 hover:border-black"
                      }`}
                    >
                      {temp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm tracking-wider mb-3 opacity-70">
                  OCASIÓN
                </label>
                <CustomSelect
                  value={formData.ocasion}
                  onChange={(value) => setFormData({ ...formData, ocasion: value })}
                  options={[
                    { value: "Trabajo", label: "Trabajo" },
                    { value: "Casual", label: "Casual" },
                    { value: "Formal", label: "Formal" },
                    { value: "Fiesta", label: "Fiesta" },
                    { value: "Deportivo", label: "Deportivo" },
                    { value: "Playa", label: "Playa" },
                  ]}
                  placeholder="Selecciona una ocasión"
                />
              </div>

              <div>
                <label className="block text-sm tracking-wider mb-3 opacity-70">
                  DESCRIBE LA SITUACIÓN
                </label>
                <textarea
                  value={formData.situacion}
                  onChange={(e) => setFormData({ ...formData, situacion: e.target.value })}
                  placeholder="Ej: Tengo una reunión importante, cena romántica, viaje de fin de semana..."
                  rows={4}
                  className="w-full p-3 border border-black/20 bg-white focus:border-black outline-none placeholder:opacity-40 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm tracking-wider mb-3 opacity-70">
                  COLORES A EVITAR
                </label>
                <input
                  type="text"
                  value={formData.coloresEvitar}
                  onChange={(e) => setFormData({ ...formData, coloresEvitar: e.target.value })}
                  placeholder="Ej: Rojo, Amarillo"
                  className="w-full p-3 border border-black/20 bg-white focus:border-black outline-none placeholder:opacity-40"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 tracking-widest hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                GENERAR OUTFITS
              </button>
            </form>
          </div>

          {/* Parte B - Resultados */}
          <div className="border border-black/10 flex flex-col min-h-[600px]">
            {!showResults ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="opacity-40">
                  <Sparkles className="w-12 h-12 mx-auto mb-4" />
                  <p className="tracking-wider">
                    Completa el formulario para comenzar
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
                {/* Header de resultados */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 opacity-60" />
                    <h3 className="tracking-wider">RECOMENDACIONES DE IA</h3>
                  </div>
                  <p className="text-sm opacity-60 leading-relaxed">
                    He analizado tus preferencias y creado {outfits.length} outfits personalizados para {formData.temporada.toLowerCase()}, 
                    perfectos para {formData.ocasion.toLowerCase()}.
                    {formData.situacion && ` ${formData.situacion}`}
                  </p>
                </div>

                {/* Outfits Grid */}
                <div className="space-y-4">
                  {outfits.map((outfit) => (
                    <div key={outfit.id} className="bg-neutral-50 border border-black/10 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        {/* Imagen */}
                        <div className="w-full sm:w-32 h-40 sm:h-32 bg-neutral-200 flex-shrink-0 overflow-hidden">
                          <ImageWithFallback
                            src={outfit.image}
                            alt={outfit.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Contenido */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="tracking-wider mb-3">{outfit.name}</h4>
                            <div className="mb-4">
                              <p className="text-xs tracking-wider opacity-60 mb-2">INCLUYE:</p>
                              <ul className="text-sm opacity-70 space-y-1">
                                {outfit.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="opacity-40">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {/* Precio y botón */}
                          <div className="flex items-center justify-between pt-3 border-t border-black/10">
                            <div>
                              <p className="text-xs opacity-60 tracking-wider mb-1">PRECIO TOTAL</p>
                              <p className="text-lg">${outfit.price.toLocaleString('es-MX')} MX</p>
                            </div>
                            <button className="bg-black text-white px-6 py-2.5 text-sm tracking-wider hover:bg-black/80 transition-colors flex items-center gap-2">
                              <ShoppingCart className="w-4 h-4" />
                              AÑADIR AL CARRITO
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botón para generar nuevas opciones */}
                <div className="mt-6 pt-6 border-t border-black/10">
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setOutfits([]);
                    }}
                    className="w-full border border-black/20 py-3 hover:bg-black/5 transition-colors"
                  >
                    <span className="text-sm tracking-wider opacity-70">MODIFICAR PREFERENCIAS</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
