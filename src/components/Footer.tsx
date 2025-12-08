import { useState } from "react";

interface FooterProps {
    onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

    const handleNewsletterSubmit = () => {
        if (newsletterEmail && newsletterEmail.includes('@')) {
            setNewsletterSubscribed(true);
            setNewsletterEmail("");
        } else {
            alert("Por favor ingresa un email válido.");
        }
    };

    return (
        <footer className="bg-black text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div>
                        <h3 className="text-2xl tracking-[0.3em] mb-6">SMARTOUTFIT</h3>
                        <p className="text-sm opacity-70 leading-relaxed">
                            Elegancia redefinida para el mundo moderno.
                        </p>
                    </div>

                    <div>
                        <h4 className="tracking-wider mb-4 text-sm">COMPRAR</h4>
                        <ul className="space-y-2 text-sm opacity-70">
                            <li><button onClick={() => onNavigate('men')} className="hover:opacity-100 transition-opacity">Hombre</button></li>
                            <li><button onClick={() => onNavigate('women')} className="hover:opacity-100 transition-opacity">Mujer</button></li>
                            <li><button onClick={() => onNavigate('collection')} className="hover:opacity-100 transition-opacity">Nueva Colección</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="tracking-wider mb-4 text-sm">AYUDA</h4>
                        <ul className="space-y-2 text-sm opacity-70">
                            <li><button className="hover:opacity-100 transition-opacity">Contacto</button></li>
                            <li><button onClick={() => onNavigate('returns')} className="hover:opacity-100 transition-opacity">Devoluciones</button></li>
                            <li><button onClick={() => onNavigate('faq')} className="hover:opacity-100 transition-opacity">FAQ</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="tracking-wider mb-4 text-sm">NEWSLETTER</h4>
                        <p className="text-sm opacity-70 mb-4">
                            Recibe las últimas novedades
                        </p>
                        {newsletterSubscribed ? (
                            <div className="p-4 bg-white/10 border border-white/20 text-center">
                                <p className="text-sm text-white">¡Gracias por suscribirte!</p>
                                <p className="text-xs text-white/70 mt-1">Pronto recibirás noticias nuestras.</p>
                            </div>
                        ) : (
                            <div className="flex">
                                <input
                                    type="email"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    placeholder="Email"
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white outline-none"
                                />
                                <button
                                    onClick={handleNewsletterSubmit}
                                    className="px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm opacity-70">
                    <p>© 2025 SMARTOUTFIT. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
