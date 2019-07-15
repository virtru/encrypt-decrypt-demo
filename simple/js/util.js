const BASE_URL = new RegExp(/^.*\//).exec(window.location.href);
const getById = (id) => document.getElementById(id);
const getQueryParam = (id) => new URL(window.location.href).searchParams.get(id);
const getUser = () => getQueryParam('userId');
const getEnvParam = () => getQueryParam('env');
const getAuthType = () => getQueryParam('authType');
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
    return envParam;
  }

  //It doesn't look like they've chose a specific one, so choose the correct one by deploy env
  return `${BASE_URL}`.search('local.virtru.com') >= 0 ? 'develop01' : 'production';
}

//Add required endpoint selections given the correct environment
function getEndpointsByEnvironment(){
  const env = getEnvironmentString();

  const envs = {
    "develop01": {
      "stage": "develop01",
      "kasEndpoint": "https://api-develop01.develop.virtru.com/kas",
      "acmEndpoint": "https://acm-develop01.develop.virtru.com",
      "easEndpoint": "https://accounts-develop01.develop.virtru.com",
    },
    "staging": {
      "stage": "staging",
      "kasEndpoint": "https://api.staging.virtru.com/kas",
      "acmEndpoint": "https://acm.staging.virtru.com",
      "easEndpoint": "https://accounts.staging.virtru.com",
    },
    "production": {
      "stage": "production",
      "kasEndpoint": "https://api.virtru.com/kas",
      "acmEndpoint": "https://acm.virtru.com",
      "easEndpoint": "https://accounts.virtru.com",
    }
  };

  return envs[env] || envs['production'];
}

//Support function for returning the correct AuthProvider given a type string
function chooseAuthProviderByType(opts){
  
  const user = getUser();
  const redirectUrl = opts.redirectUrl;
  const type = opts.type;

  const defaultAuth = new Virtru.Client.AuthProviders.GoogleAuthProvider(user, redirectUrl, environment);

  switch(type){
    case 'google':
      return defaultAuth
    case 'o365':
      return new Virtru.Client.AuthProviders.O365AuthProvider(user, redirectUrl, environment);
    case 'email-code':
      return new Virtru.Client.AuthProviders.EmailCodeAuthProvider(user, opts.code, redirectUrl, environment);
    case 'email':
      return new Virtru.Client.AuthProviders.EmailCodeAuthProvider(user, '1234', '', environment);
    case 'email-static':
      return Virtru.Client.AuthProviders.EmailCodeAuthProvider;
    case 'outlook':
      return new Virtru.Client.AuthProviders.OutlookAuthProvider(user, redirectUrl, environment);
    default:
      return defaultAuth
  }
}

//Convenience function to initialize an auth client
function initAuthClient(){
    oauthClient = oauthClient || Virtru.Auth.init({
      userId: getUser(), 
      environment,
      platform: 'aodocs'
    });
}

//Builds a new client (if needed)
function buildClient(){
  if(!client){

    const {acmEndpoint, kasEndpoint, easEndpoint} = getEndpointsByEnvironment();
    const authType = getAuthType();
    const provider = chooseAuthProviderByType({type: authType, redirectUrl: ''});

    client = new Virtru.Client.VirtruClient({
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