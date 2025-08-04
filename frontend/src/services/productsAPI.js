export const productsAPI = {
  addToCart: async ({ productId, quantity }) => {
    const res = await fetch(`/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    if (!res.ok) throw new Error('Failed to add to cart');
    return res.json();
  },

  addToWishlist: async (productId) => {
    const res = await fetch(`/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    if (!res.ok) throw new Error('Failed to add to wishlist');
    return res.json();
  },

  removeFromWishlist: async (productId) => {
    const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove from wishlist');
    return res.json();
  }
};