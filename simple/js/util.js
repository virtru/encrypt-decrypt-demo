const BASE_URL = new RegExp(/^.*\//).exec(window.location.href);
const getById = (id) => document.getElementById(id);
const getQueryParam = (id) => new URL(window.location.href).searchParams.get(id);
const getUser = () => getQueryParam('userId');
const getEnvParam = () => getQueryParam('env');
const getAuthType = () => getQueryParam('authType');
const getAppId = () => getQueryParam('appId');
const environment = getEnvironmentString();
const endpoints = getEndpointsByEnvironment();

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

function getEnvironmentString() { 
  const envParam = getEnvParam();

  //Use the end user's choice of environment if they have chosen one
  if(envParam){
    return envParam.replace("#","");
  }

  //It doesn't look like they've chose a specific one, so choose the correct one by deploy env
  return `${BASE_URL}`.search('local.virtru.com') >= 0 ? 'develop01' : 'production';
}

function getSDKUrl(){
  const envs = getEndpointsByEnvironment();
  return envs['sdkUrlBase'];
}

//Add required endpoint selections given the correct environment
function getEndpointsByEnvironment(){
  const env = getEnvironmentString();

  const envs = {
    "local": {
      "stage": "develop01",
      "apiEndpoint": "https://api-develop01.develop.virtru.com",
      "kasEndpoint": "https://api-develop01.develop.virtru.com/kas",
      "acmEndpoint": "https://acm-develop01.develop.virtru.com",
      "easEndpoint": "https://accounts-develop01.develop.virtru.com",
      "eventsEndpoint": "https://events-develop01.develop.virtru.com",
      "proxyEndpoint": "https://apps-develop01.develop.virtru.com/test-zack/proxy.html",
      "sdkUrlBase":  "/js/virtru-tdf3-js.min.js"
    },
    "develop01": {
      "stage": "develop01",
      "apiEndpoint": "https://api-develop01.develop.virtru.com",
      "kasEndpoint": "https://api-develop01.develop.virtru.com/kas",
      "acmEndpoint": "https://acm-develop01.develop.virtru.com",
      "easEndpoint": "https://accounts-develop01.develop.virtru.com",
      "eventsEndpoint": "https://events-develop01.develop.virtru.com",
      "proxyEndpoint": "https://apps-develop01.develop.virtru.com/test-zack/proxy.html",
      "sdkUrlBase":  "https://sdk.virtru.com/js/0.3.7/virtru-sdk.min.js"
    },
    "staging": {
      "stage": "staging",
      "apiEndpoint": "https://api.staging.virtru.com",
      "kasEndpoint": "https://api.staging.virtru.com/kas",
      "acmEndpoint": "https://acm.staging.virtru.com",
      "easEndpoint": "https://accounts.staging.virtru.com",
      "eventsEndpoint": "https://events.staging.virtru.com",
      "proxyEndpoint": "https://apps-develop01.develop.virtru.com/test-zack/proxy.html",
      "sdkUrlBase":  "https://sdk.virtru.com/js/0.3.7/virtru-sdk.min.js"
    },
    "production": {
      "stage": "production",
      "apiEndpoint": "https://api.virtru.com",
      "kasEndpoint": "https://api.virtru.com/kas",
      "acmEndpoint": "https://acm.virtru.com",
      "easEndpoint": "https://accounts.virtru.com",
      "eventsEndpoint": "https://events.virtru.com",
      "proxyEndpoint": "https://apps-develop01.develop.virtru.com/test-zack/proxy.html",
      "sdkUrlBase":  "https://sdk.virtru.com/js/0.3.7/virtru-sdk.min.js"
    }
  };
  return envs[env] || envs['production'];
}

//Support function for returning the correct AuthProvider given a type string
function chooseAuthProviderByType(opts){
  // Reconfigure the proxy
  configureProxy(endpoints.proxyEndpoint);
  
  const user = getUser();
  const redirectUrl = opts.redirectUrl;
  const type = opts.type;
  const appid = opts.appId;

  const authEndpoints = {
    accountsUrl: endpoints.easEndpoint,
    acmUrl: endpoints.acmEndpoint,
    apiUrl: endpoints.apiEndpoint,
    eventsUrl: endpoints.eventsEndpoint
  };

  const defaultAuth = new Virtru.Auth.Providers.GoogleAuthProvider({ email: user, redirectUrl, ...authEndpoints });

  switch(type){
    case 'google':
      return defaultAuth
    case 'o365':
      return new Virtru.Auth.Providers.O365AuthProvider({ email: user, redirectUrl, ...authEndpoints });
    case 'email-code':
      return new Virtru.Auth.Providers.EmailCodeAuthProvider({ email: user, code: opts.code, redirectUrl, ...authEndpoints });
    case 'email':
      return new Virtru.Auth.Providers.EmailCodeAuthProvider({ email: user, code: '1234', redirectUrl: '', ...authEndpoints });
    case 'email-static':
      return Virtru.Client.AuthProviders.EmailCodeAuthProvider;
    case 'static':
      return new Virtru.Auth.Providers.StaticAuthProvider(appid);
    case 'outlook':
      return new Virtru.Auth.Providers.OutlookAuthProvider({ email: user, redirectUrl, ...authEndpoints });
    default:
      return defaultAuth
  }
}

//Convenience function to initialize an auth client
function initAuthClient(){
    oauthClient = oauthClient || Virtru.OAuth.init({
      userId: getUser(), 
      environment,
      platform: 'aodocs'
    });
}

//Builds a new client (if needed)
function buildClient(){
  // Reconfigure the proxy
  configureProxy(endpoints.proxyEndpoint);
  if(!client){

    const {acmEndpoint, kasEndpoint, easEndpoint} = getEndpointsByEnvironment();
    const authType = getAuthType();
    const appId = getAppId();

    const provider = chooseAuthProviderByType({ type: authType, redirectUrl: '', appId});

    client = new Virtru.Client({
      acmEndpoint, kasEndpoint, easEndpoint,
      authProvider: provider
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

if((importEl = getById('sdkimport'))){
  importEl.src = getSDKUrl();
}

// Configure the proxy
function configureProxy(proxyUrl) {
  if (Virtru && Virtru.XHRProxy) {
    Virtru.XHRProxy.useProxyIfBrowser(proxyUrl, [
      endpoints.apiEndpoint, endpoints.acmEndpoint, endpoints.easEndpoint
    ]);
  }
}