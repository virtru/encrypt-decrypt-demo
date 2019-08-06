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
	
