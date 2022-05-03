#!/usr/bin/env node

// @(#) extract non-ASF links when loading a page

module.paths.push('/usr/lib/node_modules')

const puppeteer = require('puppeteer');

const target = process.argv[2] || 'http://apache.org/';
const option = process.argv[3] || '';

function isASFhost(host) {
    return host == '' || host == 'apache.org' || host.endsWith('.apache.org') || host.endsWith('.apachecon.com');
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (interceptedRequest) => {
    // already handled?
    if (interceptedRequest.isInterceptResolutionHandled()) return;

    const url = interceptedRequest.url();
    if (url == target) {
        // must allow this through
        interceptedRequest.continue();
    } else {
        let host = new URL(url).host
        if (!isASFhost(host)) {
            // don't visit non-ASF hosts unless requested
            if (option == 'all') {
                console.log(url);
                interceptedRequest.continue();
            } else {
                console.log(host);
                interceptedRequest.abort();
            }
        } else { 
            // Need to visit at least an initial redirect
            interceptedRequest.continue();
        }
    }
  });
  await page.goto(target);
  await browser.close();
})();