
/* global $, moreBut, entryBut, titleCont, imgTag, textCont, settingsBut, settingsCont */

'use strict'

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'
const SOURCES = ['lenta', 'lj', 'meduza', 'habr', 'adme', 'lor']
const LOAD_FUNC = {
    lenta: loadLentaEntries,
    lj: loadLJEntries,
    meduza: loadMeduzaEntries,
    adme: loadAdmeEntries,
    habr: loadHabrEntries,
    lor: loadLorEntries
}
const NOTHING_ENTRY = {
    title: 'Больше ничего нет :(',
    text: 'Включите дополнительные ресурсы в настройках, или зайдите позже'
}
const LOADING_ENTRY = {title: 'Загружаю...'}
const LOGO_ENTRY = {
    title: 'Привет, это Прокрастинатор!',
    html: 
        '<p>Прокрастинатор собирает новости и статьи с других ресурсов и показывает вам по одной. <b>Просто нажмите ДАЛЬШЕ.</b></p>' +
        
        '<p>Прокрастинатор запоминает прочитанные статьи и не показывает их повторно.</p>' +
        
        '<p>Нажав на шестерёнку справа вверху, можно настроить, из каких источников брать информацию.</p>' +
        
        '<p>Там же можно подключить синхронизацию. С ней гораздо комфортнее использовать Прокрастинатор с разных устройств.</p>' +

        '<p>Пожелания и предложения можно оставлять <a href="https://github.com/dsavenko/procrastinator/issues" target="_blank">на GitHub</a>, ' +
        'либо писать мне на <a href="mailto:ds@dsavenko.com">почту</a>.</p>'
}
const MAX_SHOWN_LENGTH = 1000

let entries = []
let currentEntry = {}
let settings = {
    lenta: true,
    lj: true,
    meduza: true,
    adme: true,
    habr: false,
    lor: false
}
let shown = []
const remoteStorage = new RemoteStorage()
const remoteClient = remoteStorage.scope('/procrastinator/')

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function filterEntries(newEntries) {
    return newEntries.filter(e => settings[e.source] && !shown.includes(e.url))
}

function addEntries(newEntries) {
    const old = entries.length
    entries = entries.concat(filterEntries(newEntries))
    const ret = entries.length - old
    shuffle(entries)
    loadFirstEntry()
    return ret
}

function htmlDecode(value) {
    return $('<textarea/>').html(value).text()
}


async function loadRssSource(name, url) {
    if (!settings[name]) {
        return
    }
    try {
        const parser = new RSSParser()
        const feed = await parser.parseURL(CORS_PROXY + url)
        if (!settings[name]) {
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
                source: name
            }
        })
        const len = addEntries(newEntries)
        console.log(`Added ${len} ${name} entries`)
    } catch(e) {
        console.log(`Failed to load ${name} entries`, e)
    }
}

async function loadLentaEntries() {
    loadRssSource('lenta', 'https://lenta.ru/rss')
}

async function loadMeduzaEntries() {
    loadRssSource('meduza', 'https://meduza.io/rss/all')
}

async function loadHabrEntries() {
    loadRssSource('habr', 'https://habr.com/rss/best/daily')
}

async function loadAdmeEntries() {
    loadRssSource('adme', 'https://www.adme.ru/rss')
}

async function loadLorEntries() {
    loadRssSource('lor', 'https://www.linux.org.ru/section-rss.jsp')
}

async function loadLJEntries() {
    if (!settings.lj) {
        return
    }
    try {
        const html = await $.ajax(CORS_PROXY + 'https://top.artlebedev.ru/')
        if (!settings.lj) {
            return
        }
        const items = $('.posts .item', $(html))
        const ljEntries = items.map(function() {
            return {
                title: $('.title a', this).first().text() + ' — ' + $('.title .lj-user a', this).last().text(),
                text: $('.p', this).text(),
                imageUrl: $('.image img', this).attr('src'),
                url: $('.title a', this).first().attr('href'),
                source: 'lj'
            }
        }).get()
        const len = addEntries(ljEntries)
        console.log(`Added ${len} LJ entries`)
    } catch(e) {
        console.log('Failed to load LJ entries', e)
    }
}

function loadEntries() {
    Object.values(LOAD_FUNC).forEach(f => f.call())
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
}

function pickEntry() {
    if (0 >= entries.length) {
        currentEntry = NOTHING_ENTRY
    } else {
        currentEntry = entries.shift()
        shown.push(currentEntry.url)
        while (MAX_SHOWN_LENGTH < shown.length) {
            shown.shift()
        }
        saveShown()
    }
    return currentEntry
}

function onLogoButClick() {
    setEntry(LOGO_ENTRY)
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
    if (url) {
        window.open(url, '_blank')
    }
}

function onSettingsButClick() {
    $(settingsCont).toggleClass('hidden')
    $(loginCont).toggleClass('hidden')
}

function syncSourceBut(source) {
    $(`#settingsCont [data-source="${source}"] img`).attr('src', settings[source] ? 'checked.svg' : 'unchecked.svg')
}

function syncSettingsUI() {
    for (const source of SOURCES) {
        syncSourceBut(source)
    }
}

function onToggleButClick() {
    const source = $(this).data('source')
    if (typeof settings[source] !== undefined) {
        settings[source] = !settings[source]
        if (settings[source]) {
            if (!currentEntry.url) {
                setEntry(LOADING_ENTRY)
            }
            LOAD_FUNC[source].call()
        } else {
            entries = entries.filter(e => e.source != source)
        }
        saveSettings()
        syncSettingsUI()
    }
}

async function save(key, value) {
    remoteClient.storeFile('application/json', `${key}.json`, JSON.stringify(value))
        .then(() => console.log(`Saved ${key}`))
        .catch(e => console.log(`Failed to save ${key}`, e))
}

async function load(key, defVal) {
    const file = await remoteClient.getFile(`${key}.json`)
    return file && file.data ? JSON.parse(file.data) : defVal
}

async function saveSettings() {
    save('settings', settings)
}

async function loadSettings() {
    settings = await load('settings', settings)
}

async function saveShown() {
    save('shown', shown)
}

async function loadShown() {
    shown = await load('shown', shown)
}

function onChange(e) {
    entries = filterEntries(entries)
    if ('settings.json' == e.relativePath) {
        syncSettingsUI()
    }
    console.log(`${e.origin} changes to ${e.relativePath} received and handled`)
}

function initStorage() {
    remoteStorage.access.claim('procrastinator', 'rw')
    remoteStorage.caching.enable('/procrastinator/')
    remoteClient.on('change', onChange)
    const widget = new Widget(remoteStorage, {leaveOpen: true})
    widget.attach('loginHolder')
}

logoBut.onclick = onLogoButClick
moreBut.onclick = onMoreButClick
entryBut.onclick = onEntryButClick
settingsBut.onclick = onSettingsButClick
$('#settingsCont .toggle').click(onToggleButClick)

initStorage()
Promise.all([loadSettings(), loadShown()]).finally(() => {
    syncSettingsUI()
    loadEntries()
})
