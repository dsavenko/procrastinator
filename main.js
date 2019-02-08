
'use strict'

const GITHUB_URL = 'https://github.com/dsavenko/procrastinator/issues'
const CONTACT_MAIL = 'ds@dsavenko.com'

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'
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

let entries = []
let currentEntry = {}
let sources = DEFAULT_SOURCES.map(s => ({...s}))
let delMode = false
let loadingSources = []
let config = {...DEFAULT_CONFIG}

function defaultSources() {
    return ($.i18n().locale.startsWith('ru') ? DEFAULT_SOURCES : DEFAULT_SOURCES_EN).map(s => ({...s}))
}

function nothingEntry() {
    return {
        title: $.i18n('nothing-entry-title'),
        html: $.i18n('nothing-entry-html'),
        rebuild: nothingEntry
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

function rememberShown(entry) {
    try {
        ensureStorageLength()
        localStorage.setItem(`shown/${md5(entry.url)}`, '')
    } catch(e) {
        console.log(`Failed to remember entry ${entry.url}`, e)
    }
}

function isShown(entry) {
    return null != localStorage.getItem(`shown/${md5(entry.url)}`)
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

function filterEntries(newEntries) {
    return newEntries.filter(e => isSourceOn(e.sourceName) && !isShown(e))
}

function htmlDecode(value) {
    return $('<textarea/>').html(value).text()
}

function extractImageFromHtml(content) {
    if (content) {
        const tmpDom = $('<div>').append($.parseHTML(content))
        return $('img', tmpDom).attr('src')
    }
}

async function loadRssSource(name, url) {
    const parser = new RSSParser({
        customFields: {
            item: ['media:group', 'media:content', 'media:thumbnail']
        }
    })
    const feed = await parser.parseURL(CORS_PROXY + url)
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
            text: htmlDecode(e.contentSnippet),
            imageUrl: imageUrl,
            url: e.link,
            sourceName: name
        }
    })
}

function addEntries(sourceName, newEntries) {
    if (!isSourceOn(sourceName)) {
        return
    }
    const filteredEntries = filterEntries(newEntries)
    const old = entries.length
    entries = entries.concat(filteredEntries)
    shuffle(entries)
    console.log(`Added ${entries.length - old} ${sourceName} entries, total number of entries: ${entries.length}`)
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
        loadRssSource(source.name, source.url)
            .then(newEntries => addEntries(source.name, newEntries))
            .catch(e => console.log(`Failed to load ${source.name}`, e))
            .finally(() => {
                removeA(loadingSources, source.name)
                loadFirstEntry()
            })
    } else {
        loadFirstEntry()
    }
}

function loadEntries() {
    sources.forEach(s => loadSource(s))
}

function setEntry(e) {
    e = e || {}
    titleCont.innerText = e.title || ''
    imgTag.src = e.imageUrl || ''
    if (e.html) {
        textCont.innerHTML = e.html
    } else {
        textCont.innerText = e.text || ''
    }
    entryBut.dataset.url = e.url || ''
    entryCont.scrollTop = 0
    if (e.url && e.url !== DUMMY_URL) {
        rememberShown(e)
    }
    currentEntry = e
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
}

function onMoreButClick() {
    setEntry(pickEntry())
}

function loadFirstEntry() {
    if (!currentEntry.url) {
        onMoreButClick()
    }
}

function onEntryButClick() {
    const url = entryBut.dataset.url
    if (url && url !== DUMMY_URL) {
        window.open(url, '_blank')
    }
}

function onSettingsButClick() {
    if (!$(addCont).hasClass('hidden')) {
        toggleAddCont()
    }
    $(".gear-menu").toggleClass('hidden')
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
            entries = entries.filter(e => e.sourceName != name)
        }
        saveSources()
        $(this).find('img').attr('src', getImgSrc(source))
    } else {
        console.log(`${name} source not found`)
    }
}

function save(key, value) {
    try {
        ensureStorageLength()
        const path = `${key}.json`
        localStorage.setItem(path, JSON.stringify(value))
        console.log(`Saved ${key}`)
    } catch(e) {
        console.log(`Failed to save ${key}`, e)
    }
}

function load(key) {
    const path = `${key}.json`
    const data = localStorage.getItem(path)
    return data ? JSON.parse(data) : null
}

function saveSources() {
    save(SOURCES_STORAGE_KEY, sources)
}

function saveConfig() {
    save(CONFIG_STORAGE_KEY, config)
}

function ensureStorageLength() {
    if (MAX_STORAGE_LEN <= localStorage.length) {
        console.log(`Storage length is too high (${localStorage.length}), clearing storage`)
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

function loadSources() {
    sources = load(SOURCES_STORAGE_KEY) || defaultSources()
}

function addSource() {
    const newName = nameInput.value
    if (0 >= newName.length) {
        alert($.i18n('no-name-alert'))
        return
    }
    if (MAX_NAME_LEN < newName.length) {
        alert($.i18n('name-too-long-alert'))
        return
    }
    if (findSource(newName)) {
        alert($.i18n('name-exists-alert'))
        return
    }
    const newUrl = urlInput.value
    if (0 >= newUrl.length) {
        alert($.i18n('no-rss-addr-alert'))
        return
    }
    const existingSource = sources.find(s => s.url === newUrl)
    if (existingSource) {
        alert($.i18n('rss-addr-exists-alert', existingSource.name))
        return
    }
    const newSource = {name: newName, on: true, url: newUrl}
    sources.push(newSource)
    loadSource(newSource)
    saveSources()
    syncSourcesUI()
    toggleAddCont()
}

function resetSources() {
    if (confirm($.i18n('reset-confirm'))) {
        sources = defaultSources()
        delMode = false
        saveSources()
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
    if (currentEntry.rebuild) {
        setEntry(currentEntry.rebuild())
    }
}

function syncLangBut() {
    if ($.i18n().locale.startsWith('ru')) {
        $(langBut).text('En')
    } else {
        $(langBut).text('Ру')
    }
}

function onLangButClick() {
    const newLoc = $.i18n().locale.startsWith('ru') ? 'en' : 'ru'
    $.i18n().locale = newLoc
    syncLangBut()
    applyLocale()
    config.locale = newLoc
    saveConfig()
}

function hideSplash() {
    $(splash).hide()
}

logoBut.onclick = onLogoButClick
moreBut.onclick = onMoreButClick
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

syncLangBut()
loadConfig()
$.i18n().load(PROC_MESSAGES)
loadSources()
applyLocale()
syncSourcesUI()
setEntry(loadingEntry())
hideSplash()
loadEntries()
