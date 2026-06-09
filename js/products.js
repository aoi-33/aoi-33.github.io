/*!
 * products.js — rendering for the Products card grid.
 * Single source of truth for how a product from data/products.json looks.
 * Loaded by index.html (live site) and admin.html (preview).
 * Reuses window.Activity helpers (escapeHtml / safeUrl / sortByDateDesc).
 *
 * Product schema (data/products.json — array; newest-first by optional date):
 *   {
 *     "name":  "Project name",        // required
 *     "desc":  "Short description",   // optional (single language)
 *     "url":   "https://…",           // optional — "Demo" link / live site
 *     "repo":  "https://github.com/…",// optional — "Code" link
 *     "image": "assets/img/products/x.png" or "https://…", // optional thumbnail
 *     "tags":  "React, Go, Azure",    // optional — comma-separated
 *     "date":  "YYYY-MM-DD"           // optional — used only for ordering
 *   }
 * Cards with no image show an accent header with a globe icon.
 */
(function (global) {
    'use strict';

    const A = global.Activity;
    const esc = A.escapeHtml;
    const safeUrl = A.safeUrl;

    function tagList(tags) {
        if (Array.isArray(tags)) return tags;
        if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
        return [];
    }

    function linkButton(url, iconClass, label) {
        const safe = safeUrl(url);
        if (!url || safe === '#') return '';
        return `<a class="product-link" href="${esc(safe)}" target="_blank" rel="noopener"><i class="${iconClass}" aria-hidden="true"></i> ${esc(label)}</a>`;
    }

    function render(products, el) {
        el = el || document.getElementById('products-list');
        if (!el) return;
        el.innerHTML = A.sortByDateDesc(products).map(p => {
            const name = esc(p.name || '');
            // img src: relative paths are allowed (escaped for the attribute);
            // javascript: in an <img src> does not execute, so escaping is sufficient.
            const img = typeof p.image === 'string' ? p.image.trim() : '';
            const thumb = img
                ? `<div class="product-thumb"><img src="${esc(img)}" alt="${name}" loading="lazy" /></div>`
                : `<div class="product-thumb product-thumb-fallback" aria-hidden="true"><i class="fas fa-globe"></i></div>`;
            const tags = tagList(p.tags).map(t => `<span class="product-tag">${esc(t)}</span>`).join('');
            const demo = linkButton(p.url, 'fas fa-arrow-up-right-from-square', 'Demo');
            const repo = linkButton(p.repo, 'fab fa-github', 'Code');
            return `
                <div class="col-12 col-sm-6 col-lg-4">
                    <article class="product-card">
                        ${thumb}
                        <div class="product-card-body">
                            <h3 class="product-name">${name}</h3>
                            ${p.desc ? `<p class="product-desc">${esc(p.desc)}</p>` : ''}
                            ${tags ? `<div class="product-tags">${tags}</div>` : ''}
                            ${(demo || repo) ? `<div class="product-links">${demo}${repo}</div>` : ''}
                        </div>
                    </article>
                </div>
            `;
        }).join('');
    }

    global.Products = { render };
})(window);
