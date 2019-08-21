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


const getAcmUrl = () => localStorage.getItem('acmUrl');
const getKasUrl = () => localStorage.getItem('kasUrl');
const getEasUrl = () => localStorage.getItem('easUrl');
const getApiUrl = () => localStorage.getItem('apiUrl');
const getUser = () => getQueryParam('virtruAuthWidgetEmail');


let client; let
  oauthClient;


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
  if (!client) {
    const endpoints = getEndpoints();
    const easEndpoint = getEasUrl();
    const kasEndpoint = getKasUrl();
    const acmEndpoint = getAcmUrl();

    const clientConf = {
      email: getUser(),
      easEndpoint: easEndpoint || endpoints.easEndpoint,
      kasEndpoint: kasEndpoint || endpoints.kasEndpoint,
      acmEndpoint: acmEndpoint || endpoints.acmEndpoint,
    };

    client = new Virtru.Client(clientConf);
  }

  return client;
}


function getEndpoints() {
  const apiEndpoint = 'https://api.virtru.com';
  const kasEndpoint = `${apiEndpoint}/kas`;
  const acmEndpoint = `${apiEndpoint}/acm`;
  const easEndpoint = `${apiEndpoint}/accounts`;
  return {
    kasEndpoint, acmEndpoint, easEndpoint, apiEndpoint,
  };
}

function authUrls() {
  const endpoints = getEndpoints();
  const easEndpoint = getEasUrl();
  const kasEndpoint = getKasUrl();
  const acmEndpoint = getAcmUrl();
  const apiEndpoint = getApiUrl();

  const urls = {
    accountsUrl: easEndpoint || endpoints.easEndpoint,
    acmUrl: acmEndpoint || endpoints.acmEndpoint,
    apiUrl: apiEndpoint || endpoints.apiEndpoint,
  };

  return urls;
}

// Ensure the user is logged in and has a valid id saved. Otherwise, forward to index
function loggedIn() {
  return Virtru.Auth.isLoggedIn({ email: getUser(), ...authUrls() });
}

// Log out a currently logged in user and redirect back to the login
function logout() {
  Virtru.Auth.logout({ email: getUser(), ...authUrls() });
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
