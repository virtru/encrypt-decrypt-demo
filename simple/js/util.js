const BASE_URL = new RegExp(/^.*\//).exec(window.location.href);
const getById = (id) => document.getElementById(id);
const getQueryParam = (id) => new URL(window.location.href).searchParams.get(id);
const getUser = () => getQueryParam('userId');
const getAuthType = () => getQueryParam('authType');
const getAppId = () => getQueryParam('appId');
const getAcmUrl = () => getQueryParam('acmUrl');
const getKasUrl = () => getQueryParam('kasUrl');
const getEasUrl = () => getQueryParam('easUrl');
const getApiUrl = () => getQueryParam('apiUrl');

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

//Convenience function to initialize an auth client
function initAuthClient(){
    const endpoints = getEndpoints();
    oauthClient = oauthClient || Virtru.OAuth.init({
      userId: getUser(), 
      platform: 'aodocs',
      apiUrl: endpoints.apiEndpoint,
      accountsUrl: easEndpoint.easEndpoint,
      acmUrl: acmEndpoint
    });
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

    console.log("Initializing with ", easEndpoint || endpoints.easEndpoint);

    client = new Virtru.Client({
      email: getUser(),
      easEndpoint: "https://accounts-develop01.develop.virtru.com", //easEndpoint || endpoints.easEndpoint, 
      kasEndpoint: "https://api-develop01.develop.virtru.com/kas", //kasEndpoint || endpoints.kasEndpoint, 
      acmEndpoint: "https://acm-develop01.develop.virtru.com"//acmEndpoint || endpoints.acmEndpoint
    });
  }

  return client;
}


function getEndpoints(){
  return {
    "kasEndpoint": "https://api.virtru.com/kas",
    "acmEndpoint": "https://acm.virtru.com",
    "easEndpoint": "https://accounts.virtru.com",
    "apiEndpoint": "https://api.virtru.com"
  };
}

function authUrls() {
  const endpoints = getEndpoints();
  const easEndpoint = getEasUrl();
  const kasEndpoint = getKasUrl();
  const acmEndpoint = getAcmUrl();
  const apiEndpoint = getApiUrl();

  const urls = {
    accountsUrl: "https://accounts-develop01.develop.virtru.com", //easEndpoint || endpoints.easEndpoint,
    acmUrl: "https://acm-develop01.develop.virtru.com", //acmEndpoint || endpoints.acmEndpoint,
    apiUrl: "https://api-develop01.develop.virtru.com",//apiEndpoint || endpoints.apiEndpoint
  };

  console.log('Auth urls: ', urls);

  return urls;
}

//Ensure the user is logged in and has a valid id saved. Otherwise, forward to index
async function isAppIdStillValid(){

  initAuthClient();

  const appIdFromStorage = await oauthClient.getAppIdBundle();

  if(!appIdFromStorage || !appIdFromStorage.appId){
    return false;
  }

  //For now status checks do not work on email code activation because its 'platform' is set to 'web_login'
  if(!emailActivationUsed()){
    const appIdStatus = await oauthClient.getAppIdStatus();
    if(appIdStatus && appIdStatus.state !== 'active'){
      return false;
    }
  } 

  return true;
}

//Log out a currently logged in user and redirect back to the login
function logout(){

  const loggedInUser = getUser();
  initAuthClient();

  oauthClient.logoutSingleUser(getUser());
  window.location.href = `${BASE_URL}`;
}

//Redirect the user if they don't have a current, valid saved appIdBundle
function forceLoginIfNecessary(){

  if(getAuthType() === 'static'){
    return;
  }

  //Use traditional promises as this function needs to be called by non-async functions
  isAppIdStillValid().then((valid)=>{
    if(!valid){
      logout();
    }
  });
}

//If the user is already logged in with a valid appIdBundle, just forward them to the demo
async function skipLoginIfPossible(authType){

  const loggedInUser = getUser();
  const loginValid = await isAppIdStillValid();
  
  if(loginValid) window.location.href = `${BASE_URL}dragdrop.html?userId=${loggedInUser}&authType=${authType}`;
}

if(!isSupportedBrowser()){
  window.location.href = `${BASE_URL}incompatible-browser.html`;
}

const virtruInitQueue = [];
let virtruInitalized = false;
function initializeOnVirtru (callback) {
  if (!virtruInitalized) {
    // add to queue
    virtruInitQueue.push(callback);
  } else {
    callback.call();
  }
}


window.addEventListener('DOMContentLoaded', function initalize(callback) {
  const maxTries = 100;
  const timeout = 100;
  let tries = 0;
  function checkOnVirtru() {
    if (window.Virtru && window.Virtru.OAuth) {
      console.log('Initializing Virtru Proxy..')
      // set as initalized
      virtruInitalized = true;
      // fire off queue
      virtruInitQueue.forEach(function execQueue(item) {
        if (typeof item === 'function') {
          item.call()
        }
      });

      console.log("Initialization complete");

    } else if (tries++ < maxTries) {
      setTimeout(checkOnVirtru, timeout);
    } else {
      console.error('Virtru was not initialized');
    }
  }
  checkOnVirtru();
});
