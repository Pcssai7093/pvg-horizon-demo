import photos from './photos.json'
import imported from './imported-catalog.json'
import settings from './store-settings.json'
import listingPhotos from './listing-photos.json'
import reviewedPhotos from './reviewed-photos.json'

export const business = { name: 'PVG Horizon', ...settings }

export const asset = (file) => {
  const revision = /^(original|bharathi)-/.test(file) ? '?v=2' : ''
  return `${import.meta.env.BASE_URL}catalog/${encodeURIComponent(file)}${revision}`
}

const featured = [
  ['three-line-green', '3Line Green', 'Three-Line Green Necklace', 'Layered', 'Green',
    'Three rows give this green imitation necklace a layered look in a single piece. The repetition brings structure to an outfit, while the colour works especially well with ivory, cream and soft gold tones.',
    'Pair it with a plain saree or a solid-colour kurta. Small earrings keep the layered neckline in focus.'],
  ['five-line-red', '5Line Red', 'Five-Line Red Necklace', 'Layered', 'Red',
    'Five rows give this red imitation necklace a fuller profile and make the neckline the focal point. It suits festive outfits with simple blouses and picks up red accents in woven borders or printed fabrics.',
    'Try it with a cream silk saree, an understated lehenga or a deep green blouse.'],
  ['pumpkin-blue', 'Pumpkin Stone Blue', 'Pumpkin Stone Blue Necklace', 'Stone designs', 'Blue',
    'The blue colour makes this imitation necklace a natural choice for cool-toned outfits. It brings definition to a pale neckline and adds a stronger accent when styled against cream or beige.',
    'Wear it with a silver-grey saree or a cream kurta. Repeat blue in a small accessory to tie the look together.'],
  ['valadanda-maroon', 'Valadanda Shimmer Maroon', 'Maroon Valadanda Shimmer Necklace', 'Traditional', 'Maroon',
    'Deep maroon gives this Valadanda design a rich accent for traditional dressing. Use it to bring out a maroon woven border, or set it against an ivory blouse so the colour stands on its own.',
    'Pair it with a silk saree or a festive kurta in cream, muted gold or a contrasting teal.'],
  ['short-ball-chain', 'Short Ball Chain', 'Short Ball Chain Necklace', 'Short necklaces', null,
    'This short imitation necklace brings the detail close to the neckline. The repeated ball motif gives it a simple rhythm that works with printed fabrics as well as plain blouses.',
    'Wear it alone with a scoop neck, or pair it with a longer chain for a layered look.'],
  ['cz-5469-maroon', 'CZ 5469 Maroon', 'Maroon CZ 5469 Necklace', 'Stone designs', 'Maroon',
    'This imitation necklace uses maroon as its main colour accent. It pairs easily with a plain blouse and can pick up the darker tones in a patterned dupatta or saree border.',
    'Style it with beige, blush or ivory. For evening wear, try a maroon blouse for a tonal look.'],
].map(([id, sku, name, category, colour, description, styling]) => ({
  id, sku, name, category, colour, description, styling, photos: photos[id],
}))


const styles = {
  Layered: [
    'The layered arrangement brings depth to plain fabrics and gives a simple neckline a stronger point of focus. It works well with festive silhouettes that leave room for the rows to sit visibly.',
    'Try it with an open-neck blouse or a plain saree. Keep the earrings simple to give the necklace room.',
  ],
  'Stone designs': [
    'This imitation necklace adds a decorative accent to a simple outfit. Use it to echo a detail in a woven border or wear it against a solid neckline to bring the design into focus.',
    'Pair it with a plain silk blouse or a monochrome kurta. Small studs keep the necklace as the main accessory.',
  ],
  'Short necklaces': [
    'This short imitation necklace gives a little definition close to the neckline. It works as a standalone accessory with both printed pieces and solid-colour everyday outfits.',
    'Try it with an open or scoop neckline. Add a longer, simpler chain when you want a layered look.',
  ],
  'Pearl styles': [
    'A pearl-inspired look brings a softer accent to the neckline. This imitation piece pairs naturally with delicate prints and gives a plain outfit a more finished look.',
    'Style it with a pastel saree, a cream blouse or a floral kurta. Keep the surrounding accessories understated.',
  ],
  Mangalsutra: [
    'This imitation mangalsutra can anchor a simple everyday outfit or complement dressier Indian clothing. Wear it where the neckline leaves the design easy to see.',
    'Pair it with a plain blouse, a kurta or a saree. Simple earrings make an easy combination for daily wear.',
  ],
  Traditional: [
    'This imitation necklace is suited to traditional dressing, from festive kurtas to sarees with woven borders. It is easy to make the jewellery the focal point by keeping the fabric around the neckline simple.',
    'Wear it with a silk saree or solid blouse. Choose a colour from the outfit to repeat in another small accessory.',
  ],
}

function categoryFor(collection) {
  if (/^[35]Line/i.test(collection)) return 'Layered'
  if (/^CZ/i.test(collection)) return 'CZ necklaces'
  if (/Stone/i.test(collection)) return 'Stone designs'
  if (/^short necklace/i.test(collection)) return 'Short necklaces'
  if (/Moti|Pearl/i.test(collection)) return 'Pearl styles'
  if (collection === 'Mangalsutra') return collection
  return 'Traditional'
}

const colourPattern = /(dark green|dark blue|rose gold|maroon|turquoise|purple|green|white|black|bronze|pink|blue|red|yellow|orange|rama|multi)(?![a-z])/gi

function toProduct(entry) {
  const category = categoryFor(entry.collection)
  const label = entry.sku.replace(/^([35])Line/i, (_, rows) => rows === '3' ? 'Three-Line' : 'Five-Line')
  const name = /necklace|mangalsutra/i.test(label) ? label : `${label} Necklace`
  const colours = [...new Set((label.match(colourPattern) || []).map(colour => colour.toLowerCase()))]
  const [description, styling] = styles[category === 'CZ necklaces' ? 'Stone designs' : category]
  const colourNote = colours.length === 1 && colours[0] !== 'multi'
    ? ` Repeat the ${colours[0]} tone in a small accessory or pair it with a neutral blouse.`
    : ''
  return { ...entry, name, category, description, styling: styling + colourNote, colour: colours.map(colour => colour[0].toUpperCase() + colour.slice(1)).join(' / ') }
}

const originalCoverRanks = {
  'three-line-green': 0,
  'pumpkin-blue': 1,
  'valadanda-maroon': 0,
  'short-ball-chain': 2,
  'cz-5469-maroon': 1,
}

export const products = [...featured, ...imported.map(toProduct)].map(product => {
  const listing = listingPhotos[product.id]
  const originals = product.photos.length ? product.photos : reviewedPhotos[product.id] ?? []
  return {
    ...product,
    category: product.id === 'cz-5469-maroon' ? 'CZ necklaces' : product.category,
    photos: listing ? [...listing, ...originals].slice(0, 4) : originals,
    coverRank: listing ? -1 : product.coverRank ?? originalCoverRanks[product.id] ?? 4,
    price: business.prices[product.id] ?? null,
  }
})


