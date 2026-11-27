const storageKey = 'pvg-horizon-cart-v1'
export const maxCartQuantity = 99

export function readCart(products) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
    return Object.fromEntries(products.flatMap(({ id }) => {
      const quantity = saved?.[id]
      return Number.isInteger(quantity) && quantity > 0 ? [[id, Math.min(quantity, maxCartQuantity)]] : []
    }))
  } catch {
    return {}
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart))
  } catch {
    // The current tab still works when browser storage is unavailable.
  }
}

export function changeCartQuantity(cart, productId, quantity) {
  const next = { ...cart }
  if (quantity <= 0) delete next[productId]
  else next[productId] = Math.min(quantity, maxCartQuantity)
  return next
}

export function buildCartEnquiry(items) {
  return [
    'Hi PVG Horizon,',
    '',
    'Could you share more information about these pieces?',
    '',
    ...items.map(({ product, quantity }, index) => (
      `${index + 1}. ${product.name} | SKU: ${product.sku} | Quantity: ${quantity}`
    )),
    '',
    'Thank you.',
  ].join('\n')
}
