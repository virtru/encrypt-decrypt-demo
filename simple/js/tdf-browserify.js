/**
	This file is to be compiled with browserify to be used by the simple example page.
	See package.json (build) for more info.
**/

//Require all node modules needed to be access by the browser
const filesaver = require('file-saver');
const fileType = require('file-type');
const moment = require('moment');

//Imports for our simple example
const simpleTDFUtil = require('./saas-tdf-util.js');
const simpleEncryptDecrypt = require('./saas-encrypt-decrypt.js');

const imports = [simpleTDFUtil, simpleEncryptDecrypt];

//Load all global properties of our explicitly imported modules on the window
imports.forEach((i) => {
  Object.keys(i).forEach((key) => {
    window[key] = i[key];
  });
});

//Add other necessary modules on the window
window.saveAs = filesaver.saveAs;
window.Buffer = Buffer;
window.fileType = fileType;
window.moment = moment;
