const BASE_URL = new RegExp(/^.*\//).exec(window.location.href);
const getById = (id) => document.getElementById(id);
const getQueryParam = (id) => new URL(window.location.href).searchParams.get(id);
const getUser = () => getQueryParam('userId');
const getAuthType = () => getQueryParam('authType');
const getAppId = () => getQueryParam('appId');
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

//Support function for returning the correct AuthProvider given a type string
function chooseAuthProviderByType(opts){
  
  const user = getUser();
  const redirectUrl = opts.redirectUrl;
  const type = opts.type;
  const appid = opts.appId;

  const defaultAuth = new Virtru.Auth.Providers.GoogleAuthProvider({ email: user, redirectUrl });

  switch(type){
    case 'google':
      return defaultAuth
    case 'o365':
      return new Virtru.Auth.Providers.O365AuthProvider({ email: user, redirectUrl });
    case 'email-code':
      return new Virtru.Auth.Providers.EmailCodeAuthProvider({ email: user, code: opts.code, redirectUrl });
    case 'email':
      return new Virtru.Auth.Providers.EmailCodeAuthProvider({ email: user, code: '1234', redirectUrl: '' });
    case 'email-static':
      return Virtru.Client.AuthProviders.EmailCodeAuthProvider;
    case 'static':
      return new Virtru.Auth.Providers.StaticAuthProvider(appid);
    case 'outlook':
      return new Virtru.Auth.Providers.OutlookAuthProvider({ email: user, redirectUrl });
    default:
      return defaultAuth
  }
}

//Convenience function to initialize an auth client
function initAuthClient(){
    oauthClient = oauthClient || Virtru.OAuth.init({
      userId: getUser(), 
      platform: 'aodocs'
    });
}

//Builds a new client (if needed)
function buildClient(){
  if(!client){
    const type = getAuthType();
    const appId = getAppId();
    const authProvider = chooseAuthProviderByType({ type, redirectUrl: '', appId});

    // TODO: Fix virtru-tdf3-js and tdf3-js to use prod domains as default
    const endpoints = {
      "kasEndpoint": "https://api.virtru.com/kas",
      "acmEndpoint": "https://acm.virtru.com",
      "easEndpoint": "https://accounts.virtru.com"
    };

    client = new Virtru.Client({
      easEndpoint: endpoints.easEndpoint, kasEndpoint: endpoints.kasEndpoint, acmEndpoint: endpoints.acmEndpoint,
      authProvider
    });
  }

  return client;
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
      console.log('Initialize Virtru Proxy')
      // set as initalized
      virtruInitalized = true;
      // fire off queue
      virtruInitQueue.forEach(function execQueue(item) {
        if (typeof item === 'function') {
          item.call()
        }
      });
    } else if (tries++ < maxTries) {
      setTimeout(checkOnVirtru, timeout);
    } else {
      console.error('Virtru was not initalized');
    }
  }
  checkOnVirtru();
});