import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';

const url = process.argv[2] || 'http://127.0.0.1:5500/';
const errors = [];
const ignoredErrors = [];
const preflightActions = [];
const startClicks = [];
const overlayDismissals = [];

const defaultChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = process.env.PLAYWRIGHT_CHROME_PATH ||
    (existsSync(defaultChromePath) ? defaultChromePath : undefined);

function isIgnoredConsoleError(message) {
    const location = message.location();
    return message.type() === 'error' &&
        location.url &&
        location.url.endsWith('/favicon.ico') &&
        message.text().includes('Failed to load resource');
}

async function collectPageSnapshot(page) {
    return await page.evaluate(() => {
        function isVisible(el) {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.visibility !== 'hidden' &&
                style.display !== 'none' &&
                rect.width > 0 &&
                rect.height > 0;
        }

        function cssPath(el) {
            if (el.id) return `#${CSS.escape(el.id)}`;
            const parts = [];
            let node = el;
            while (node && node.nodeType === Node.ELEMENT_NODE && node !== document.body) {
                const tag = node.tagName.toLowerCase();
                const parent = node.parentElement;
                if (!parent) break;
                const siblings = Array.from(parent.children).filter(child => child.tagName === node.tagName);
                const index = siblings.indexOf(node) + 1;
                parts.unshift(`${tag}:nth-of-type(${index})`);
                node = parent;
            }
            return `body > ${parts.join(' > ')}`;
        }

        function info(el) {
            return {
                selector: cssPath(el),
                tag: el.tagName.toLowerCase(),
                text: (el.innerText || el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 160),
                id: el.id || '',
                className: typeof el.className === 'string' ? el.className : '',
                disabled: !!el.disabled,
            };
        }

        const clickableSelector = [
            'button',
            'a[href]',
            '[onclick]',
            '[role="button"]',
            'input[type="button"]',
            'input[type="submit"]'
        ].join(',');

        const buttons = Array.from(document.querySelectorAll('button'))
            .filter(isVisible)
            .map(info);

        const clickables = Array.from(document.querySelectorAll(clickableSelector))
            .filter(isVisible)
            .map(info)
            .slice(0, 80);

        const mainText = (document.body.innerText || '')
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .slice(0, 40);

        return { buttons, clickables, mainText };
    });
}

async function findStartCandidate(page) {
    return await page.evaluate(() => {
        const keywords = [
            '\u958b\u59cb\u904a\u6232',
            '\u958b\u59cb\u5192\u96aa',
            'Start Game',
            'Start Adventure',
            'Play',
            'Start',
        ];

        function isVisible(el) {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.visibility !== 'hidden' &&
                style.display !== 'none' &&
                rect.width > 0 &&
                rect.height > 0;
        }

        function cssPath(el) {
            if (el.id) return `#${CSS.escape(el.id)}`;
            const parts = [];
            let node = el;
            while (node && node.nodeType === Node.ELEMENT_NODE && node !== document.body) {
                const tag = node.tagName.toLowerCase();
                const parent = node.parentElement;
                if (!parent) break;
                const siblings = Array.from(parent.children).filter(child => child.tagName === node.tagName);
                const index = siblings.indexOf(node) + 1;
                parts.unshift(`${tag}:nth-of-type(${index})`);
                node = parent;
            }
            return `body > ${parts.join(' > ')}`;
        }

        const candidates = Array.from(document.querySelectorAll([
            'button',
            'a[href]',
            '[onclick]',
            '[role="button"]',
            'input[type="button"]',
            'input[type="submit"]'
        ].join(','))).filter(isVisible);

        for (const el of candidates) {
            if (el.disabled) continue;
            const text = [
                el.innerText,
                el.textContent,
                el.value,
                el.getAttribute('aria-label'),
                el.title,
            ].filter(Boolean).join(' ').trim();
            if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
                return {
                    selector: cssPath(el),
                    text: text.replace(/\s+/g, ' ').slice(0, 160),
                    tag: el.tagName.toLowerCase(),
                };
            }
        }

        return null;
    });
}

async function findDismissCandidate(page) {
    return await page.evaluate(() => {
        const keywords = ['\u2715', '\u00d7', '\u95dc\u9589', 'Close', 'Skip', '\u8df3\u904e'];

        function isVisible(el) {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.visibility !== 'hidden' &&
                style.display !== 'none' &&
                rect.width > 0 &&
                rect.height > 0;
        }

        function cssPath(el) {
            if (el.id) return `#${CSS.escape(el.id)}`;
            const parts = [];
            let node = el;
            while (node && node.nodeType === Node.ELEMENT_NODE && node !== document.body) {
                const tag = node.tagName.toLowerCase();
                const parent = node.parentElement;
                if (!parent) break;
                const siblings = Array.from(parent.children).filter(child => child.tagName === node.tagName);
                const index = siblings.indexOf(node) + 1;
                parts.unshift(`${tag}:nth-of-type(${index})`);
                node = parent;
            }
            return `body > ${parts.join(' > ')}`;
        }

        const candidates = Array.from(document.querySelectorAll('button,[onclick],[role="button"]'))
            .filter(isVisible);

        for (const el of candidates) {
            if (el.disabled) continue;
            const text = [
                el.innerText,
                el.textContent,
                el.value,
                el.getAttribute('aria-label'),
                el.title,
            ].filter(Boolean).join(' ').trim();
            if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
                return {
                    selector: cssPath(el),
                    text: text.replace(/\s+/g, ' ').slice(0, 160),
                    tag: el.tagName.toLowerCase(),
                };
            }
        }

        return null;
    });
}

async function dismissSplashIfPresent(page) {
    const splash = page.locator('#splash-screen');
    if (await splash.count() === 0) return null;
    if (!await splash.isVisible().catch(() => false)) return null;

    const info = await splash.evaluate(el => ({
        selector: '#splash-screen',
        text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 160),
        tag: el.tagName.toLowerCase(),
    }));
    await splash.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    return info;
}

const browser = await chromium.launch({ headless: true, executablePath });
const page = await browser.newPage();

page.on('console', message => {
    if (message.type() !== 'error') return;
    const entry = {
        type: 'console.error',
        text: message.text(),
        location: message.location(),
    };
    if (isIgnoredConsoleError(message)) {
        ignoredErrors.push(entry);
    } else {
        errors.push(entry);
    }
});

page.on('pageerror', error => {
    errors.push({
        type: 'pageerror',
        text: error.message,
        stack: error.stack,
    });
});

await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('body', { timeout: 10000 });
await page.waitForTimeout(1000);

const splashDismissal = await dismissSplashIfPresent(page);
if (splashDismissal) {
    preflightActions.push({ type: 'dismissSplash', ...splashDismissal });
}

const beforeClick = await collectPageSnapshot(page);

for (let i = 0; i < 4; i++) {
    const loopSplashDismissal = await dismissSplashIfPresent(page);
    if (loopSplashDismissal) {
        preflightActions.push({ type: 'dismissSplash', ...loopSplashDismissal });
        continue;
    }

    const dismissCandidate = await findDismissCandidate(page);
    if (dismissCandidate) {
        await page.locator(dismissCandidate.selector).click({ timeout: 5000 });
        overlayDismissals.push(dismissCandidate);
        await page.waitForTimeout(700);
        continue;
    }

    const candidate = await findStartCandidate(page);
    if (candidate) {
        await page.locator(candidate.selector).click({ timeout: 5000 });
        startClicks.push(candidate);
        await page.waitForTimeout(700);
        continue;
    }
    break;
}

await page.waitForTimeout(1500);
const afterClick = await collectPageSnapshot(page);
await browser.close();

console.log(JSON.stringify({
    url,
    ignoredErrorCount: ignoredErrors.length,
    errorCount: errors.length,
    preflightActions,
    overlayDismissals,
    startClicks,
    beforeClick,
    afterClick,
    errors,
    ignoredErrors,
}, null, 2));

if (errors.length > 0) {
    process.exitCode = 1;
}
