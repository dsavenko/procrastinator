
'use strict'

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'
const DEFAULT_SOURCES = [
    {name: 'Lenta', on: true, url: 'https://lenta.ru/rss'},
    {name: 'Meduza', on: true, url: 'https://meduza.io/rss/all'},
    {name: 'AdMe', on: true, url: 'https://www.adme.ru/rss'},
    {name: 'Habr', on: false, url: 'https://habr.com/rss/best/daily'},
    {name: 'LOR', on: false, url: 'https://www.linux.org.ru/section-rss.jsp'}
]
const NOTHING_ENTRY = {
    title: 'Больше ничего нет :(',
    text: 'Включите дополнительные ресурсы в настройках, или зайдите позже'
}
const LOADING_ENTRY = {title: 'Загружаю...'}
const LOGO_ENTRY = {
    title: 'Привет, это Прокрастинатор!',
    html: 
        '<p>Прокрастинатор собирает новости и статьи с других ресурсов и показывает вам по одной. <b>Просто нажмите &laquo;ДАЛЬШЕ&raquo; или пробел.</b></p>' +
        
        '<p>Прокрастинатор запоминает прочитанные статьи и не показывает их повторно.</p>' +
        
        '<p>Нажав на шестерёнку справа вверху, можно настроить, из каких источников брать информацию.</p>' +
        
        '<p>Там же можно подключить синхронизацию. С ней гораздо комфортнее использовать Прокрастинатор с разных устройств.</p>' +

        '<p>Пожелания и предложения можно оставлять <a href="https://github.com/dsavenko/procrastinator/issues" target="_blank">на GitHub</a>, ' +
        'либо писать мне на <a href="mailto:ds@dsavenko.com">почту</a>.</p>'
}
const MAX_SHOWN_LENGTH = 1000

let entries = []
let currentEntry = {}
let sources = DEFAULT_SOURCES.map(s => ({...s}))
let shown = []

let remoteStorage
let remoteClient

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
    return newEntries.filter(e => isSourceOn(e.sourceName) && !shown.includes(e.url))
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
        const len = addEntries(newEntries)
        console.log(`Added ${len} ${name} entries`)
    } catch(e) {
        console.log(`Failed to load ${name} entries`, e)
    }
}

function loadSource(source) {
    if (source) {
        loadRssSource(source.name, source.url).catch(e => console.log('Failed to load ${source.name}', e))
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

function getImgSrc(source) {
    return source.on ? 'checked.svg' : 'unchecked.svg'
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
        source.on = !source.on
        if (source.on) {
            if (!currentEntry.url) {
                setEntry(LOADING_ENTRY)
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
    remoteClient.storeFile('application/json', `${key}.json`, JSON.stringify(value))
        .then(() => console.log(`Saved ${key}`))
        .catch(e => console.log(`Failed to save ${key}`, e))
}

async function saveShown() {
    save('shown', shown)
}

async function saveSources() {
    save('sources', sources)
}

function onChange(e) {
    let validChanges = false
    if ('sources.json' == e.relativePath) {
        sources = e.newValue
        syncSourcesUI()
        validChanges = true
    }
    if ('shown.json' == e.relativePath && shown.length != e.newValue.length) {
        shown = [...new Set(shown.concat(e.newValue))]
        saveShown()
        validChanges = true
    }
    if (validChanges) {
        entries = filterEntries(entries)
        console.log(`${e.origin} changes to ${e.relativePath} received and handled`)
    }
}

function initStorage() {
    remoteStorage = new RemoteStorage()
    remoteStorage.access.claim('procrastinator', 'rw')
    remoteStorage.caching.enable('/procrastinator/')
    remoteClient = remoteStorage.scope('/procrastinator/')
    remoteClient.on('change', onChange)
    const widget = new Widget(remoteStorage, {leaveOpen: true})
    widget.attach('loginHolder')
}

logoBut.onclick = onLogoButClick
moreBut.onclick = onMoreButClick
entryBut.onclick = onEntryButClick
settingsBut.onclick = onSettingsButClick

document.addEventListener('keyup', e => {
    if (32 == e.which) {
        onMoreButClick()
    }
})

initStorage()
syncSourcesUI()
loadEntries()
