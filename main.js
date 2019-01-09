/*
Copyright (c) 2018 Dmitry Savenko <ds@dsavenko.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* global $, moreBut, entryBut, titleCont, imgTag, textCont, settingsBut, settingsCont */

'use strict'

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'
const SOURCES = ['lenta', 'lj', 'meduza', 'habr']
const LOAD_FUNC = {
    lenta: loadLentaEntries,
    lj: loadLJEntries,
    meduza: loadMeduzaEntries,
    habr: loadHabrEntries
}
const NOTHING_ENTRY = {title: 'Больше ничего нет :('}
const LOADING_ENTRY = {title: 'Загружаю...'}
const MAX_SHOWN_LENGTH = 500

let entries = []
let currentEntry = {}
let firstEntryLoaded = false
let settings = {
    lenta: true,
    lj: true,
    meduza: true,
    habr: true
}
let shown = []

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function addEntries(newEntries) {
    entries = entries.concat(newEntries.filter(e => !shown.includes(e.url)))
    shuffle(entries)
    loadFirstEntry()
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
                title: e.title,
                text: e.contentSnippet,
                imageUrl: imageUrl,
                url: e.link,
                source: name
            }
        })
        addEntries(newEntries)
        console.log(`Loaded ${name} entries`)
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
        addEntries(ljEntries)
        console.log('Loaded LJ entries')
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
    textCont.innerText = e.text || ''
    entryBut.dataset.url = e.url || ''
}

function pickEntry() {
    if (0 >= entries.length) {
        currentEntry = NOTHING_ENTRY
    } else {
        currentEntry = entries.shift()
        if (0 >= entries.length) {
            firstEntryLoaded = false
        }
        shown.push(currentEntry.url)
        while (MAX_SHOWN_LENGTH < shown.length) {
            shown.shift()
        }
        saveShown()
    }
    return currentEntry
}

function onMoreButClick() {
    setEntry(pickEntry())
}

function loadFirstEntry() {
    if (!firstEntryLoaded && 0 < entries.length) {
        onMoreButClick()
        firstEntryLoaded = true
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

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

function load(key, defVal) {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defVal
}

function saveSettings() {
    save('settings', settings)
}

function loadSettings() {
    settings = load('settings', settings)
}

function saveShown() {
    save('shown', shown)
}

function loadShown() {
    shown = load('shown', shown)
}

moreBut.onclick = onMoreButClick
entryBut.onclick = onEntryButClick
settingsBut.onclick = onSettingsButClick
$('#settingsCont .toggle').click(onToggleButClick)

loadSettings()
loadShown()
syncSettingsUI()
loadEntries()
