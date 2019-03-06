
// silly check for ES2018
if (!Promise || typeof Promise.prototype.finally !== 'function') {
    $(unsupportedBrowser).removeClass('hidden')
}
