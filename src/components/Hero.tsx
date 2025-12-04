import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroProps {
  onNavigate: (page: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative h-[70vh] overflow-hidden bg-neutral-100">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1613909671501-f9678ffc1d33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwbW9kZWx8ZW58MXx8fHwxNzY0MTE2NDk0fDA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Hero Fashion"
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
        <div className="text-center text-white max-w-2xl px-4">
          <h2 className="text-5xl sm:text-6xl tracking-[0.2em] mb-6">
            COLECCIÓN 2025
          </h2>
          <p className="text-lg tracking-wider mb-8 opacity-90">
            Elegancia Redefinida
          </p>
          <button 
            onClick={() => onNavigate('collection')}
            className="bg-white text-black px-8 py-3 tracking-widest hover:bg-black hover:text-white transition-colors duration-300"
          >
            EXPLORAR
          </button>
        </div>
      </div>
    </section>
  );
}