import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../utils/database';

export interface CartItem extends Product {
    quantity: number;
    selectedSize: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, size: string, quantity: number) => void;
    removeFromCart: (productId: number, size: string) => void;
    updateQuantity: (productId: number, size: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, size: string, quantity: number) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.id === product.id && item.selectedSize === size
            );

            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
                return newItems;
            } else {
                return [...prevItems, { ...product, selectedSize: size, quantity }];
            }
        });
    };

    const removeFromCart = (productId: number, size: string) => {
        setCartItems(prevItems =>
            prevItems.filter(item => !(item.id === productId && item.selectedSize === size))
        );
    };

    const updateQuantity = (productId: number, size: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId, size);
            return;
        }

        setCartItems(prevItems => {
            const itemIndex = prevItems.findIndex(
                item => item.id === productId && item.selectedSize === size
            );

            if (itemIndex === -1) return prevItems;

            const item = prevItems[itemIndex];

            // Validate against sizeStock if available
            if (item.sizeStock) {
                const availableStock = item.sizeStock[size as keyof typeof item.sizeStock];

                if (quantity > availableStock) {
                    // Don't allow quantity to exceed available stock
                    console.warn(`Cannot set quantity to ${quantity}. Only ${availableStock} available in size ${size}`);
                    // Set to maximum available stock instead
                    quantity = availableStock;
                }
            }

            return prevItems.map(item =>
                item.id === productId && item.selectedSize === size
                    ? { ...item, quantity }
                    : item
            );
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            itemCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
