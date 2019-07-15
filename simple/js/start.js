//Grab the email and forward the user to the next step of the authentication process
const startButton = getById('startbutton');
const emailInput = getById('email');
const login = (email) => {

  const emailStr = email.value.trim();

  if (!emailStr) {
    alert('A valid email address must be included');
    console.error('Ensure an email address is provided');
    return;
  }

  const loc = `${BASE_URL}login.html?userId=${emailStr}`;
  window.location.href = loc;
};

startButton.addEventListener('click', () => login(emailInput));
emailInput.addEventListener('keypress',(e) => {
	if(e.key === 'Enter'){ 	
		e.preventDefault();
		login(emailInput);
	}
});
	
