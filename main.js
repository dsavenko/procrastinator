
'use strict'

const GITHUB_URL = 'https://github.com/dsavenko/procrastinator/issues'
const CONTACT_MAIL = 'ds@dsavenko.com'

const GOOGLE_API_KEY = 'AIzaSyDlb5UaSg22xKTTTbRu8vW97WO7z3BOtpk'
const GOOGLE_CLIENT_ID = '1078139606-9nh42gv73t49sm2qj3c2dutritjho4oo.apps.googleusercontent.com'
const GOOGLE_DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.appfolder'

const POCKET_KEY = '84212-47555ab748057882b1c8516f'
const POCKET_REDIRECT_HASH = '#pocket-redirect'

const CORS_PROXY = 'https://proc-cors-eu.herokuapp.com/'
const CATEGORIES = ['general', 'business', 'science', 'tech', 'games', 'fun']
const CATEGORIES_RU = {
    general: [
        {name: 'Lenta', on: true, url: 'https://lenta.ru/rss'},
        {name: 'Meduza', on: true, url: 'https://meduza.io/rss/all'},
    ],
    business: [
        {name: 'Газета.Ru: бизнес', on: true, url: 'https://www.gazeta.ru/export/rss/business.xml'},
        {name: 'Рамблер: финансы', on: true, url: 'https://finance.rambler.ru/rss/business/latest/?limit=100'},
        {name: 'Коммерсантъ: бизнес', on: true, url: 'https://www.kommersant.ru/RSS/section-business.xml'},
    ],
    science: [
        {name: 'NakedSci', on: true, url: 'https://naked-science.ru/feedrss.xml'},
        {name: 'XX2 ВЕК', on: true, url: 'https://22century.ru/feed'},
    ],
    tech: [
        {name: 'Habr', on: true, url: 'https://habr.com/ru/rss/best/daily/'},
        {name: 'iXBT', on: true, url: 'https://www.ixbt.com/export/news.rss'},
        {name: 'Компьютерра', on: true, url: 'https://www.computerra.ru/feed/'},
    ],
    games: [
        {name: 'Stopgame', on: true, url: 'https://rss.stopgame.ru/rss_news.xml'},
        {name: 'Игромания', on: true, url: 'https://www.igromania.ru/rss/news.rss'},
    ],
    fun: [
        {name: 'AdMe', on: true, url: 'https://www.adme.ru/rss/'},
        {name: 'Fishki.net', on: true, url: 'https://fishki.net/rss/'},
        {name: 'Панорама', on: true, url: 'https://panorama.pub/feed'},
    ]
}
const CATEGORIES_EN = {
    general: [
        {name: 'CNN', on: true, url: 'http://rss.cnn.com/rss/edition.rss'},
        {name: 'NYT', on: true, url: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'},
        {name: 'RT', on: true, url: 'https://www.rt.com/rss/'},
    ],
    business: [
        {name: 'BBC: business', on: true, url: 'http://feeds.bbci.co.uk/news/business/rss.xml'},
        {name: 'CNN: business', on: true, url: 'http://rss.cnn.com/rss/money_topstories.rss'},
        {name: 'RT: business', on: true, url: 'https://www.rt.com/rss/business/'},
    ],
    science: [
        {name: 'ScienceNews', on: true, url: 'https://www.sciencenews.org/feeds/headlines.rss'},
        {name: 'ScienceAlert', on: true, url: 'http://feeds.feedburner.com/sciencealert-latestnews?format=xml'},
        {name: 'ScienceDaily', on: true, url: 'https://www.sciencedaily.com/rss/top/science.xml'},
    ],
    tech: [
        {name: 'Engadget', on: true, url: 'https://www.engadget.com/rss.xml'},
        {name: 'TechCrunch', on: true, url: 'http://feeds.feedburner.com/TechCrunch/'},
    ],
    games: [
        {name: 'GameSpot', on: true, url: 'https://www.gamespot.com/feeds/game-news/'},
        {name: 'Destructoid', on: true, url: 'https://www.destructoid.com/?mode=atom'},
    ],
    fun: [
        {name: 'Onion', on: true, url: 'https://www.theonion.com/rss'},
        {name: 'BoredPanda', on: true, url: 'https://www.boredpanda.com/feed/'},
        {name: 'Cheezburger', on: true, url: 'https://www.cheezburger.com/rss'},
    ]
}

const BASIC_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'br', 'i', 'em', 'b', 'strong', 
    'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'hr', 'code', 'del', 'pre', 's', 'u', 'small', 'sub', 'sup', 'img', 
    'audio', 'video', 'source', 'a', 'table', 'th', 'tr', 'td', 'thead', 'tbody', 'tfoot', 'div', 'span',
    'article', 'details', 'figcaption', 'figure', 'footer', 'header', 'main', 'mark', 'section', 'summary', 
    'time', 'wbr', 'font', 'center', 'cite']

const EXTENDED_TAG_SELECTOR = BASIC_TAGS.reduce(function(ret, t) {
        return ret + ':not(' + t + ')'
    }, '')

const DEFAULT_CONFIG = {welcomeShown: false}
const DUMMY_URL = 'dummy'
const MAX_STORAGE_LEN = 10000
const SUPPORTED_LOCALES = ['en', 'ru']
const MAX_NAME_LEN = 20
const CONFIG_STORAGE_KEY = 'config'
const SOURCES_STORAGE_KEY = 'sources'
const CACHE_STORAGE_KEY = 'cache'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

const SYNC_PERIOD = 5 * MINUTE
const AFK_PERIOD = 30 * MINUTE
const MIN_ALERT_INTERVAL = 2 * HOUR

const MAX_ENTRIES_PER_SOURCE = 20
const CHARSET_RGX = /charset=([^()<>@,;:\"/[\]?.=\s]*)/i
const RSS_MARKER_RGX = /<\s*rss /i

const ENTRY_URL_PARAM = 'e'
const ENTRY_URL_DELIM = '|'

const virtualDocument = document.implementation.createHTMLDocument('virtual')

let entries = []
let previousEntry
let currentEntry = {}
let currentEntrySetTime = new Date()
let showFirst = null
let sources = []
let delMode = false
let loadingSources = []
let config = Object.assign({}, DEFAULT_CONFIG)
let sourcesSyncTimeoutId
let sourceAlertDate = {}

function nothingEntry() {
    return {
        title: $.i18n('nothing-entry-title'),
        html: $.i18n('nothing-entry-html'),
        rebuild: nothingEntry,
        checkAgain: true
    }
}

function loadingEntry() {
    return {
        title: $.i18n('loading-entry-title'),
        rebuild: loadingEntry
    }
}

function welcomeEntry() {
    return {
        title: $.i18n('welcome-entry-title'),
        html: $.i18n('welcome-entry-html', $.i18n('more-btn'), GITHUB_URL, CONTACT_MAIL),
        url: DUMMY_URL,
        rebuild: welcomeEntry
    }
}

function shownHash(entry) {
    return `shown-${encodeURIComponent(entry.url)}`
}

async function prom(gapiCall, argObj) {
    return new Promise((resolve, reject) => {
        gapiCall(argObj).then(resp => {
            if (resp && (resp.status < 200 || resp.status > 299)) {
                console.log('GAPI call returned bad status (call, args, response):', gapiCall, argObj, resp)
                gaw('call_bad_status', 'google')
                reject(resp)
            } else {
                resolve(resp)
            }
        }, err => {
            console.log('GAPI call failed (call, args, response):', gapiCall, argObj, err)
            gaw('call_error', 'google')
            reject(err)
        })
    })
}

async function createEmptyFile(name, mimeType) {
    const resp = await prom(gapi.client.drive.files.create, {
        resource: {name: name, mimeType: mimeType || 'text/plain', parents: ['appDataFolder']},
        fields: 'id'
    })
    return resp.result.id
}

async function upload(fileId, content) {
    return prom(gapi.client.request, {
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: {uploadType: 'media'},
        body: typeof content === 'string' ? content : JSON.stringify(content)
    })
}

async function download(fileId) {
    const resp = await prom(gapi.client.drive.files.get, {fileId: fileId, alt: 'media'})
    return resp.result
}

function rememberShown(entry) {
    try {
        ensureStorageLength()
        const name = shownHash(entry)
        localStorage.setItem(name, '')
        if (isLoggedIn()) {
            createEmptyFile(name)
        }
    } catch(e) {
        console.log(`Failed to remember entry ${entry.url}`, e)
    }
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function findSource(name) {
    return sources.find(s => s.name === name)
}

function isSourceOn(name) {
    const source = findSource(name)
    return source && source.on
}

function extractRssLink(html) {
    const newDoc = new DOMParser().parseFromString(html, 'text/html')
    return $(newDoc).find('link[type="application/rss+xml"]').attr('href')
}

function findString(obj) {
    if (!obj) {
        return ''
    }
    if (typeof obj === 'string') {
        return obj
    }
    return findString(obj._)
}

function extractItemString(item, fieldName) {
    let ret = item[fieldName]
    if (typeof ret === 'string') {
        return ret
    }
    //console.log(`Got non-string ${fieldName} in item, trying to recover`, item)
    return ret && typeof ret._ === 'string' ? ret._ : ''
}

function extractCharset(contentType) {
    return contentType && CHARSET_RGX.test(contentType) ? CHARSET_RGX.exec(contentType)[1].toLowerCase() : 'utf-8'
}

async function getFetchedText(resp) {
    if ('TextDecoder' in window) {
        const charset = extractCharset(resp.headers.get('content-type') || '')
        const arrayBuffer = await resp.arrayBuffer()
        return new TextDecoder(charset).decode(arrayBuffer)
    } else {
        // hope it's in UTF, nothing we can do
        return await resp.text()
    }
}

async function loadRssSource(name, url) {
    const parser = new RSSParser({
        customFields: {
            item: ['media:group', 'media:content', 'media:thumbnail']
        }
    })
    let resp = await fetch(CORS_PROXY + url)
    if (!resp.ok) {
        throw new Error(`Error response from server: ${resp.statusText}`)
    }
    const contentType = (resp.headers.get('content-type') || '').toLowerCase()
    let text = await getFetchedText(resp)
    if (contentType.includes('text/html')) {
        const rssLink = extractRssLink(text)
        if (rssLink) {
            console.log(`found RSS link for ${name}: ${rssLink}`)
            resp = await fetch(CORS_PROXY + rssLink)
            if (!resp.ok) {
                throw new Error(`Failed to load RSS from ${rssLink}, error response from server: ${resp.status} ${resp.statusText}`)
            }
            text = await getFetchedText(resp)
        } else if (!RSS_MARKER_RGX.test(text)) {
            // trying to deal with the fact some websites return RSS with text/html content type
            throw new Error(`RSS link not found for ${name}`)
        }
    }
    const feed = await parser.parseString(text)
    return feed.items.map(e => {
        let imageUrl = (e.enclosure || {}).url
        if (!imageUrl && e['media:content']) { 
            imageUrl = (e['media:content'].$ || {}).url
        }
        if (!imageUrl && e['media:thumbnail']) { 
            imageUrl = (e['media:thumbnail'].$ || {}).url
        }
        if (!imageUrl && e['media:group']) {
            const mediaContent = e['media:group']['media:content']
            if (mediaContent && 0 <= mediaContent.length) {
                imageUrl = (mediaContent[0].$ || {}).url
            }
        }
        const title = extractItemString(e, 'title')
        const content = extractItemString(e, 'content') || extractItemString(e, 'content:encoded')
        return {
            htmlTitle: title,
            htmlText: content,
            imageUrl: imageUrl,
            url: e.link,
            sourceName: name,
            author: e.author
        }
    }).filter(e => (e.htmlTitle || '').trim() || (e.htmlText || '').trim())
}

function isShown(entry) {
    return null != localStorage.getItem(shownHash(entry))
}

function filterEntries(newEntries) {
    return newEntries.filter(e => isSourceOn(e.sourceName) && !isShown(e))
}

async function syncShown(newEntries) {
    if (0 >= newEntries.length || !isLoggedIn()) {
        return
    }

    async function syncStep(stepEntries) {
        const query = stepEntries.map(e => `name = '${shownHash(e)}'`).reduce((a, c) => `${a} or ${c}`)
        try {
            const resp = await prom(gapi.client.drive.files.list, {
                spaces: 'appDataFolder',
                fields: 'files(name)',
                pageSize: 500,
                q: query
            })
            resp.result.files.forEach(f => localStorage.setItem(f.name, ''))
        } catch (err) {
            console.log('Error fetching from Google for entries', stepEntries, err)
        }
    }

    const count = 30
    for (let i = 0; i < newEntries.length; i += count) {
        await syncStep(newEntries.slice(i, i + count))
    }
}

function htmlDecode(value) {
    let str = value || ''
    const tmpDom = $('<div>', virtualDocument).append($.parseHTML(str))
    // set line breaks before P and BR
    tmpDom.find('p, li').before(virtualDocument.createTextNode('\n\n'))
    tmpDom.find('br').before(virtualDocument.createTextNode('\n'))
    // remove tags
    str = tmpDom.text()
    // get rid of more than 2 line breaks
    str = str.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, '\n\n')
    // get rid of more than 2 spaces
    str = str.replace(/ +(?= )/g,'')
    return str
}

function sanitizeHtml(value) {
    let str = value || ''
    const tmpDom = $('<div>', virtualDocument).append($.parseHTML(str))
    tmpDom.find(EXTENDED_TAG_SELECTOR).remove()
    tmpDom.find('h1, h2, h3').replaceWith(function() { return '<h3>' + $(this).html() + '</h3>' })
    return tmpDom.html()
}

function decodeEntry(e) {
    if (!e.title) {
        e.title = htmlDecode(e.htmlTitle || '')
    }
    if (!e.html) {
        e.html = sanitizeHtml(e.htmlText || '')
    }
}

async function addEntries(sourceName, newEntries) {
    removeSourceEntries(sourceName)
    if (!isSourceOn(sourceName)) {
        return
    }
    let showFirstEntry = showFirst ? newEntries.find(e => e.url === showFirst.url) : null
    // filter before syncing to sync less
    let filteredEntries = filterEntries(newEntries)
    await syncShown(filteredEntries)
    // filter again after syncing, and crop
    filteredEntries = filterEntries(filteredEntries).slice(0, MAX_ENTRIES_PER_SOURCE)
    if (showFirstEntry) {
        filteredEntries.push(showFirstEntry)
    }
    const old = entries.length
    entries = entries.concat(filteredEntries)
    shuffle(entries)
    console.log(`Added ${entries.length - old} new ${sourceName} entries (out of ${newEntries.length}), total number of entries: ${entries.length}`)
}

function removeA(arr) {
    let what, a = arguments, L = a.length, ax
    while (L > 1 && arr.length) {
        what = a[--L]
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1)
        }
    }
    return arr
}

function loadSource(source) {
    if (source && isSourceOn(source.name) && !loadingSources.includes(source.name)) {
        loadingSources.push(source.name)
        loadFirstEntry()
        loadRssSource(source.name, source.url)
            .then(newEntries => addEntries(source.name, newEntries))
            .catch(e => {
                console.log(`Failed to load ${source.name}`, e)
                const prevAlertDate = sourceAlertDate[source.name]
                const now = new Date()
                if (!prevAlertDate || now - prevAlertDate > MIN_ALERT_INTERVAL) {
                    sourceAlertDate[source.name] = now
                    procAlert('loading-failed-alert', source.name)
                }
            })
            .then(() => {
                removeA(loadingSources, source.name)
                loadFirstEntry()
            })
    } else {
        loadFirstEntry()
    }
}

function loadEntries() {
    removeStaleEntries()
    if (sources.find(s => s.on)) {
        sources.forEach(s => loadSource(s))
    } else {
        loadFirstEntry()
    }
}

function isRealUrl(url) {
    return url && url !== DUMMY_URL
}

function hidePocketBut() {
    $(pocketBut).addClass('invisible')
}

function entryOnClick(e) {
    const href = $(this).attr('href')
    if (isRealUrl(href)) {
        e.preventDefault()
        e.stopPropagation()
        window.open(href, '_blank')
    }
}

function commonPrefixPos(s1, s2) {
    const len = Math.min(s1.length, s2.length)
    let ret = 0
    while (ret < len && s1.charAt(ret) === s2.charAt(ret)) {
        ++ret
    }
    return ret
}

function setEntry(e, noPrevious, noCache) {
    clearAllAlerts()
    e = e || {}
    decodeEntry(e)
    titleCont.innerText = e.title || ''
    $(imageCont).empty()
    if (e.html) {
        textCont.innerHTML = e.html
        $(textCont).find('a').attr('target', '_blank').on('click', entryOnClick)
    } else {
        textCont.innerText = (e.text || '').trim()
    }
    const images = $(textCont).find('img')
    let imageSrc = e.imageUrl
    if (0 < images.length) {
        imageSrc = images.attr('src')
        images.filter(function() { return $(this).attr('src') === imageSrc }).remove()
    }
    if (isRealUrl(imageSrc)) {
        $(imageCont).append($('<img/>').attr('src', imageSrc))
    }
    let srcTitle = e.sourceName || ''
    if (e.author) {
        srcTitle = `${e.author} (${srcTitle})`
    }
    sourceTitle.innerText = srcTitle
    if (textCont.offsetHeight <= textContSizeChecker.offsetHeight) {
        // single-line text -> make it centered
        $(textCont).addClass('center')
    } else {
        $(textCont).removeClass('center')
    }
    entryBut.dataset.url = e.url || ''
    entryBut.scrollTop = 0
    if (isRealUrl(e.url)) {
        rememberShown(e)
    }
    if (noPrevious) {
        previousEntry = null
        $(previousBut).addClass('invisible')
    } else if (isRealUrl(currentEntry.url)) {
        previousEntry = currentEntry
        $(previousBut).removeClass('invisible')
    }
    $(moreBut).text($.i18n(e.checkAgain ? 'check-again-btn' : 'more-btn'))
    currentEntry = e
    const now = new Date()
    if (now - currentEntrySetTime > AFK_PERIOD) {
        // the user was AFK for a long time, we should refresh entries
        setTimeout(loadEntries, 0)
    }
    currentEntrySetTime = now
    if (isRealUrl(currentEntry.url)) {
        $(pocketBut).removeClass('invisible')
    } else {
        hidePocketBut()
    }
    const source = findSource(currentEntry.sourceName)
    if (source && isRealUrl(currentEntry.url)) {
        const newLoc = new URL(window.location.href)
        const i = commonPrefixPos(source.url, currentEntry.url)
        const param = source.url.substring(0, i) + ENTRY_URL_DELIM + source.url.substring(i) +
            ENTRY_URL_DELIM + currentEntry.url.substring(i)
        newLoc.searchParams.set(ENTRY_URL_PARAM, param)
        history.replaceState('', document.title, window.location.pathname + newLoc.search)
    }
    if (!noCache && isRealUrl(currentEntry.url)) {
        setTimeout(() => saveCache())
    }
}

function pickEntry() {
    if (showFirst) {
        const source = showFirst.source
        const ind = entries.findIndex(e => e.url === showFirst.url)
        if (-1 < ind) {
            showFirst = null
            return entries.splice(ind, 1)[0]
        } else if (loadingSources.includes(source.name)) {
            return loadingEntry()
        } else {
            // last resort: redirect the user to the link itself
            window.open(showFirst.url, '_self')
            return loadingEntry()
        }
    }
    if (0 >= entries.length) {
        return 0 >= loadingSources.length ? nothingEntry() : loadingEntry()
    } else {
        return entries.shift()
    }
}

function onLogoButClick() {
    hideSettings()
    setEntry(welcomeEntry())
    gaw('show_welcome')
}

function onPreviousButClick() {
    if (previousEntry) {
        gaw('previous')
        if (currentEntry) {
            entries.unshift(currentEntry)
        }
        setEntry(previousEntry, true)
        hideSettings()
    }
}

function onMoreButClick() {
    gaw('more')
    if (currentEntry.checkAgain) {
        loadEntries()
    } else {
        setEntry(pickEntry())
    }
    hideSettings()
}

function loadFirstEntry() {
    if (!currentEntry.url) {
        setEntry(pickEntry())
    }
}

function onEntryButClick() {
    const url = entryBut.dataset.url
    if (isRealUrl(url)) {
        window.open(url, '_blank')
        gaw('entry')
    }
}

function isSettingsShown() {
    return $(settingsBut).hasClass('enabled')
}

function toggleSettings() {
    if (!$(addCont).hasClass('hidden')) {
        toggleAddCont()
    }
    $('.lang-cont').toggleClass('hidden')
    $('.gear-menu').toggleClass('hidden')
    $(settingsBut).toggleClass('enabled')
}

function hideSettings() {
    if (isSettingsShown()) {
        toggleSettings()
    }
}

function onSettingsButClick() {
    toggleSettings()
    if (isSettingsShown()) {
        gaw('settings')
    }
}

function getImgSrc(source) {
    return delMode ? 'trash.svg' : (source.on ? 'checked.svg' : 'unchecked.svg')
}

function syncSourcesUI() {
    $(settingsCont).empty()
    sources.forEach(source => {
        const sourceDiv = $('<div/>')
        sourceDiv.addClass('flex middle toggle')
        sourceDiv.attr('data-name', source.name)
        sourceDiv.append(`<img class="checkbox" src="${getImgSrc(source)}"> ${source.name}`)
        sourceDiv.click(onToggleButClick)
        $(settingsCont).append(sourceDiv)
    })
}

function removeSourceEntries(sourceName) {
    entries = entries.filter(e => e.sourceName !== sourceName)
}

function removeStaleEntries() {
    entries = entries.filter(e => {
        const s = findSource(e.sourceName)
        return s && s.on
    })
}

function onToggleButClick() {
    const name = $(this).data('name')
    const source = findSource(name)
    if (source) {
        if (delMode) {
            if (confirm($.i18n('delete-confirm', source.name))) {
                const index = sources.findIndex(s => s.name === source.name)
                if (-1 < index) {
                    sources.splice(index, 1)
                    entries = filterEntries(entries)
                    saveSources()
                    gaw('delete_source')
                    syncSourcesUI()
                }
            }
            return
        }
        source.on = !source.on
        if (source.on) {
            if (!currentEntry.url) {
                setEntry(loadingEntry())
            }
            loadSource(source)
        } else {
            removeSourceEntries(name)
        }
        saveSources()
        gaw('toggle_source')
        $(this).find('img').attr('src', getImgSrc(source))
    } else {
        console.log(`${name} source not found`)
    }
}

function save(key, value, noOkLog) {
    try {
        ensureStorageLength()
        const path = `${key}.json`
        localStorage.setItem(path, JSON.stringify(value))
        if (!noOkLog) {
            console.log(`Saved ${key}`)
        }
    } catch(e) {
        console.log(`Failed to save ${key}`, e)
    }
}

function load(key) {
    const path = `${key}.json`
    const data = localStorage.getItem(path)
    return data ? JSON.parse(data) : null
}

async function saveSources() {
    save(SOURCES_STORAGE_KEY, sources)
    if (isLoggedIn() && config.sourcesId) {
        return upload(config.sourcesId, sources)
    }    
}

function saveConfig() {
    save(CONFIG_STORAGE_KEY, config)
}

function saveCache() {
    const cache = {entries: entries}
    if (currentEntry && isRealUrl(currentEntry.url)) {
        cache.currentEntry = currentEntry
    }
    save(CACHE_STORAGE_KEY, cache, true)
}

function loadCache() {
    const cache = load(CACHE_STORAGE_KEY)
    if (cache) {
        if (cache.entries) {
            entries = cache.entries
        }
        if (cache.currentEntry) {
            entries.unshift(cache.currentEntry)
        }
    }
}

function generateSourceName(sourceUrl) {
    let name = new URL(sourceUrl).hostname
    if (name) {
        name = name.charAt(0).toUpperCase() + name.slice(1)
    } else {
        name = $.i18n('unnamed-source-name')
    }
    let ret = name
    let i = 1
    while (findSource(ret)) {
        ret = `${name}-${i++}`
    }
    return ret
}

function loadEntryFromLocation() {
    const loc = new URL(window.location.href)
    const tmp = (loc.searchParams.get(ENTRY_URL_PARAM) || '').split(ENTRY_URL_DELIM)
    if (3 > tmp.length) {
        return
    }
    const sourceUrl = tmp[0] + tmp[1]
    const entryUrl = tmp[0] + tmp[2]
    if (sourceUrl && entryUrl) {
        if (currentEntry && currentEntry.url === entryUrl) {
            return
        }
        const ind = entries.findIndex(e => e.url === entryUrl)
        if (-1 < ind) {
            setEntry(entries[ind], true, true)
            entries.splice(ind, 1)
            return
        }
        setEntry(loadingEntry())
        let source = sources.find(s => s.url === sourceUrl)
        if (source) {
            source.on = true
        } else {
            source = {name: generateSourceName(sourceUrl), on: true, url: sourceUrl}
            sources.push(source)
        }
        saveSources()
        syncSourcesUI()
        showFirst = {url: entryUrl, source: source}
        loadSource(source)
    }
}

function ensureStorageLength() {
    if (MAX_STORAGE_LEN <= localStorage.length) {
        console.log(`Storage length is too high (${localStorage.length}), clearing storage`)
        gaw('clean_storage', 'background')
        const storedConfig = load(CONFIG_STORAGE_KEY)
        const storedSources = load(SOURCES_STORAGE_KEY)
        localStorage.clear()
        if (null != storedConfig) {
            save(CONFIG_STORAGE_KEY, storedConfig)
        }
        if (null != storedSources) {
            save(SOURCES_STORAGE_KEY, storedSources)
        }
    }
}

async function syncSourcesId() {
    if (!isLoggedIn() || config.sourcesId) {
        return
    }
    const sourcesName = SOURCES_STORAGE_KEY + '.json'
    try {
        let resp = await prom(gapi.client.drive.files.list, {
            spaces: 'appDataFolder',
            fields: 'files(id, name)',
            pageSize: 500,
            q: `name = '${sourcesName}'`,
            orderBy: 'createdTime'
        })
        if (0 < resp.result.files.length) {
            config.sourcesId = resp.result.files[0].id
        } else {
            config.sourcesId = await createEmptyFile(sourcesName, 'application/json')
            saveSources()
        }
        saveConfig()
    } catch(e) {
        console.log('Error fetching config IDs from Google', e)
    }
}

function showLangDialog() {
    return new Promise((resolve, reject) => {
        function chooseLoc(loc) {
            setLocale(loc)
            $(chooseLang).remove()
            resolve()
        } 
        chooseEnglishBut.onclick = () => chooseLoc('en')
        chooseRussianBut.onclick = () => chooseLoc('ru')
        $(chooseLang).removeClass('hidden')
    })
}

async function loadConfig() {
    config = load(CONFIG_STORAGE_KEY) || Object.assign({}, DEFAULT_CONFIG)
    if (!config.locale || !SUPPORTED_LOCALES.includes(config.locale)) {
        await showLangDialog()
    }
    $.i18n().locale = config.locale
    syncLangBut()
    console.log('Set locale', $.i18n().locale)
    if (!config.welcomeShown) {
        setEntry(welcomeEntry())
        config.welcomeShown = true
        saveConfig()
    }
}

function isSourcesEqual(s1, s2) {
    return s1 && s2 && s1.name === s2.name && s1.on === s2.on && s1.url === s2.url
}

async function downloadRemoteSources(doNotRestore) {
    if (isLoggedIn() && config.sourcesId) {
        try {
            sources = (await download(config.sourcesId)) || sources
            save(SOURCES_STORAGE_KEY, sources)
        } catch(e) {
            console.log('Failed to download sources', e)
            if (e.status === 404 && !doNotRestore) {
                console.log('Source file is lost, trying to restore')
                delete config.sourcesId
                saveConfig()
                await syncSourcesId()
                await downloadRemoteSources(true)
                saveSources()
            }
        }
    }
}

async function loadSources() {    
    sources = load(SOURCES_STORAGE_KEY)
    if (!sources) {
        sources = getDefaultSources()
        saveSources()
    }
}

function isSourcesEqual(sources1, sources2) {
    if (sources1.length != sources2.length) {
        return false
    }
    for (let i = 0; i < sources1.length; ++i) {
        const s1 = sources1[i]
        const s2 = sources2[i]
        if (s1.name !== s2.name || s1.on !== s2.on || s1.url !== s2.url) {
            return false
        }
    }
    return true
}

async function syncSources() {
    if (isLoggedIn()) {
        await syncSourcesId()
        const oldSources = sources
        await downloadRemoteSources()
        if (!isSourcesEqual(oldSources, sources)) {
            console.log('Sources changed, reloading')
            syncSourcesUI()
            loadEntries()
        }
    }
}

function scheduleSourcesSync(delay) {
    if (sourcesSyncTimeoutId) {
        clearTimeout(sourcesSyncTimeoutId)
    }
    sourcesSyncTimeoutId = setTimeout(() => {
        console.log('Starting periodic sources sync')
        syncSources()
            .catch(e => console.log('Periodic sources sync failed', e))
            .then(() => scheduleSourcesSync())
    }, typeof delay === 'undefined' ? SYNC_PERIOD : delay)
}

function addSource() {
    const newName = nameInput.value
    if (0 >= newName.length) {
        procAlert('no-name-alert')
        return
    }
    if (MAX_NAME_LEN < newName.length) {
        procAlert('name-too-long-alert')
        return
    }
    if (findSource(newName)) {
        procAlert('name-exists-alert')
        return
    }
    const newUrl = urlInput.value
    if (0 >= newUrl.length) {
        procAlert('no-rss-addr-alert')
        return
    }
    const existingSource = sources.find(s => s.url === newUrl)
    if (existingSource) {
        procAlert('rss-addr-exists-alert', existingSource.name)
        return
    }
    const newSource = {name: newName, on: true, url: newUrl}
    sources.push(newSource)
    loadSource(newSource)
    saveSources()
    gaw('add_custom_source')
    syncSourcesUI()
    toggleAddCont()
}

function showCategoryDialog(showCancel) {
    return new Promise((resolve, reject) => {
        const ret = [].concat(CATEGORIES)
        
        function catClick() {
            const catDiv = $(this)
            const name = catDiv.attr('data-category')
            const newOn = !ret.includes(name)
            if (newOn) {
                ret.push(name)
            } else {
                removeA(ret, name)
            }
            catDiv.find('img').attr('src', newOn ? 'checked.svg' : 'unchecked.svg')
        }

        function doResolve(result) {
            $(chooseCategories).addClass('hidden')
            resolve(result)
        }

        $(chooseCategories).empty()
        $(chooseCategories).append($('<div/>').text($.i18n('category-dialog-title')))
        const catDivCont = $('<div/>').addClass('flex evenly column start overflow')
        CATEGORIES.forEach(name => {
            const catDiv = $('<div/>').attr('data-category', name).addClass('pointer')
            catDiv.append(`<img class="checkbox" src="checked.svg"> ${$.i18n('category-' + name)}`)
            catDiv.click(catClick)
            $(catDivCont).append(catDiv)
        })
        const tmp = $('<div/>').addClass('flex stretch grow')
            .append($('<div/>').addClass('grow'))
            .append(catDivCont)
            .append($('<div/>').addClass('grow'))
        $(chooseCategories).append(tmp)
        const okDiv = $('<div/>').addClass('pointer').text($.i18n('ok-btn'))
        okDiv.click(() => {
            if (0 >= ret.length) {
                alert($.i18n('category-dialog-nothing-chosen-alert'))
            } else {
                doResolve(ret)
            }
        })
        $(chooseCategories).append(okDiv)
        if (showCancel) {
            const cancelDiv = $('<div/>').addClass('pointer').text($.i18n('cancel-btn'))
            cancelDiv.click(() => doResolve(false))
            $(chooseCategories).append(cancelDiv)
        }
        $(chooseCategories).removeClass('hidden')
    })
}

async function getUserPreferredSources(showCancel) {
    const catsOn = await showCategoryDialog(showCancel)
    const cats = $.i18n().locale.startsWith('ru') ? CATEGORIES_RU : CATEGORIES_EN
    return catsOn.reduce((acc, name) => acc.concat(cats[name]), [])
}

function getDefaultSources() {
    const cats = $.i18n().locale.startsWith('ru') ? CATEGORIES_RU : CATEGORIES_EN
    return CATEGORIES.reduce((acc, name) => acc.concat(cats[name]), [])
}

async function doResetSources() {
    sources = await getUserPreferredSources(true)
    delMode = false
    saveSources()
    gaw('reset_sources')
    syncSourcesUI()
    entries = []
    setEntry(loadingEntry())
    loadEntries()
}

function resetSources() {
    if (confirm($.i18n('reset-confirm'))) {
        doResetSources().catch(e => console.log('Failed to reset sources', e))
    }
}

function toggleDelMode() {
    delMode = !delMode
    $(deleteBut).toggleClass('enabled')
    syncSourcesUI()
}

function toggleAddCont() {
    $(showAddBut).toggleClass('enabled')
    $(addCont).toggleClass('hidden')
}

function applyLocale() {
    $('html').i18n()
    syncLogInBut()
    if (currentEntry.rebuild) {
        setEntry(currentEntry.rebuild(), true, true)
    }
}

function syncLangBut() {
    if ($.i18n().locale.startsWith('ru')) {
        $('.lang-cont').text('En')
    } else {
        $('.lang-cont').text('Ру')
    }
}

function isGapiLoaded() {
    return gapi && gapi.auth2
}

function isLoggedIn() {
    return isGapiLoaded() && gapi.auth2.getAuthInstance().isSignedIn.get()
}

function syncLogInBut() {
    if (isGapiLoaded()) {
        if (isLoggedIn()) {
            $(googleBut).text($.i18n('google-logout'))
        } else {
            $(googleBut).text($.i18n('google-login'))
        }
    } else {
        $(googleBut).text('. . .')
    }
}

function setLocale(newLoc) {
    $.i18n().locale = newLoc
    syncLangBut()
    config.locale = newLoc
    saveConfig()
    gaw(newLoc, 'locale')
}

function onLangButClick() {
    const newLoc = $.i18n().locale.startsWith('ru') ? 'en' : 'ru'
    setLocale(newLoc)
    applyLocale()
}

function hideSplash() {
    $(splash).addClass('hidden')
}

function onGoogleButClick() {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        if (confirm($.i18n('google-logout-confirm'))) {
            gapi.auth2.getAuthInstance().signOut()
            gaw('sign_out', 'google')
        }
    } else {
        gapi.auth2.getAuthInstance().signIn()
        gaw('sign_in', 'google')
    }
}

function getPocketRedirectUri() {
    const ret = new URL(location.href)
    ret.hash = POCKET_REDIRECT_HASH
    return ret.toString()
}

async function pocketRequest(endpoint, params, expectedReturn) {
    if (!endpoint.startsWith('/')) {
        endpoint = '/' + endpoint
    }
    const pocketUrl = 'https://getpocket.com/v3' + endpoint
    const resp = await fetch(CORS_PROXY + pocketUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        body: new URLSearchParams(params)
    })
    if (!resp.ok) {
        throw new Error(`Error response from ${pocketUrl}: ${resp.statusText}`)
    }
    if (expectedReturn && 0 < expectedReturn.length) {
        const respText = await resp.text()
        const returnParams = new URLSearchParams(respText)
        let ret = {}
        expectedReturn.forEach(k => {
            const v = returnParams.get(k)
            if (!v) {
                throw new Error(`Pocket call ${endpoint} didn't return ${k}. It returned: ${respText}`)
            }
            ret[k] = v
        })
        return ret
    }
}

async function addToPocket() {
    if (!currentEntry || !isRealUrl(currentEntry.url)) {
        return
    }
    if (!config.pocketCode) {
        const ret = await pocketRequest('oauth/request', {
            consumer_key: POCKET_KEY,
            redirect_uri: getPocketRedirectUri()
        }, ['code'])
        config.pocketCode = ret.code
        saveConfig()
    }
    if (!config.pocketAccessRequested) {
        config.pocketAccessRequested = true
        saveConfig()
        const loginUrl = 'https://getpocket.com/auth/authorize?request_token=' +
            encodeURIComponent(config.pocketCode) +
            '&redirect_uri=' + encodeURIComponent(getPocketRedirectUri())
        location = loginUrl
        return false
    }
    if (!config.pocketAccessToken) {
        const ret = await pocketRequest('oauth/authorize', {
            consumer_key: POCKET_KEY,
            code: config.pocketCode
        }, ['access_token', 'username'])
        config.pocketAccessToken = ret.access_token
        config.pocketUsername = ret.username
        saveConfig()
        gaw('sign_in', 'pocket')
    }
    await pocketRequest('add', {
        consumer_key: POCKET_KEY,
        access_token: config.pocketAccessToken,
        url: currentEntry.url,
        title: currentEntry.title || ''
    })
    gaw('add', 'pocket')
    return true
}

function clearPocketData() {
    delete config.pocketCode
    delete config.pocketAccessRequested
    delete config.pocketAccessToken
    delete config.pocketUsername
    saveConfig()
}

function onPocketButClick() {
    hideSettings()
    hidePocketBut()
    addToPocket()
        .then(isAdded => {
            if (isAdded) {
                procAlert('added-to-pocket-alert')
            }
        })
        .catch(e => {
            console.log('Failed to log into Pocket', e)
            clearPocketData()
            if (confirm($.i18n('failed-to-add-to-pocket-confirm'))) {
                setTimeout(() => onPocketButClick())
            }
        })
}

function removeHash () { 
    history.replaceState('', document.title, window.location.pathname + window.location.search)
}

function gaw(action, category) {
    if (typeof ga !== 'undefined') {
        try {
            const tracker = ga.getAll()[0]
            if (tracker) {
                tracker.send('event', category || 'general', action)
            } else {
                console.log('No GA tracker found')
            }
        } catch(e) {
            console.log('GA call failed', e)
        }
    }
}

function clearAllAlerts() {
    $('.alert-cont').remove()
}

function removeNode() {
    $(this).remove()
}

function procAlert(msgKey, param) {
    const alertCont = $('.alert-cont-prototype').clone().addClass('alert-cont')
    alertCont.find('.alert').text($.i18n(msgKey, param))
    alertCont.click(removeNode)
    alertCont.insertAfter('#entryBut')
    alertCont.removeClass('alert-cont-prototype hidden')
}

function scrollEntry(y, isAbsoluteValue) {
    if (isAbsoluteValue) {
        const normY = 0 <= y ? y : entryBut.scrollHeight
        entryBut.scrollTo(0, normY)
    } else {
        entryBut.scrollTop += y
    }
}

function scrollEntryPage(n) {
    const pageY = entryBut.clientHeight - 20
    scrollEntry(pageY * n)
}

function isActiveInput() {
    return document.activeElement && $(document.activeElement).is('input, textarea')
}

function registerKeyboardEvents() {
    document.addEventListener('keyup', e => {
        if (isActiveInput()) {
            return
        }
        switch (e.which) {
            case 8:
                onPreviousButClick()
                break
            case 13:
                onEntryButClick()
                break
            case 32:
                onMoreButClick()
                break
        }
    })
    document.addEventListener('keydown', e => {
        if (isActiveInput()) {
            return
        }
        switch (e.which) {
            case 33:
                scrollEntryPage(-1)
                break
            case 34:
                scrollEntryPage(1)
                break
            case 38:
                if (e.metaKey) {
                    scrollEntry(0, true)
                } else if (e.altKey) {
                    scrollEntryPage(-1)
                } else {
                    scrollEntry(-50)
                }
                break
            case 40:
                if (e.metaKey) {
                    scrollEntry(-1, true)
                } else if (e.altKey) {
                    scrollEntryPage(1)
                } else {
                    scrollEntry(50)
                }
                break
        }
    })
}

async function initApp(args) {
    logoBut.onclick = onLogoButClick
    moreBut.onclick = onMoreButClick
    previousBut.onclick = onPreviousButClick
    pocketBut.onclick = onPocketButClick
    entryBut.onclick = onEntryButClick
    settingsBut.onclick = onSettingsButClick
    langBut.onclick = onLangButClick

    addBut.onclick = addSource
    deleteBut.onclick = toggleDelMode
    resetBut.onclick = resetSources
    showAddBut.onclick = toggleAddCont

    registerKeyboardEvents()

    syncLogInBut()
    syncLangBut()
    await loadConfig()
    $.i18n().load(PROC_MESSAGES)
    if (args && args.showAlert) {
        procAlert(args.showAlert)
    }
    await loadSources()
    applyLocale()
    syncSourcesUI()
    loadCache()
    loadEntryFromLocation()
    loadEntries()
    hideSplash()
    await syncSourcesId()
    await downloadRemoteSources()
    scheduleSourcesSync()
    if (location.hash === POCKET_REDIRECT_HASH) {
        onPocketButClick()
    }
    removeHash()
}

function onLogIn() {
    syncLogInBut()
    if (isLoggedIn()) {
        scheduleSourcesSync(0)
    } else {
        delete config.sourcesId
        saveConfig()
    }
}

function initClient() {
    if (typeof window.noTimeToProcrastinate !== 'undefined' && window.noTimeToProcrastinate) {
        // just stop
        console.log('Procrastinator terminated')
        return
    }
    gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: GOOGLE_DISCOVERY_DOCS,
        scope: GOOGLE_SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(onLogIn)
        // Handle the initial sign-in state.
        googleBut.onclick = onGoogleButClick
        initApp().catch(e => console.log('Error initializing the app', e))
    }, function(error) {
        console.log('Failed to init GAPI client', error)
        gaw('init_error', 'google')
        initApp({showAlert: 'google-init-failed-alert'}).catch(e => console.log('Error initializing the app', e))
    })
}
