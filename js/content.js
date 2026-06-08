/*!
 * content.js — index page bootstrap.
 * Fetches data/entries.json and data/history.json, then renders the
 * Activity, Awards (via activity.js) and Career timeline sections.
 * Requires: activity.js (window.Activity), i18n.js (applyLang/currentLang).
 *
 * history.json schema (data/history.json — array):
 *   { "date": "YYYY-MM", "label_ja", "label_en", "venue_ja", "venue_en" }
 * Entries within ~6 months are auto-merged onto one timeline dot.
 */
(function () {
    'use strict';

    const escapeHtml = window.Activity.escapeHtml;

    function renderCareer(history) {
        const el = document.getElementById('career-timeline');
        if (!el || !history.length) return;
        const toMs = d => {
            const [y, m] = String(d).split('-').map(Number);
            return new Date(y, (m || 1) - 1, 1).getTime();
        };
        const sorted = [...history].sort((a, b) => toMs(a.date) - toMs(b.date));

        // Auto-merge entries within ~6 months (e.g., graduation + enrollment)
        const MERGE_MS = 6 * 30 * 24 * 60 * 60 * 1000;
        const groups = [];
        for (const entry of sorted) {
            const tail = groups[groups.length - 1];
            if (tail && toMs(entry.date) - toMs(tail[tail.length - 1].date) <= MERGE_MS) {
                tail.push(entry);
            } else {
                groups.push([entry]);
            }
        }
        el.style.setProperty('--n', groups.length);

        const renderEntry = h => {
            const hasVenue = h.venue_ja || h.venue_en;
            const venue = hasVenue
                ? `<span class="career-venue" data-en="${escapeHtml(h.venue_en || h.venue_ja)}" data-ja="${escapeHtml(h.venue_ja || h.venue_en)}">${escapeHtml(h.venue_ja || h.venue_en)}</span>`
                : '';
            return `
                <span class="career-date">${escapeHtml(h.date)}</span>
                <span class="career-label" data-en="${escapeHtml(h.label_en)}" data-ja="${escapeHtml(h.label_ja)}">${escapeHtml(h.label_ja)}</span>
                ${venue}
            `;
        };

        el.innerHTML = groups.map(group => {
            const above = group.length > 1 ? group.slice(0, -1).map(renderEntry).join('') : '';
            const below = renderEntry(group[group.length - 1]);
            return `
                <div class="career-milestone">
                    <div class="career-caption above">${above}</div>
                    <span class="career-dot" aria-hidden="true"></span>
                    <div class="career-caption below">${below}</div>
                </div>
            `;
        }).join('');
    }

    (async function loadAll() {
        try {
            const [entriesRes, historyRes, pubsRes] = await Promise.all([
                fetch('data/entries.json', { cache: 'no-cache' }),
                fetch('data/history.json', { cache: 'no-cache' }),
                fetch('data/publications.json', { cache: 'no-cache' }),
            ]);
            if (entriesRes.ok) {
                const entries = await entriesRes.json();
                window.Activity.renderActivity(entries);
                window.Activity.renderAwards(entries);
            } else {
                console.error('[entries] HTTP', entriesRes.status);
            }
            if (pubsRes.ok) {
                const pubs = await pubsRes.json();
                window.Publications.render(pubs);
            } else {
                console.error('[publications] HTTP', pubsRes.status);
            }
            if (historyRes.ok) {
                const history = await historyRes.json();
                renderCareer(history);
            } else {
                console.error('[history] HTTP', historyRes.status);
            }
            if (typeof applyLang === 'function' && typeof currentLang !== 'undefined') {
                applyLang(currentLang);
            }
            const spy = window.bootstrap && bootstrap.ScrollSpy.getInstance(document.body);
            if (spy) spy.refresh();
        } catch (err) {
            console.error('[data] load failed:', err);
        }
    })();
})();
