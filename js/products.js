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
 *     "tags":  "React, Go, Azure",    // optional — comma-separated
 *     "date":  "YYYY-MM-DD"           // optional — used only for ordering
 *   }
 * Image-free editorial cards: title (links to demo/repo) + description + tags + links.
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
            // Title links to the demo, or the repo if there is no demo.
            const primary = safeUrl(p.url) !== '#' ? safeUrl(p.url)
                          : (safeUrl(p.repo) !== '#' ? safeUrl(p.repo) : '');
            const title = primary
                ? `<a href="${esc(primary)}" target="_blank" rel="noopener">${name}</a>`
                : name;
            const tags = tagList(p.tags).map(t => `<span class="product-tag">${esc(t)}</span>`).join('');
            const demo = linkButton(p.url, 'fas fa-arrow-up-right-from-square', 'Demo');
            const repo = linkButton(p.repo, 'fab fa-github', 'Code');
            return `
                <div class="col-12 col-sm-6 col-lg-4">
                    <article class="product-card">
                        <h3 class="product-name">${title}</h3>
                        ${p.desc ? `<p class="product-desc">${esc(p.desc)}</p>` : ''}
                        ${tags ? `<div class="product-tags">${tags}</div>` : ''}
                        ${(demo || repo) ? `<div class="product-links">${demo}${repo}</div>` : ''}
                    </article>
                </div>
            `;
        }).join('');
    }

    global.Products = { render };
})(window);
