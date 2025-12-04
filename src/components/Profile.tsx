import { User, Mail, Calendar, LogOut, MapPin, Save, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

interface ProfileProps {
    onNavigate: (page: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
    const { user, logout, checkSession } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl mb-4">No has iniciado sesión</h2>
                    <button
                        onClick={() => onNavigate('login')}
                        className="bg-black text-white px-6 py-2"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const updateData = {
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion'),
            ciudad: formData.get('ciudad'),
            estado: formData.get('estado'),
            codigo_postal: formData.get('codigo_postal')
        };

        try {
            const response = await fetch('http://localhost/E-commerce Fashion Store Mockup 2/api/auth.php?action=update_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
                await checkSession(); // Refresh user data
            } else {
                throw new Error(result.message || 'Error al actualizar perfil');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-sm border border-black/5 p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-black/5">
                        <div>
                            <h1 className="text-3xl tracking-wider mb-2">MI PERFIL</h1>
                            <p className="text-neutral-500">Gestiona tu información personal y de envío</p>
                        </div>
                        <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-full text-2xl">
                            {user.nombre ? user.nombre.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Info */}
                        <div>
                            <h3 className="tracking-wider mb-6 flex items-center gap-2 text-lg font-medium">
                                <User className="w-5 h-5" />
                                INFORMACIÓN PERSONAL
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm tracking-wider mb-2 opacity-70">NOMBRE COMPLETO</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        defaultValue={user.nombre}
                                        required
                                        className="w-full p-3 border border-black/20 focus:border-black outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm tracking-wider mb-2 opacity-70">EMAIL (No editable)</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full p-3 border border-black/10 bg-neutral-50 text-neutral-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm tracking-wider mb-2 opacity-70">TELÉFONO</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        defaultValue={user.telefono}
                                        placeholder="1234567890"
                                        className="w-full p-3 border border-black/20 focus:border-black outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm tracking-wider mb-2 opacity-70">TIPO DE CUENTA</label>
                                    <p className="p-3 capitalize">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="pt-8 border-t border-black/5">
                            <h3 className="tracking-wider mb-6 flex items-center gap-2 text-lg font-medium">
                                <MapPin className="w-5 h-5" />
                                DIRECCIÓN DE ENVÍO
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm tracking-wider mb-2 opacity-70">DIRECCIÓN</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        defaultValue={user.direccion}
                                        placeholder="Calle Principal 123"
                                        className="w-full p-3 border border-black/20 focus:border-black outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm tracking-wider mb-2 opacity-70">CIUDAD</label>
                                        <input
                                            type="text"
                                            name="ciudad"
                                            defaultValue={user.ciudad}
                                            placeholder="Ciudad"
                                            className="w-full p-3 border border-black/20 focus:border-black outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm tracking-wider mb-2 opacity-70">ESTADO</label>
                                        <input
                                            type="text"
                                            name="estado"
                                            defaultValue={user.estado}
                                            placeholder="Estado"
                                            className="w-full p-3 border border-black/20 focus:border-black outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm tracking-wider mb-2 opacity-70">CÓDIGO POSTAL</label>
                                        <input
                                            type="text"
                                            name="codigo_postal"
                                            defaultValue={user.codigo_postal}
                                            placeholder="12345"
                                            className="w-full p-3 border border-black/20 focus:border-black outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-8 border-t border-black/5">
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    onNavigate('home');
                                }}
                                className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-6 py-3 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="tracking-wider">CERRAR SESIÓN</span>
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-black text-white px-8 py-3 tracking-wider hover:bg-black/80 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span>GUARDAR CAMBIOS</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
