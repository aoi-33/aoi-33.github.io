/*!
 * activity.js — shared rendering for Activity & Awards.
 * Single source of truth for how an entry from data/entries.json looks.
 * Loaded by both index.html (live site) and admin.html (preview), so the
 * editor always shows exactly what will ship.
 *
 * Entry schema (data/entries.json — array; the site sorts by date
 * descending automatically, so order in the file does not matter):
 *   {
 *     "date": "YYYY-MM-DD",
 *     "type": "blog" | "poster" | "article" | "award",
 *     "url":  "https://..."  or  "#articleId" (opens a modal),
 *     "fallback_url": "https://web.archive.org/...",  // optional backup copy
 *     "use_fallback": "true",  // optional; set when "url" is dead to link the backup
 *     "images": [{ "src": "assets/img/entries/event/certificate.jpg", "caption_ja": "賞状", "caption_en": "Certificate" }], // optional
 *     // non-award entries:
 *     "title_ja", "title_en", "desc_ja", "desc_en"
 *     // award entries instead use:
 *     "prize_ja", "prize_en", "event_ja", "event_en",
 *     "org_ja",   "org_en",   "desc_ja",  "desc_en"
 *   }
 */
(function (global) {
    'use strict';

    const TYPE_META = {
        blog:    { cls: 'badge-blog',    ja: '研究室ブログ', en: 'Lab Blog' },
        poster:  { cls: 'badge-blog',    ja: 'ポスター発表', en: 'Poster'   },
        article: { cls: 'badge-article', ja: '記事',         en: 'Article'  },
        award:   { cls: 'badge-award',   ja: '受賞',         en: 'Award'    },
    };

    function escapeHtml(s) {
        return String(s ?? '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function safeUrl(url) {
        if (typeof url !== 'string') return '#';
        // Allow absolute http(s), in-page anchors, and root-relative paths — but NOT
        // protocol-relative URLs (//evil.com), which would be an open redirect.
        return /^(https?:\/\/|#|\/(?!\/))/.test(url) ? url : '#';
    }

    // Images are optional. Restrict local files to the public image directory.
    function safeImageUrl(value) {
        if (typeof value !== 'string') return '';
        if (/^https?:\/\//i.test(value)) {
            try {
                const url = new URL(value);
                return url.username || url.password ? '' : url.href;
            } catch { return ''; }
        }
        if (!/^\/?assets\/img\//.test(value) || /[\\?#]/.test(value)) return '';
        try {
            const url = new URL(value, location.href);
            const imageRoot = new URL('assets/img/', location.href);
            return url.origin === imageRoot.origin && url.pathname.startsWith(imageRoot.pathname) ? value : '';
        } catch { return ''; }
    }

    function galleryButton(entry) {
        const images = Array.isArray(entry.images)
            ? entry.images.filter(image => image && safeImageUrl(image.src)) : [];
        if (!images.length) return '';
        const titleJa = entry.type === 'award' ? entry.prize_ja : entry.title_ja;
        const titleEn = entry.type === 'award' ? entry.prize_en : entry.title_en;
        return `<button type="button" class="entry-gallery-button"
            data-gallery="${escapeHtml(JSON.stringify(images))}"
            data-gallery-title-ja="${escapeHtml(titleJa || titleEn || '')}"
            data-gallery-title-en="${escapeHtml(titleEn || titleJa || '')}"
            aria-haspopup="dialog">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <path d="m21 15-5-5L5 21"></path>
            </svg>
            <span class="visually-hidden" data-ja="写真・賞状を見る（${images.length}枚）"
                data-en="View photos &amp; certificates (${images.length})">写真・賞状を見る（${images.length}枚）</span>
        </button>`;
    }

    let gallery;
    function openGallery(button) {
        if (!gallery) {
            const dialog = document.createElement('dialog');
            dialog.className = 'entry-gallery';
            dialog.setAttribute('aria-labelledby', 'entry-gallery-title');
            dialog.innerHTML = `
                <header class="entry-gallery-header">
                    <h2 id="entry-gallery-title"></h2>
                    <button type="button" class="entry-gallery-close" autofocus></button>
                </header>
                <figure>
                    <img class="entry-gallery-image" alt="">
                    <figcaption aria-live="polite"></figcaption>
                </figure>
                <p class="entry-gallery-error" role="status" hidden></p>
                <nav class="entry-gallery-nav">
                    <button type="button" class="entry-gallery-prev"></button>
                    <span class="entry-gallery-count" aria-live="polite"></span>
                    <button type="button" class="entry-gallery-next"></button>
                </nav>`;
            document.body.append(dialog);
            gallery = { dialog, index: 0, images: [], trigger: null };
            dialog.querySelector('.entry-gallery-close').addEventListener('click', () => dialog.close());
            dialog.querySelector('.entry-gallery-prev').addEventListener('click', () => showGalleryImage(gallery.index - 1));
            dialog.querySelector('.entry-gallery-next').addEventListener('click', () => showGalleryImage(gallery.index + 1));
            dialog.addEventListener('keydown', event => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    showGalleryImage(gallery.index + (event.key === 'ArrowLeft' ? -1 : 1));
                }
            });
            dialog.addEventListener('close', () => {
                document.body.classList.remove('entry-gallery-open');
                dialog.querySelector('img').removeAttribute('src');
                gallery.trigger?.focus();
            });
        }
        const en = document.documentElement.lang === 'en';
        gallery.images = JSON.parse(button.dataset.gallery);
        gallery.index = 0;
        gallery.trigger = button;
        gallery.lang = en ? 'en' : 'ja';
        const dialog = gallery.dialog;
        dialog.querySelector('h2').textContent = button.dataset[en ? 'galleryTitleEn' : 'galleryTitleJa'];
        dialog.querySelector('.entry-gallery-close').textContent = en ? 'Close' : '閉じる';
        dialog.querySelector('.entry-gallery-prev').textContent = en ? '← Previous' : '← 前へ';
        dialog.querySelector('.entry-gallery-next').textContent = en ? 'Next →' : '次へ →';
        dialog.querySelector('nav').setAttribute('aria-label', en ? 'Image navigation' : '画像の切り替え');
        showGalleryImage(0);
        document.body.classList.add('entry-gallery-open');
        dialog.showModal();
    }

    function showGalleryImage(index) {
        if (index < 0 || index >= gallery.images.length) return;
        gallery.index = index;
        const image = gallery.images[index];
        const dialog = gallery.dialog;
        const img = dialog.querySelector('img');
        const caption = image['caption_' + gallery.lang] || image.caption_ja || image.caption_en || '';
        const error = dialog.querySelector('.entry-gallery-error');
        error.hidden = true;
        img.hidden = false;
        img.onerror = () => {
            img.hidden = true;
            error.textContent = gallery.lang === 'en' ? 'Unable to load this image.' : '画像を読み込めませんでした。';
            error.hidden = false;
        };
        img.alt = caption || (gallery.lang === 'en' ? `Photo or certificate ${index + 1}` : `写真・賞状 ${index + 1}`);
        img.src = safeImageUrl(image.src);
        dialog.querySelector('figcaption').textContent = caption;
        dialog.querySelector('.entry-gallery-count').textContent = `${index + 1} / ${gallery.images.length}`;
        dialog.querySelector('.entry-gallery-prev').disabled = index === 0;
        dialog.querySelector('.entry-gallery-next').disabled = index === gallery.images.length - 1;
        dialog.querySelector('nav').hidden = gallery.images.length === 1;
    }

    document.addEventListener('click', event => {
        const button = event.target.closest('.entry-gallery-button');
        if (button) openGallery(button);
    });

    // Link target for an entry: the original URL, or its backup copy once the
    // original is marked dead with use_fallback (switched by hand — a cross-origin
    // 404 cannot be detected reliably from the browser).
    function entryUrl(e) {
        const useFallback = (e.use_fallback === true || e.use_fallback === 'true') && e.fallback_url;
        return safeUrl(useFallback ? e.fallback_url : e.url);
    }

    // Sort newest-first by date string (YYYY-MM-DD sorts lexically).
    // Missing dates are treated as '' so undated items sort last (used by Products,
    // where a date is optional). Entries/publications always have a date.
    function sortByDateDesc(entries) {
        return [...entries].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    }

    function renderActivity(entries, ul) {
        ul = ul || document.getElementById('activity-list');
        if (!ul) return;
        ul.innerHTML = sortByDateDesc(entries).map(e => {
            const meta = TYPE_META[e.type] || TYPE_META.blog;
            const isAward = e.type === 'award';
            const titleJa = isAward ? `${e.event_ja ?? ''} ${e.prize_ja ?? ''}`.trim() : (e.title_ja || '');
            const titleEn = isAward ? `${e.event_en ?? ''} ${e.prize_en ?? ''}`.trim() : (e.title_en || '');
            const url = entryUrl(e);
            const isModal = url.startsWith('#');
            const linkAttrs = isModal
                ? `href="${escapeHtml(url)}" data-bs-toggle="modal" data-bs-target="${escapeHtml(url)}"`
                : `href="${escapeHtml(url)}" target="_blank" rel="noopener"`;
            return `
                <li class="activity-item">
                    <span class="activity-date">${escapeHtml(e.date)}</span>
                    <span class="activity-badge ${meta.cls}" data-en="${escapeHtml(meta.en)}" data-ja="${escapeHtml(meta.ja)}">${escapeHtml(meta.ja)}</span>
                    <div class="activity-body">
                        <p class="activity-title"><a ${linkAttrs} data-en="${escapeHtml(titleEn)}" data-ja="${escapeHtml(titleJa)}">${escapeHtml(titleJa)}</a> ${galleryButton(e)}</p>
                        <p class="activity-desc" data-en="${escapeHtml(e.desc_en || '')}" data-ja="${escapeHtml(e.desc_ja || '')}">${escapeHtml(e.desc_ja || '')}</p>
                    </div>
                </li>
            `;
        }).join('');
    }

    function renderAwards(entries, container) {
        container = container || document.getElementById('awards-list');
        if (!container) return;
        const awards = sortByDateDesc(entries.filter(e => e.type === 'award'));
        container.innerHTML = awards.map(e => {
            const year = (e.date || '').split('-')[0] || '';
            const url = entryUrl(e);
            const linkJa = `<a class="text-white" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(e.event_ja)}</a>`;
            const linkEn = `<a class="text-white" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(e.event_en)}</a>`;
            const titleJa = `${escapeHtml(e.prize_ja)} &mdash; ${linkJa}`;
            const titleEn = `${escapeHtml(e.prize_en)} &mdash; ${linkEn}`;
            const metaJa = `${escapeHtml(e.org_ja)} &mdash; ${escapeHtml(year)}`;
            const metaEn = `${escapeHtml(e.org_en || e.org_ja)} &mdash; ${escapeHtml(year)}`;
            return `
                <div class="mb-4">
                    <h5 class="fw-bold mb-1"><span data-en='${titleEn}' data-ja='${titleJa}'>${titleJa}</span> ${galleryButton(e)}</h5>
                    <p class="mb-0 award-meta" data-en='${metaEn}' data-ja='${metaJa}'>${metaJa}</p>
                </div>
            `;
        }).join('');
    }

    global.Activity = { safeImageUrl, TYPE_META, escapeHtml, safeUrl, entryUrl, sortByDateDesc, renderActivity, renderAwards };
})(window);
