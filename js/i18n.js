/*!
 * i18n.js — bilingual (JA/EN) text toggle.
 * Elements with both `data-ja` and `data-en` attributes are swapped in place.
 * Persists the choice in localStorage. Exposes applyLang/toggleLang globally
 * so inline onclick handlers and other scripts can call them.
 */
const LANG_KEY = 'lang';
let currentLang = localStorage.getItem(LANG_KEY) || 'ja';

function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;

    const btn = document.getElementById('langToggle');
    if (btn) {
        btn.textContent = lang === 'ja' ? 'EN' : 'JP';
        btn.setAttribute('aria-label', lang === 'ja' ? 'Switch to English' : '日本語に切り替える');
    }

    document.querySelectorAll('[data-en][data-ja]').forEach(el => {
        el.innerHTML = el.getAttribute('data-' + lang);
    });
}

function toggleLang() {
    applyLang(currentLang === 'ja' ? 'en' : 'ja');
}

applyLang(currentLang);
