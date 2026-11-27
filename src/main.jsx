import '@fontsource-variable/playfair-display/wght.css'
import '@fontsource-variable/dm-sans/wght.css'
import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { asset, business, products } from './catalog'
import { HeroMedia } from './hero'
import './styles.css'


const care = 'Wipe gently with a soft, dry cloth after wear. Keep away from water and perfume, and store separately in a dry pouch.'
const demo = import.meta.env.VITE_STOREFRONT_DEMO === 'true'
const exhibitionNotice = 'This collection is for viewing. Orders and payments are unavailable through this site.'
const ordering = demo ? exhibitionNotice : 'Share the item name and catalog reference by email. Ask for the current price, availability and delivery details before placing your order.'
const delivery = demo ? exhibitionNotice : 'Ask customer care to confirm shipping charges, delivery estimates and return or exchange terms before ordering.'
const priceFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const priceLabel = product => product.price == null ? 'Price on request' : priceFormat.format(product.price)
const info = {
  privacy: ['Privacy', 'PVG Horizon has no account or checkout forms. If you contact PVG Horizon by email, that service handles your message under its own privacy policy. Share only the details needed for your enquiry.'],
  terms: ['Order terms', demo ? exhibitionNotice : business.terms || 'Confirm the item, total price, delivery charges and any return or exchange terms with PVG Horizon before paying. Catalog listings are subject to availability.'],
  'how-to-order': ['How to order', ordering],
  delivery: ['Shipping and returns', demo ? exhibitionNotice : business.shippingAndReturns || delivery],
  care: ['Jewellery care', care],
  contact: ['Contact Us', 'Have a question about a necklace or the collection? Email PVG Horizon with your enquiry.'],
}

function Mark() {
  return <a className="brand" href="#/" aria-label="PVG Horizon home">
    <span className="brand-mark" aria-hidden="true"><i></i></span>
    <span>PVG HORIZON<small>IMITATION JEWELLERY</small></span>
  </a>
}

function EmailIcon() {
  return <svg className="email-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.65" />
    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" />
  </svg>
}

function EmailDialog({ dialogRef, subject = '', message = '' }) {
  function openEmail(event) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const subjectText = values.get('subject').trim()
    const bodyText = values.get('message').trim()
    const draft = new URL('https://mail.google.com/mail/')
    draft.search = new URLSearchParams({ view: 'cm', fs: '1', to: business.email, su: subjectText, body: bodyText }).toString()
    window.open(draft.href, '_blank', 'noopener,noreferrer')
  }

  return <dialog ref={dialogRef} className="lightbox enquiry-dialog" aria-label="Email enquiry">
    <form method="dialog" className="enquiry-close"><button>Close</button></form>
    <h2>Email us</h2>
    <p>Write your enquiry, then review and send it from your email account.</p>
    <form className="enquiry-form" onSubmit={openEmail}>
      <label>Subject<input name="subject" defaultValue={subject} required maxLength={160} /></label>
      <label>Message<textarea name="message" defaultValue={message} required rows={5} maxLength={1200} /></label>
      <button type="submit" className="button"><EmailIcon /> Open in Gmail</button>
    </form>
  </dialog>
}

function EmailLink({ className = '', children }) {
  const dialogRef = useRef(null)
  return <>
    <button type="button" className={`chat-link ${className}`} onClick={() => dialogRef.current.showModal()}
      aria-label={children ? undefined : 'Email PVG Horizon'} title="Email PVG Horizon"><EmailIcon />{children}</button>
    <EmailDialog dialogRef={dialogRef} />
  </>
}

function Order({ product }) {
  const [quantity, setQuantity] = useState(1)
  const preview = useRef(null)
  const subject = `Product enquiry: ${product.name}`
  const message = [
    'Hi PVG Horizon, I would like to enquire about:',
    product.name,
    `SKU: ${product.sku}`,
    `Quantity: ${quantity}`,
    '',
    'Could you share more information about this piece?',
  ].join('\r\n')

  return <div className="order-controls">
    <label>Quantity
      <select value={quantity} onChange={event => setQuantity(Number(event.target.value))}>
        {Array.from({ length: 10 }, (_, index) => index + 1).map(value => <option key={value}>{value}</option>)}
      </select>
    </label>
    <button type="button" className="button order" onClick={() => preview.current.showModal()}><EmailIcon /> Enquire by email</button>
    <EmailDialog key={quantity} dialogRef={preview} subject={subject} message={message} />
  </div>
}

function ContactLinks() {
  return <>
    
    {business.email && <a href={`mailto:${business.email}`}>{business.email}</a>}
    {business.location && <p>{business.location}</p>}
    <a href="#/info/contact">Contact Us</a>
  </>
}

function Footer() {
  return <footer><div className="wrap footer-grid">
    <div className="footer-brand"><Mark /></div><div className="footer-about"><h2>About PVG Horizon</h2><p>Indian imitation jewellery for festive dressing and everyday wear.</p></div>
    <details className="footer-section" open><summary>Customer care</summary><a href="#/info/how-to-order">How to order</a><a href="#/info/delivery">Shipping and returns</a><a href="#/info/care">Jewellery care</a></details>
    <details className="footer-section" open><summary>Contact</summary><ContactLinks /></details>
    <div className="copyright"><span>© {new Date().getFullYear()} PVG Horizon</span><nav aria-label="Business policies"><a href="#/info/privacy">Privacy</a><a href="#/info/terms">Terms</a></nav></div>
  </div></footer>
}


function CatalogImage({ photos, alt, className, eager = false }) {
  const [index, setIndex] = useState(0)
  const file = photos[index]
  if (!file) return <div className={`photo-unavailable ${className || ''}`}>Photo on request</div>

  return <img
    key={file}
    className={className}
    src={asset(file)}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    onError={() => setIndex(current => current === index ? current + 1 : current)}
  />
}

function ArchPhoto({ children }) {
  return <div className="card-arch"><div className="card-arch-inner">{children}</div></div>
}

function Grid({ entries, arched = false }) {
  return <div className={arched ? 'product-grid arch-grid' : 'product-grid'}>{entries.map((product, index) => <a className="card" key={product.id} href={`#/product/${product.id}`}>
    {arched ? <ArchPhoto>
      <CatalogImage photos={product.photos} alt={product.name} eager={index < 4} />
    </ArchPhoto> : <CatalogImage photos={product.photos} alt={product.name} eager={index < 4} />}
    <div className="card-copy"><span className="card-category">{product.category}</span><h3>{product.name}</h3><p className="card-price">{priceLabel(product)}</p><span className="card-link" aria-hidden="true">↗</span></div>
  </a>)}</div>
}

const czCollection = 'CZ necklaces'
const collectionNames = [czCollection, ...new Set(products.map(product => product.category).filter(category => category !== czCollection))]
const collectionDescriptions = {
  'CZ necklaces': 'Imitation necklaces with CZ designs, from simple rows to decorative drops.',
  Layered: 'Multi-row designs for open necklines and festive outfits.',
  Traditional: 'Necklaces to pair with sarees, festive kurtas and woven fabrics.',
  'Short necklaces': 'Styles that sit close to the neckline for everyday outfits.',
  'Stone designs': 'Imitation necklaces with decorative stone designs.',
  'Pearl styles': 'Pearl-inspired pieces for soft colours and delicate prints.',
  Mangalsutra: 'Imitation mangalsutra designs for daily wear and special occasions.',
}
const shopLink = category => category ? `#/shop/${encodeURIComponent(category)}` : '#/shop'

function Home() {
  const spotlight = products.find(product => product.id === 'catalog-cz-cz-6198')
  const featured = [
    ['catalog-cz-cz-2814', 'catalog-cz-cz-2814-2.jpg'],
    ['catalog-cz-cz-6644', 'catalog-cz-cz-6644-3.jpg'],
    ['catalog-cz-cz-5062-cz-5062-maroon', 'cz-5062-maroon-orange-stand.jpg'],
    ['catalog-cz-cz-5469-cz-5469-green', 'cz-5469-green-orange-stand.jpg'],
  ].flatMap(([id, cover]) => {
    const product = products.find(item => item.id === id)
    return product ? [{ ...product, photos: [cover, ...product.photos.filter(photo => photo !== cover)] }] : []
  })
  const czLink = shopLink(czCollection)
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Indian imitation jewellery</p>
        <h1>The CZ necklace collection</h1>
        <p className="hero-description">Explore CZ imitation necklaces for festive dressing and everyday wear.</p>
        <a className="button" href={czLink}>Explore CZ necklaces <span aria-hidden="true">↗</span></a>
      </div>
      <HeroMedia poster={asset(spotlight.photos[0])} posterAlt={spotlight.name} />
    </section>
    <section className="featured"><div className="wrap section">
      <div className="section-heading"><h2>Featured CZ necklaces</h2><a className="text-link" href={czLink}>View all CZ <span aria-hidden="true">↗</span></a></div>
      <Grid entries={featured} arched />
    </div></section>
    <section className="wrap section spotlight">
      <a className="spotlight-photo" href={`#/product/${spotlight.id}`}>
        <ArchPhoto><CatalogImage photos={spotlight.photos} alt={spotlight.name} /></ArchPhoto>
      </a>
      <div className="spotlight-copy">
        <p className="eyebrow">CZ necklace spotlight</p>
        <h2>{spotlight.name}</h2>
        <p>{spotlight.description}</p>
        <a className="text-link" href={`#/product/${spotlight.id}`}>View necklace <span aria-hidden="true">↗</span></a>
      </div>
    </section>
    <section className="wrap section about">
      <h2>About PVG Horizon</h2>
      <div><p>Explore Indian imitation jewellery for festive dressing and everyday wear.</p><a className="text-link" href="#/info/how-to-order">How to order <span aria-hidden="true">↗</span></a></div>
    </section>
  </>
}

function Shop({ category }) {
  const pageSize = 24
  const [count, setCount] = useState(pageSize)
  const [colour, setColour] = useState('')
  const active = collectionNames.find(name => encodeURIComponent(name) === category) || ''
  const collection = (active ? products.filter(product => product.category === active) : [...products])
    .sort((first, second) =>
      Number(second.category === czCollection) - Number(first.category === czCollection)
      || Number(Boolean(second.photos.length)) - Number(Boolean(first.photos.length))
      || first.coverRank - second.coverRank
    )
  const colours = [...new Set(collection.flatMap(product => product.colour?.split(' / ') || []).filter(Boolean))].sort()
  const visible = colour ? collection.filter(product => product.colour?.split(' / ').includes(colour)) : collection
  return <section className="wrap section shop">
    <div className="shop-heading"><p className="eyebrow">The necklace collection</p><h1>{active || 'Shop necklaces'}</h1><p className="shop-intro">{collectionDescriptions[active] || 'Explore imitation necklaces by style and colour.'}</p></div>
    <div className="shop-layout">
      <nav className="filters" aria-label="Necklace collections">
        <p>Collections</p>
        {['', ...collectionNames].map(name => <a key={name} href={shopLink(name)} aria-current={active === name ? 'page' : undefined}>{name || 'All necklaces'} <span>{name ? products.filter(product => product.category === name).length : products.length}</span></a>)}
      </nav>
      <div className="shop-results">
        <div className="shop-toolbar">
          <p className="results" aria-live="polite">Showing {Math.min(count, visible.length)} of {visible.length} necklaces</p>
          {colours.length > 1 && <label>Colour <select value={colour} onChange={event => { setColour(event.target.value); setCount(pageSize) }}>
            <option value="">All colours</option>
            {colours.map(name => <option key={name}>{name}</option>)}
          </select></label>}
        </div>
        <Grid entries={visible.slice(0, count)} arched={active === czCollection} />
        {count < visible.length && <div className="load-more"><button className="button" onClick={() => setCount(count + pageSize)}>Show more necklaces</button></div>}
      </div>
    </div>
  </section>
}

function Detail({ product }) {
  const [selected, setSelected] = useState(0)
  const lightbox = useRef(null)
  const photoCount = product.photos.length
  function movePhoto(direction) {
    setSelected(index => (index + direction + photoCount) % photoCount)
  }
  const otherProducts = products.filter(item => item.id !== product.id)
  const related = [
    ...otherProducts.filter(item => item.category === product.category),
    ...otherProducts.filter(item => item.category !== product.category),
  ].slice(0, 4)
  return <div className="wrap detail">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/shop">Shop</a><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
    <div className="detail-layout">
      <div className="gallery">{photoCount ? <>
        <button className="gallery-open" type="button" onClick={() => lightbox.current.showModal()} aria-label="Enlarge product photo">
          <img className="primary-image" src={asset(product.photos[selected])} alt={`${product.name}, photo ${selected + 1}`} />
          <span aria-hidden="true">{selected + 1} / {photoCount} · Enlarge ↗</span>
        </button>
        <dialog ref={lightbox} className="lightbox" aria-label="Enlarged product photo" onKeyDown={event => { if (event.key === 'ArrowLeft') movePhoto(-1); if (event.key === 'ArrowRight') movePhoto(1) }}>
          <form method="dialog"><button aria-label="Close photo">Close ×</button></form>
          <img src={asset(product.photos[selected])} alt={`${product.name}, photo ${selected + 1}`} loading="lazy" />
          {photoCount > 1 && <div className="lightbox-nav"><button type="button" onClick={() => movePhoto(-1)}>Previous</button><span aria-live="polite">{selected + 1} / {photoCount}</span><button type="button" onClick={() => movePhoto(1)}>Next</button></div>}
        </dialog>
        {product.photos.length > 1 && <div className="thumbnails">{product.photos.map((photo, index) => <button key={photo} aria-label={`Show photo ${index + 1}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={asset(photo)} alt="" /></button>)}</div>}
        </> : <div className="photo-unavailable">Ask for a product photo by email</div>}
      </div>
      <div className="detail-copy">
        <a className="eyebrow category-link" href={shopLink(product.category)}>{product.category}</a><h1>{product.name}</h1>
        <p className="sku">SKU {product.sku}</p>
        <p className="price">{priceLabel(product)}</p><div className="order-bar"><Order product={product} /></div>
        <section className="description"><h2>About this necklace</h2><p>{product.description}</p></section>
        <dl className="specs"><div><dt>Jewellery type</dt><dd>Imitation</dd></div><div><dt>Style</dt><dd>{product.category}</dd></div>{product.colour && <div><dt>Colour</dt><dd>{product.colour}</dd></div>}</dl>
        <div className="product-notes">
          <details open><summary>How to style it</summary><p>{product.styling}</p></details>
          <details><summary>Jewellery care</summary><p>{care}</p></details>
          <details><summary>Delivery and returns</summary><p>{demo ? exhibitionNotice : business.shippingAndReturns || delivery}</p><a className="text-link" href="#/info/delivery">Shipping and returns</a></details>
        </div>
      </div>
    </div>
    <section className="section related"><div className="section-heading"><h2>Explore more necklaces</h2><a className="text-link" href={shopLink(product.category)}>Shop this collection</a></div><Grid entries={related} /></section>
  </div>
}

function App() {
  const [menu, setMenu] = useState(false)
  const [route, setRoute] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const onRoute = () => { setMenu(false); setRoute(location.hash.slice(1) || '/'); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onRoute)
    return () => window.removeEventListener('hashchange', onRoute)
  }, [])
  const [, page, id] = route.split('/')
  const product = page === 'product' ? products.find(item => item.id === id) : null
  const entry = page === 'info' && Object.hasOwn(info, id) ? info[id] : null
  useEffect(() => {
    const pageTitle = product?.name || entry?.[0] || (page === 'shop' ? 'Shop Necklaces' : '')
    document.title = pageTitle ? `${pageTitle} | PVG Horizon` : 'PVG Horizon | Indian Imitation Jewellery'
  }, [page, product, entry])
  return <>
    <a className="skip" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main').focus() }}>Skip to content</a>
    <header><div className="wrap header-inner"><button type="button" className="menu-toggle" aria-expanded={menu} aria-controls="main-navigation" onClick={() => setMenu(!menu)}><span aria-hidden="true">☰</span><span className="sr-only">Menu</span></button><Mark /><EmailLink className="mobile-contact" /><nav id="main-navigation" data-open={menu} aria-label="Main navigation">
      <a onClick={() => setMenu(false)} href="#/" aria-current={!page ? 'page' : undefined}>Home</a><a onClick={() => setMenu(false)} href="#/shop" aria-current={page === 'shop' ? 'page' : undefined}>Shop</a><a href="#/info/contact" aria-current={id === 'contact' ? 'page' : undefined}>Contact Us</a>
      <EmailLink />
    </nav></div></header>
    <main id="main" tabIndex={-1}>
      {!page ? <Home /> : page === 'shop' ? <Shop key={id || "all"} category={id} /> : product ? <Detail key={product.id} product={product} /> : entry ? <section className="wrap section info"><h1>{entry[0]}</h1><p>{entry[1]}</p>{id === 'contact' && <div className="contact-links">{business.email && <><p>{business.email}</p><EmailLink className="button contact-action">Write an enquiry</EmailLink></>}{business.location && <p>{business.location}</p>}</div>}</section> : <section className="wrap section info"><h1>Page unavailable</h1><a href="#/shop">Back to shop</a></section>}
    </main>
    <Footer />
  </>
}

createRoot(document.getElementById('root')).render(<App />)





