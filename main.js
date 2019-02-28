
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
const DEFAULT_SOURCES = [
    {name: 'Lenta', on: true, url: 'https://lenta.ru/rss'},
    {name: 'Meduza', on: true, url: 'https://meduza.io/rss/all'},
    {name: 'AdMe', on: true, url: 'https://www.adme.ru/rss'},
    {name: 'Habr', on: false, url: 'https://habr.com/rss/best/daily'},
    {name: 'LOR', on: false, url: 'https://www.linux.org.ru/section-rss.jsp'}
]
const DEFAULT_SOURCES_EN = [
    {name: 'CNN', on: true, url: 'http://rss.cnn.com/rss/edition.rss'},
    {name: 'NYT', on: true, url: 'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'},
    {name: 'RT', on: true, url: 'https://www.rt.com/rss/'},
    {name: 'Onion', on: true, url: 'https://www.theonion.com/rss'},
    {name: 'TechCrunch', on: false, url: 'http://feeds.feedburner.com/TechCrunch/'},
]
const DEFAULT_CONFIG = {welcomeShown: false}
const DUMMY_URL = 'dummy'
const MAX_STORAGE_LEN = 10000
const SUPPORTED_LOCALES = ['en', 'ru']
const MAX_NAME_LEN = 10
const CONFIG_STORAGE_KEY = 'config'
const SOURCES_STORAGE_KEY = 'sources'
const CACHE_STORAGE_KEY = 'cache'
const SYNC_PERIOD = 1000 * 60 * 5 // 5 min
const MIN_ALERT_INTERVAL = 1000 * 60 * 60 * 2 // 2 hours

const virtualDocument = document.implementation.createHTMLDocument('virtual')

let entries = []
let previousEntry
let currentEntry = {}
let sources = DEFAULT_SOURCES.map(s => ({...s}))
let delMode = false
let loadingSources = []
let config = {...DEFAULT_CONFIG}
let sourcesSyncTimeoutId
let sourceAlertDate = {}

function defaultSources() {
    return ($.i18n().locale.startsWith('ru') ? DEFAULT_SOURCES : DEFAULT_SOURCES_EN).map(s => ({...s}))
}

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
    return `shown-${md5(entry.url)}`
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

function htmlDecode(value) {
    let str = value || ''
    // remove all inside SCRIPT and STYLE tags
    str = str.replace(/<script\b[^>]*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, '')
    str = str.replace(/<style\b[^>]*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, '')
    // replace p and br with line breaks
    str = str.replace(/<\s*p\b[^>]*>/gi, '\n\n')
    str = str.replace(/<\s*br\b[^>]*>/gi, '\n')
    // remove other tags
    str = str.replace(/<(?:.|\s)*?>/g, '')
    // get rid of more than 2 line breaks
    str = str.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, '\n\n')
    // get rid of more than 2 spaces
    str = str.replace(/ +(?= )/g,'')
    // convert html-encoded entities
    str = $('<textarea/>').html(str).text()
    return str
}

function extractImageFromHtml(content) {
    if (content) {
        const tmpDom = $('<div>', virtualDocument).append($.parseHTML(content))
        return $('img', tmpDom).attr('src')
    }
}

function extractRssLink(html) {
    const newDoc = new DOMParser().parseFromString(html, 'text/html')
    return $(newDoc).find('link[type="application/rss+xml"]').attr('href')
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
    let text = await resp.text()
    if (contentType.includes('text/html')) {
        const rssLink = extractRssLink(text)
        console.log(`found RSS link for ${name}: ${rssLink}`)
        resp = await fetch(CORS_PROXY + rssLink)
        if (!resp.ok) {
            throw new Error(`Failed to load RSS from ${rssLink}, error response from server: ${resp.status} ${resp.statusText}`)
        }
        text = await resp.text()
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
        if (!imageUrl) {
            imageUrl = extractImageFromHtml(e.content) || extractImageFromHtml(e['content:encoded'])
        }
        return {
            title: htmlDecode(e.title),
            text: htmlDecode(e.content),
            imageUrl: imageUrl,
            url: e.link,
            sourceName: name
        }
    })
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

async function addEntries(sourceName, newEntries) {
    removeSourceEntries(sourceName)
    if (!isSourceOn(sourceName)) {
        return
    }
    // filter before syncing to sync less
    let filteredEntries = filterEntries(newEntries)
    await syncShown(filteredEntries)
    // filter again after syncing
    filteredEntries = filterEntries(filteredEntries)
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
            .finally(() => {
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

function setEntry(e, noPrevious, noCache) {
    clearAllAlerts()
    e = e || {}
    titleCont.innerText = e.title || ''
    $(imageCont).empty()
    if (isRealUrl(e.imageUrl)) {
        $(imageCont).append($('<img/>').attr('src', e.imageUrl))
    }
    if (e.html) {
        textCont.innerHTML = e.html
    } else {
        textCont.innerText = e.text || ''
    }
    entryBut.dataset.url = e.url || ''
    entryCont.scrollTop = 0
    if (isRealUrl(e.url)) {
        rememberShown(e)
    }
    if (!noPrevious && isRealUrl(currentEntry.url)) {
        previousEntry = currentEntry
        $(previousBut).removeClass('invisible')
    } else {
        previousEntry = null
        $(previousBut).addClass('invisible')
    }
    $(moreBut).text($.i18n(e.checkAgain ? 'check-again-btn' : 'more-btn'))
    currentEntry = e
    if (isRealUrl(currentEntry.url)) {
        $(pocketBut).removeClass('invisible')
    } else {
        hidePocketBut()
    }
    if (!noCache && isRealUrl(currentEntry.url)) {
        setTimeout(() => saveCache())
    }
}

function pickEntry() {
    if (0 >= entries.length) {
        return 0 >= loadingSources.length ? nothingEntry() : loadingEntry()
    } else {
        return entries.shift()
    }
}

function onLogoButClick() {
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
    }
}

function onMoreButClick() {
    gaw('more')
    if (currentEntry.checkAgain) {
        loadEntries()
    } else {
        setEntry(pickEntry())
    }
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

function onSettingsButClick() {
    if (!$(addCont).hasClass('hidden')) {
        toggleAddCont()
    }
    $('.gear-menu').toggleClass('hidden')
    $(settingsBut).toggleClass('enabled')
    if ($(settingsBut).hasClass('enabled')) {
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
            setEntry(cache.currentEntry, true, true)
        }
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

function loadConfig() {
    config = load(CONFIG_STORAGE_KEY) || {...DEFAULT_CONFIG}
    if (config.locale && SUPPORTED_LOCALES.includes(config.locale)) {
        $.i18n().locale = config.locale
        syncLangBut()
        console.log('Set locale from config', $.i18n().locale)
    }
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

function loadSources() {
    sources = load(SOURCES_STORAGE_KEY) || defaultSources()
}

async function syncSources() {
    if (isLoggedIn()) {
        await syncSourcesId()
        await downloadRemoteSources()
        syncSourcesUI()
        loadEntries()
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
            .finally(() => scheduleSourcesSync())
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

function resetSources() {
    if (confirm($.i18n('reset-confirm'))) {
        sources = defaultSources()
        delMode = false
        saveSources()
        gaw('reset_sources')
        syncSourcesUI()
        entries = []
        setEntry(loadingEntry())
        loadEntries()
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
        $(langBut).text('En')
    } else {
        $(langBut).text('Ру')
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

function onLangButClick() {
    const newLoc = $.i18n().locale.startsWith('ru') ? 'en' : 'ru'
    $.i18n().locale = newLoc
    syncLangBut()
    applyLocale()
    config.locale = newLoc
    saveConfig()
    gaw(newLoc, 'locale')
}

function hideSplash() {
    $(splash).hide()
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
    history.pushState('', document.title, window.location.pathname + window.location.search)
}

function gaw(action, category) {
    if (ga) {
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

function removeNodeParent() {
    $(this).parent().remove()
}

function procAlert(msgKey, param) {
    const alertCont = $('.alert-cont-prototype').clone().addClass('alert-cont')
    alertCont.find('.alert').text($.i18n(msgKey, param))
    alertCont.find('.alert-close').click(removeNodeParent)
    alertCont.insertAfter('#entryCont')
    alertCont.removeClass('alert-cont-prototype hidden')
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

    document.addEventListener('keyup', e => {
        if (32 == e.which) {
            onMoreButClick()
        }
    })

    syncLogInBut()
    syncLangBut()
    loadConfig()
    $.i18n().load(PROC_MESSAGES)
    if (args && args.showAlert) {
        procAlert(args.showAlert)
    }
    loadSources()
    applyLocale()
    syncSourcesUI()
    loadCache()
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
