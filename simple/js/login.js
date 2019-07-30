const email = getUser();
const codeAuthElement = getById('codeauth');

let authType;

const virtruSessionKey = 'virtru-client-auth';
if (localStorage.getItem(virtruSessionKey) !== null) {
  localStorage.removeItem(virtruSessionKey);
}

//construct a redirect url needed for the demo
const buildRedirectUrl = () => {
  type = authType || 'email';
  return `${BASE_URL}dragdrop.html?userId=${email}&authType=${type}`;
};

//Log in the user using Outlook OAuth
const loginUsingOutlook = async () => {
  authType='outlook';
  await Virtru.Auth.loginWithOutlook({email: getUser(), redirectUrl: buildRedirectUrl()});
};

//Log in the user using Google OAuth
const loginUsingGoogle = async () => {
  authType='google';
  await Virtru.Auth.loginWithGoogle({email: getUser(), redirectUrl: buildRedirectUrl()});
};

//Log in the user using Office365
const loginUsingOffice365 = async () => {
  authType='o365';
  await Virtru.Auth.loginWithOffice365({email: getUser(), redirectUrl: buildRedirectUrl()});
};

//Show the loading spinner
const showLoading = () => { getById('codeauth').innerHTML = '<div class="loader"></div>'; };

//Go to the demo page once we've successfully authenticated
const goToDemo = () => { 
  window.location = buildRedirectUrl(); 
};

//Prepare a region which the user can input their activation code
const engageActivateCode = async () => {
  let code = getById('code').value;

  if(!code || !/^V-[0-9]{8}$/.test(code)){ 
    alert('Please enter a valid code in the form of V-XXXXXXXX');
    return;
  }

  code = code.replace('V-','');
  showLoading();
  await Virtru.Auth.activateEmailCode({email: getUser(), code, redirectUrl: buildRedirectUrl()});

  codeAuthElement.innerHTML = `
        <h2 class="login-instruction">You have been successfully authenticated!</h2>
        <input type="button" class="button" id="gotodemo" value="Go to Demo">
      `;
  getById('gotodemo').addEventListener('click', goToDemo);
};

//Process a request to send an activation code to a user's email address
const engageEmailLogin = async () => {
  showLoading();
  authType = 'email';
  await Virtru.Auth.sendCodeToEmail({email: getUser(), ...authUrls()});

  codeAuthElement.innerHTML = `
          <h2 class="login-instruction">Your code has been sent. Please check your email and enter it below.</h2>
          <input type="text" class="text-input" id="code" placeholder="Enter code" autofocus>          
          <input type="button" class="button" id="activatecodebutton" value="Activate Code">
      `;

  getById('activatecodebutton').addEventListener('click', engageActivateCode);
};

getById('googlebutton').addEventListener('click', () => loginUsingGoogle());
getById('outlookbutton').addEventListener('click', () => loginUsingOutlook());
getById('office365button').addEventListener('click', () => loginUsingOffice365());
getById('sendcodebutton').addEventListener('click', engageEmailLogin);
getById('sendcodebutton').value = `Send Code to ${email.substring(0, 15)}...`;

initializeOnVirtru();