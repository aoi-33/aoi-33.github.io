/*!
 * publications.js — rendering for the Publications list.
 * Single source of truth for how a publication from data/publications.json
 * looks. Loaded by index.html (live site) and admin.html (preview).
 * Reuses window.Activity helpers (escapeHtml / safeUrl / sortByDateDesc).
 *
 * Publication schema (data/publications.json — array; newest-first sorting is
 * automatic, so order in the file does not matter). Title/authors/venue are
 * single-language (the paper's own language); only the section heading and the
 * type badge are bilingual.
 *   {
 *     "id":     "stable-publication-id", // optional; matches entries[].publication_id
 *     "date":   "YYYY-MM-DD",
 *     "type":   "journal" | "international" | "domestic" | "poster" | "preprint" | "thesis",
 *     "authors":"Last F., Last F., …",  // self name is auto-bolded (see SELF_NAMES)
 *     "title":  "Paper title",
 *     "venue":  "Journal / conference name",
 *     "extra":  "Vol. 1, pp. 1–8",       // optional
 *     "url":    "https://doi.org/…"       // optional (DOI / PDF)
 *   }
 */
(function (global) {
    'use strict';

    const A = global.Activity; // shared helpers
    const escapeHtml = A.escapeHtml;
    const safeUrl = A.safeUrl;

    // Author names to highlight as "me" in the author list.
    const SELF_NAMES = ['佐々葵', 'Aoi Sassa'];

    const PUB_TYPE_META = {
        journal:       { cls: 'pub-journal',  ja: '論文誌',     en: 'Journal'       },
        international: { cls: 'pub-intl',     ja: '国際会議',   en: "Int'l Conf."   },
        domestic:      { cls: 'pub-domestic', ja: '国内会議',   en: 'Domestic Conf.'},
        poster:        { cls: 'pub-poster',   ja: 'ポスター',   en: 'Poster'        },
        preprint:      { cls: 'pub-preprint', ja: 'プレプリント', en: 'Preprint'    },
        thesis:        { cls: 'pub-thesis',   ja: '学位論文',   en: 'Thesis'        },
    };

    // Bold occurrences of the author's own name. Operates on already-escaped text.
    function highlightSelf(escapedAuthors) {
        let out = escapedAuthors;
        for (const name of SELF_NAMES) {
            const safe = escapeHtml(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            out = out.replace(new RegExp(safe, 'g'), m => `<strong>${m}</strong>`);
        }
        return out;
    }

    function awardIndicator(publication, entries) {
        const awards = publication.id
            ? entries.filter(entry => entry.type === 'award' && entry.publication_id === publication.id) : [];
        if (!awards.length) return '';
        const icon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8v6a4 4 0 0 1-8 0V3Z M8 5H4v2a4 4 0 0 0 4 4 M16 5h4v2a4 4 0 0 1-4 4 M12 13v5 M8 21h8 M10 18h4v3h-4z"/></svg>`;
        return `<details class="pub-awards"><summary>${icon}<span class="pub-award-count" aria-hidden="true">${awards.length}</span><span class="visually-hidden" data-ja="受賞情報（${awards.length}件）" data-en="Awards (${awards.length})">受賞情報（${awards.length}件）</span></summary>
            <div class="pub-awards-panel"><p class="pub-awards-label" data-ja="この論文・発表の受賞" data-en="Awards for this paper / presentation">この論文・発表の受賞</p><ul>${awards.map(award => {
                const images = Array.isArray(award.images)
                    ? award.images.filter(image => image && A.safeImageUrl(image.src)) : [];
                const gallery = images.length ? `<button type="button" class="entry-gallery-button" aria-haspopup="dialog" data-gallery="${escapeHtml(JSON.stringify(images))}" data-gallery-title-ja="${escapeHtml(award.prize_ja)}" data-gallery-title-en="${escapeHtml(award.prize_en)}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span class="visually-hidden" data-ja="賞状を見る" data-en="View certificate">賞状を見る</span></button>` : '';
                return `<li><span data-ja="${escapeHtml(escapeHtml(award.prize_ja))}" data-en="${escapeHtml(escapeHtml(award.prize_en))}">${escapeHtml(award.prize_ja)}</span>${gallery}</li>`;
            }).join('')}</ul></div></details>`;
    }

    function render(pubs, ul, entries = []) {
        ul = ul || document.getElementById('publication-list');
        if (!ul) return;
        ul.innerHTML = A.sortByDateDesc(pubs).map(p => {
            const meta = PUB_TYPE_META[p.type] || PUB_TYPE_META.domestic;
            const year = String(p.date || '').split('-')[0] || '';
            const title = escapeHtml(p.title || '');
            const url = safeUrl(p.url);
            const titleHtml = (p.url && url !== '#')
                ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${title}</a>`
                : title;
            const venueBits = [p.venue, p.extra].filter(Boolean).map(escapeHtml).join('. ');
            return `
                <li class="pub-item">
                    <span class="pub-year">${escapeHtml(year)}</span>
                    <span class="pub-badge ${meta.cls}" data-en="${escapeHtml(meta.en)}" data-ja="${escapeHtml(meta.ja)}">${escapeHtml(meta.ja)}</span>
                    <div class="pub-body">
                        <div class="pub-title">${titleHtml} ${awardIndicator(p, entries)}</div>
                        <p class="pub-authors">${highlightSelf(escapeHtml(p.authors || ''))}</p>
                        ${venueBits ? `<p class="pub-venue">${venueBits}</p>` : ''}
                    </div>
                </li>
            `;
        }).join('');
    }

    global.Publications = { PUB_TYPE_META, render };
})(window);
