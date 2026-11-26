export function whatsappChatUrl(configuredNumber) {
  const digits = String(configuredNumber ?? '').trim().replace(/^\+/, '').replace(/[\s()-]/g, '')
  return /^[1-9]\d{6,14}$/.test(digits) ? `https://wa.me/${digits}` : ''
}

export function whatsappOrderUrl(chatUrl, product, quantity) {
  if (!chatUrl) return ''
  const message = [
    'Hi PVG Horizon, I would like to order:',
    product.name,
    `SKU: ${product.sku}`,
    `Quantity: ${quantity}`,
    '',
    'Please confirm availability, the total price, and delivery details.',
  ].join('\n')
  return `${chatUrl}?text=${encodeURIComponent(message)}`
}
