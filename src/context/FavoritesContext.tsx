import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
    favorites: number[];
    toggleFavorite: (productId: number) => Promise<void>;
    isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<number[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setFavorites([]);
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const response = await fetch('http://localhost/E-commerce Fashion Store Mockup 2/api/favorites.php', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    const toggleFavorite = async (productId: number) => {
        if (!user) {
            alert("Debes iniciar sesión para guardar favoritos.");
            return;
        }

        const isFav = favorites.includes(productId);
        const method = isFav ? 'DELETE' : 'POST';
        const body = JSON.stringify({ productId });

        // Optimistic update
        setFavorites(prev =>
            isFav ? prev.filter(id => id !== productId) : [...prev, productId]
        );

        try {
            const response = await fetch('http://localhost/E-commerce Fashion Store Mockup 2/api/favorites.php', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body
            });

            if (!response.ok) {
                const errorData = await response.json(); alert(`Error: ${errorData.message || 'Error desconocido'}`);
                // Revert on error
                setFavorites(prev =>
                    isFav ? [...prev, productId] : prev.filter(id => id !== productId)
                );
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("Error de conexión al guardar favorito");
            // Revert on error
            setFavorites(prev =>
                isFav ? [...prev, productId] : prev.filter(id => id !== productId)
            );
        }
    };

    const isFavorite = (productId: number) => favorites.includes(productId);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
