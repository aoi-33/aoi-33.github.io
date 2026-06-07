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
        return /^(https?:\/\/|#|\/)/.test(url) ? url : '#';
    }

    // Sort newest-first by date string (YYYY-MM-DD sorts lexically).
    function sortByDateDesc(entries) {
        return [...entries].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    }

    function renderActivity(entries, ul) {
        ul = ul || document.getElementById('activity-list');
        if (!ul) return;
        ul.innerHTML = sortByDateDesc(entries).map(e => {
            const meta = TYPE_META[e.type] || TYPE_META.blog;
            const isAward = e.type === 'award';
            const titleJa = isAward ? `${e.event_ja ?? ''} ${e.prize_ja ?? ''}`.trim() : (e.title_ja || '');
            const titleEn = isAward ? `${e.event_en ?? ''} ${e.prize_en ?? ''}`.trim() : (e.title_en || '');
            const url = safeUrl(e.url);
            const isModal = url.startsWith('#');
            const linkAttrs = isModal
                ? `href="${escapeHtml(url)}" data-bs-toggle="modal" data-bs-target="${escapeHtml(url)}"`
                : `href="${escapeHtml(url)}" target="_blank" rel="noopener"`;
            return `
                <li class="activity-item">
                    <span class="activity-date">${escapeHtml(e.date)}</span>
                    <span class="activity-badge ${meta.cls}" data-en="${escapeHtml(meta.en)}" data-ja="${escapeHtml(meta.ja)}">${escapeHtml(meta.ja)}</span>
                    <div class="activity-body">
                        <p class="activity-title"><a ${linkAttrs} data-en="${escapeHtml(titleEn)}" data-ja="${escapeHtml(titleJa)}">${escapeHtml(titleJa)}</a></p>
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
            const url = safeUrl(e.url);
            const linkJa = `<a class="text-white" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(e.event_ja)}</a>`;
            const linkEn = `<a class="text-white" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(e.event_en)}</a>`;
            const titleJa = `${escapeHtml(e.prize_ja)} &mdash; ${linkJa}`;
            const titleEn = `${escapeHtml(e.prize_en)} &mdash; ${linkEn}`;
            const metaJa = `${escapeHtml(e.org_ja)} &mdash; ${escapeHtml(year)}`;
            const metaEn = `${escapeHtml(e.org_en || e.org_ja)} &mdash; ${escapeHtml(year)}`;
            return `
                <div class="mb-4">
                    <h5 class="fw-bold mb-1" data-en='${titleEn}' data-ja='${titleJa}'>${titleJa}</h5>
                    <p class="mb-0 award-meta" data-en='${metaEn}' data-ja='${metaJa}'>${metaJa}</p>
                </div>
            `;
        }).join('');
    }

    global.Activity = { TYPE_META, escapeHtml, safeUrl, sortByDateDesc, renderActivity, renderAwards };
})(window);
