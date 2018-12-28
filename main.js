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

/* global moreBut, titleCont, imgTag, textCont */

'use strict'

// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'

let entries = []

let parser = new RSSParser()
parser.parseURL(CORS_PROXY + 'https://lenta.ru/rss', (err, feed) => {
    if (err) {
        console.log('Failed to load Lenta entries', err)
        return
    }
    feed.items.forEach(e => {
        entries.push({
            title: e.title,
            text: e.contentSnippet,
            imageUrl: e.enclosure.url,
            url: e.link
        })
    })
})

function setEntry(e) {
    e = e || {}
    titleCont.innerText = e.title || ''
    imgTag.src = e.imageUrl || ''
    textCont.innerText = e.text || ''
}

function pickEntry() {
    return 0 == entries.length ? {title: 'Больше ничего нет :('} : entries.shift()
}

function onMoreButClick() {
    setEntry(pickEntry())
}

moreBut.onclick = onMoreButClick
