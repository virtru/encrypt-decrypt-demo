// MIT License
//
// Copyright (c) 2019 Virtru Corporation
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const BASE_URL = new RegExp(/^.*\//).exec(window.location.href);
const getById = (id) => document.getElementById(id);
const getQueryParam = (id) => new URL(window.location.href).searchParams.get(id);
const getUser = () => getQueryParam('virtruAuthWidgetEmail');


let client;
let oauthClient;


const isSupportedBrowser = () => {
  const supportedBrowserStrings = ['Chrome', 'Firefox'];
  let supported = false;
  supportedBrowserStrings.forEach((browser) => {
    if (navigator.userAgent.search(browser) >= 0) {
      supported = true;
    }
  });

  return supported;
};


// Builds a new client (if needed)
function buildClient() {
  client = client || new Virtru.Client({ email: getUser() });
  return client;
}


// Ensure the user is logged in and has a valid id saved. Otherwise, forward to index
function loggedIn() {
  return Virtru.Auth.isLoggedIn({ email: getUser() });
}

// Log out a currently logged in user and redirect back to the login
function logout() {
  Virtru.Auth.logout({ email: getUser() });
  window.location.href = `${BASE_URL}index.html`;
}

// Redirect the user if they don't have a current, valid saved appIdBundle
function forceLoginIfNecessary() {
  if (!loggedIn()) {
    logout();
  }
}

// If the user is already logged in with a valid appIdBundle, just forward them to the demo
async function skipLoginIfPossible() {
  if (loggedIn()) window.location.href = `${BASE_URL}dragdrop.html?userId=${loggedInUser}`;
}

if (!isSupportedBrowser()) {
  window.location.href = `${BASE_URL}incompatible-browser.html`;
}

window.addEventListener('DOMContentLoaded', (callback) => {
  const maxTries = 100;
  const timeout = 100;
  let tries = 0;
  function checkOnVirtru() {
    if (window.Virtru && window.Virtru.OAuth) {
      console.log('Initialized Virtru SDK');
      virtruInitalized = true;
    } else if (tries++ < maxTries) {
      setTimeout(checkOnVirtru, timeout);
    } else {
      console.error('Virtru was not initialized');
    }
  }
  checkOnVirtru();
});
