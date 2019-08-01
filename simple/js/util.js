const BASE_URL = new RegExp(/^.*\//).exec(window.location.href);
const getById = (id) => document.getElementById(id);
const getQueryParam = (id) => new URL(window.location.href).searchParams.get(id);
const getUser = () => getQueryParam('userId');
const getAuthType = () => getQueryParam('authType');
const getAppId = () => getQueryParam('appId');


const getAcmUrl = () => localStorage.getItem('acmUrl');
const getKasUrl = () => localStorage.getItem('kasUrl');
const getEasUrl = () => localStorage.getItem('easUrl');
const getApiUrl = () => localStorage.getItem('apiUrl');

let client, oauthClient;


const isSupportedBrowser = () => {
  const supportedBrowserStrings = ["Chrome", "Firefox"];
  let supported = false;
  supportedBrowserStrings.forEach((browser) => {
    if(navigator.userAgent.search(browser) >= 0){
      supported=true;
      return;
    }
  });

  return supported;
}


function emailActivationUsed(){
  const method = getAuthType();
  return method && method.toLowerCase() === 'email';
}


//Builds a new client (if needed)
function buildClient(){
  if(!client){

    const type = getAuthType();
    const appId = getAppId();
    const endpoints = getEndpoints();
    const easEndpoint = getEasUrl();
    const kasEndpoint = getKasUrl();
    const acmEndpoint = getAcmUrl();

    const clientConf = {
      email: getUser(),
      easEndpoint: easEndpoint || endpoints.easEndpoint, 
      kasEndpoint: kasEndpoint || endpoints.kasEndpoint, 
      acmEndpoint: acmEndpoint || endpoints.acmEndpoint
    };

    if(appId){
      clientConf.appId = appId;
    }
    
    client = new Virtru.Client(clientConf);
  }

  return client;
}


function getEndpoints(){
  const apiEndpoint = "https://api.virtru.com";
  const kasEndpoint = `${apiEndpoint}/kas`;
  const acmEndpoint = `${apiEndpoint}/acm`;
  const easEndpoint = `${apiEndpoint}/accounts`;
  return { kasEndpoint, acmEndpoint, easEndpoint, apiEndpoint };
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
    apiUrl: apiEndpoint || endpoints.apiEndpoint
  };

  return urls;
}

//Ensure the user is logged in and has a valid id saved. Otherwise, forward to index
function loggedIn(){
  return Virtru.Auth.isLoggedIn({email: getUser(), ...authUrls()});
}

//Log out a currently logged in user and redirect back to the login
function logout(){
  Virtru.Auth.logout({email: getUser(), ...authUrls()});
  window.location.href = `${BASE_URL}index.html`;
}

//Redirect the user if they don't have a current, valid saved appIdBundle
function forceLoginIfNecessary(){

  if(getAuthType() === 'static'){
    return;
  }

  if(!loggedIn()){
    logout();
  }
}

//If the user is already logged in with a valid appIdBundle, just forward them to the demo
async function skipLoginIfPossible(){  
  if(loggedIn()) window.location.href = `${BASE_URL}dragdrop.html?userId=${loggedInUser}`;
}

if(!isSupportedBrowser()){
  window.location.href = `${BASE_URL}incompatible-browser.html`;
}

window.addEventListener('DOMContentLoaded', function initalize(callback) {
  const maxTries = 100;
  const timeout = 100;
  let tries = 0;
  function checkOnVirtru() {
    if(window.Virtru && window.Virtru.OAuth) {
      console.log('Initialized Virtru SDK')
      virtruInitalized = true;
    } else if (tries++ < maxTries) {
      setTimeout(checkOnVirtru, timeout);
    } else {
      console.error('Virtru was not initialized');
    }
  }
  checkOnVirtru();
});

