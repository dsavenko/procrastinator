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

// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'

let entries = []
let firstEntryLoaded = false

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function loadLentaEntries() {
    try {
        const parser = new RSSParser()
        const feed = await parser.parseURL(CORS_PROXY + 'https://lenta.ru/rss')
        const lentaEntries = feed.items.map(e => {
            return {
                title: e.title,
                text: e.contentSnippet,
                imageUrl: e.enclosure.url,
                url: e.link
            }
        })
        entries = entries.concat(lentaEntries)
        shuffle(entries)
        console.log('Loaded Lenta entries')
        loadFirstEntry()
    } catch(e) {
        console.log('Failed to load Lenta entries', e)
    }
}

async function loadLJEntries() {
    try {
        const html = await $.ajax(CORS_PROXY + 'https://top.artlebedev.ru/')
        const items = $('.posts .item', $(html))
        const ljEntries = items.map(function() {
            return {
                title: $('.title a', this).first().text() + ' — ' + $('.title .lj-user a', this).last().text(),
                text: $('.p', this).text(),
                imageUrl: $('.image img', this).attr('src'),
                url: $('.title a', this).first().attr('href')
            }
        }).get()
        entries = entries.concat(ljEntries)
        shuffle(entries)
        console.log('Loaded LJ entries')
        loadFirstEntry()
    } catch(e) {
        console.log('Failed to load LJ entries', e)
    }
}

function loadEntries() {
    loadLentaEntries()
    loadLJEntries()
}

function setEntry(e) {
    e = e || {}
    titleCont.innerText = e.title || ''
    imgTag.src = e.imageUrl || ''
    textCont.innerText = e.text || ''
    entryBut.dataset.url = e.url || ''
}

function pickEntry() {
    return 0 == entries.length ? {title: 'Больше ничего нет :('} : entries.shift()
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

function onToggleButClick(e) {
    $(this).find('img').toggleClass('hidden')
}

moreBut.onclick = onMoreButClick
entryBut.onclick = onEntryButClick
settingsBut.onclick = onSettingsButClick
$('#settingsCont .toggle').click(onToggleButClick)

loadEntries()
