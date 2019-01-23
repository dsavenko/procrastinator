
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
const DEFAULT_CONFIG = {welcomeShown: false}
const DUMMY_URL = 'dummy'
const MAX_SHOWN_COUNT = 10000

let entries = []
let currentEntry = {}
let sources = DEFAULT_SOURCES.map(s => ({...s}))
let delMode = false
let loadingSources = 0
let config = {...DEFAULT_CONFIG}

let remoteStorage
let remoteClient

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

async function cleanShown(listing) {
    const keys = Object.keys(listing)
    if (MAX_SHOWN_COUNT <= keys.length) {
        console.log('Too many shown entries, cleaning')
        for (let i = 0; i < keys.length; i += 2) {
            await remoteClient.remove('shown/' + keys[i])
        }
        console.log('Cleaned excessive shown entries')
    }
}

async function rememberShown(entry) {
    const path = 'shown/' + md5(entry.url)
    return remoteClient.storeFile('text/plain', path, '1') // because remoteStorage.js doesn't like empty files
}

async function filterShown(newEntries) {
    if (0 >= newEntries.length) {
        return newEntries
    }
    return remoteClient.getListing('shown/')
        .then(listing => {
            const ret = listing ? newEntries.filter(e => !listing[md5(e.url)]) : newEntries
            cleanShown(listing)
            return ret
        })
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

async function filterEntries(newEntries) {
    const enabledEntries = newEntries.filter(e => isSourceOn(e.sourceName))
    return filterShown(enabledEntries)
}

async function addEntries(newEntries) {
    const old = entries.length
    entries = entries.concat(await filterEntries(newEntries))
    const ret = entries.length - old
    shuffle(entries)
    loadFirstEntry()
    return ret
}

function htmlDecode(value) {
    return $('<textarea/>').html(value).text()
}


async function loadRssSource(name, url) {
    if (!isSourceOn(name)) {
        return
    }
    try {
        const parser = new RSSParser()
        const feed = await parser.parseURL(CORS_PROXY + url)
        if (!isSourceOn(name)) {
            return
        }
        const newEntries = feed.items.map(e => {
            let imageUrl = (e.enclosure || {}).url
            if (!imageUrl) {
                const tmpDom = $('<div>').append($.parseHTML(e.content))
                imageUrl = $('img', tmpDom).attr('src')
            }
            return {
                title: htmlDecode(e.title),
                text: htmlDecode(e.contentSnippet),
                imageUrl: imageUrl,
                url: e.link,
                sourceName: name
            }
        })
        const len = await addEntries(newEntries)
        console.log(`Added ${len} ${name} entries`)
    } catch(e) {
        console.log(`Failed to load ${name} entries`, e)
    }
}

function loadSource(source) {
    if (source) {
        ++loadingSources
        loadRssSource(source.name, source.url)
            .catch(e => console.log('Failed to load ${source.name}', e))
            .finally(() => {
                --loadingSources
                loadFirstEntry()
            })
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
        return 0 >= loadingSources ? nothingEntry() : loadingEntry()
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

async function onToggleButClick() {
    const name = $(this).data('name')
    const source = findSource(name)
    if (source) {
        if (delMode) {
            if (confirm(`Удалить ${source.name}?`)) {
                const index = sources.findIndex(s => s.name === source.name)
                if (-1 < index) {
                    sources.splice(index, 1)
                    entries = await filterEntries(entries)
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

async function save(key, value) {
    return remoteClient.storeFile('application/json', `${key}.json`, JSON.stringify(value))
        .then(() => console.log(`Saved ${key}`))
        .catch(e => console.log(`Failed to save ${key}`, e))
}

async function load(key) {
    return remoteClient.getFile(`${key}.json`)
        .then(file => {
            try {
                return file ? JSON.parse(file.data) : null
            } catch(e) {
                console.log(`Failed to load ${key}`, e)
                return null
            }
        })
}

async function saveSources() {
    save('sources', sources)
}

async function saveConfig() {
    save('config', config)
}

async function loadConfig() {
    config = (await load('config')) || {...DEFAULT_CONFIG}
    if (!config.welcomeShown) {
        if (!remoteStorage.remote.userAddress) {
            setEntry(welcomeEntry())
        }        
        config.welcomeShown = true
        saveConfig()
    }
}

async function onChange(e) {
    let validChanges = false
    if ('sources.json' == e.relativePath) {
        const newSources = e.newValue.filter(s => {
            const oldSource = findSource(s.name)
            return !oldSource || (s.on && !oldSource.on)
        })
        sources = e.newValue
        newSources.forEach(s => loadSource(s))
        syncSourcesUI()
        validChanges = true
    }
    if (validChanges) {
        entries = await filterEntries(entries)
        console.log(`${e.origin} changes to ${e.relativePath} received and handled`)
    }
}

function initStorage() {
    remoteStorage = new RemoteStorage()
    //remoteStorage.enableLog()
    remoteStorage.setApiKeys({googledrive: '1078139606-9nh42gv73t49sm2qj3c2dutritjho4oo.apps.googleusercontent.com'})
    remoteStorage.access.claim('procrastinator', 'rw')
    remoteStorage.caching.enable('/procrastinator/')
    remoteClient = remoteStorage.scope('/procrastinator/')
    remoteClient.on('change', onChange)
    const widget = new Widget(remoteStorage, {leaveOpen: true})
    widget.attach('loginHolder')
}

function addSource() {
    const newName = nameInput.value
    if (0 >= newName.length) {
        alert($.i18n('no-name-alert'))
        return
    }
    if (8 < newName.length) {
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
        sources = DEFAULT_SOURCES.map(s => ({...s}))
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
$.i18n().load(PROC_MESSAGES).done(applyLocale)
initStorage()
loadConfig().catch(e => console.log('Failed to load config', e))
syncSourcesUI()
loadEntries()
