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

    function render(pubs, ul) {
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
                        <p class="pub-title">${titleHtml}</p>
                        <p class="pub-authors">${highlightSelf(escapeHtml(p.authors || ''))}</p>
                        ${venueBits ? `<p class="pub-venue">${venueBits}</p>` : ''}
                    </div>
                </li>
            `;
        }).join('');
    }

    global.Publications = { PUB_TYPE_META, render };
})(window);
