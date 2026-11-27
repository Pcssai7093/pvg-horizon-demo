import React, { useRef } from 'react'
import { asset } from './catalog'
import { buildCartEnquiry, maxCartQuantity } from './cart'

export function CartPage({ items, onQuantity, EmailDialog }) {
  const dialog = useRef(null)
  const enquiry = buildCartEnquiry(items)
  return <section className="wrap section cart-page">
    <div className="section-heading"><h1>Your cart</h1><a className="text-link" href="#/shop">Continue browsing</a></div>
    {items.length ? <>
      <p className="cart-intro">Your selection is saved in this browser. Send one enquiry for all the pieces below.</p>
      <ul className="cart-items">{items.map(({ product, quantity }) =>
        <li className="cart-item" key={product.id}>
          <a href={`#/product/${product.id}`} className="cart-item-photo">{product.photos[0] && <img src={asset(product.photos[0])} alt={product.name} loading="lazy" />}</a>
          <div className="cart-item-copy">
            <h2><a href={`#/product/${product.id}`}>{product.name}</a></h2>
            <p className="sku">SKU {product.sku}</p>
          </div>
          <div className="cart-item-controls">
            <label>Quantity <input type="number" min="1" max={maxCartQuantity} step="1" inputMode="numeric"
              key={quantity} defaultValue={quantity}
              aria-label={`Quantity for ${product.name}`}
              onBlur={event => {
                const value = Number(event.target.value)
                if (Number.isInteger(value) && value > 0) onQuantity(product.id, value)
                event.target.value = Number.isInteger(value) && value > 0 ? Math.min(value, maxCartQuantity) : quantity
              }}
              onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }} /></label>
            <button type="button" className="cart-remove" aria-label={`Remove ${product.name}`} onClick={() => onQuantity(product.id, 0)}>Remove</button>
          </div>
        </li>
      )}</ul>
      <div className="cart-actions">
        <button type="button" className="button" onClick={() => dialog.current.showModal()}>Enquire about all items</button>
        <EmailDialog key={enquiry} dialogRef={dialog} subject="Jewellery enquiry | PVG Horizon" message={enquiry} />
      </div>
    </> : <div className="cart-empty"><p>Your cart is empty.</p><a className="button" href="#/shop">Browse necklaces</a></div>}
  </section>
}

export function AboutPage() {
  return <section className="wrap section about-page">
    <div className="about-page-intro">
      <div>
        <h1>About PVG Horizon</h1>
        <p>PVG Horizon brings together Indian imitation jewellery for festive dressing and everyday wear. Our necklace collection includes CZ designs, layered pieces, traditional styles and short chains.</p>
        <p>Explore each piece through its photos and styling notes. If something catches your eye, save it to your cart and send us an enquiry with the pieces you want to know more about.</p>
        <a className="text-link" href="#/info/contact">Contact Us</a>
      </div>
      <img src={asset('catalog-cz-cz-6198-2.jpg')} alt="CZ necklace displayed on an orange stand" />
    </div>
    <div className="about-styling">
      <h2>Find a necklace for your outfit</h2>
      <ul>
        <li><a href="#/shop/CZ%20necklaces">CZ necklaces</a><p>Pair a decorative CZ necklace with a plain saree or kurta so the details stand out.</p></li>
        <li><a href="#/shop/Layered">Layered necklaces</a><p>Choose an open neckline that gives each row room to show.</p></li>
        <li><a href="#/shop/Short%20necklaces">Short necklaces</a><p>Wear a short chain with a scoop-neck blouse or a simple kurta.</p></li>
      </ul>
    </div>
  </section>
}
