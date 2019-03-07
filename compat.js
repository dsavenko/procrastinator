
// silly check for async
try {
    eval('async () => {}')
} catch (e) {
    console.log('Check for async failed', e)
    if (e instanceof SyntaxError) {
        window.noTimeToProcrastinate = true
        $(unsupportedBrowser).removeClass('hidden')
    } else {
        throw e; // throws CSP error
    }
}
