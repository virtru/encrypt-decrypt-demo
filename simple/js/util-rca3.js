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

/* eslint-disable no-unused-vars */

const BASE_URL = new RegExp(/^.*\//).exec(window.location.href);
// const getById = (id) => document.getElementById(id);
// const getQueryParam = (id) => new URL(window.location.href).searchParams.get(id);
// const getUser = () => getQueryParam('virtruAuthWidgetEmail');


let client;

// Encrypt the filedata and return the stream content and filename
async function fileToURL(fileData, filename) {
  // client = buildClient();

  // // encrypt fileData
  // const sessionkey = getNewKey();// random 32 byte val
  // const ciphertext = window.crypto.subtle.encrypt(
  //   {
  //     name: "AES-GCM",
  //     iv: 0
  //   },
  //   sessionkey,
  //   fileData
  // );

  // // upload fileData to S3
  // //    SecureLib S3 Uploader
  // //    https://github.com/virtru/secure-lib.js/blob/master/lib/s3-uploader.js

  // // construct URL
  // const base64key = btoa(sessionkey); // base64 of the key
  // let rca3Url = window.location.href.searchParams.set('n', 'filename');
  // rca3Url = rca3Url + '#' + base64key;

  // // Return url
  // console.log('Args: ', { fileData, filename });

  return 'https://someurl';
}

function getNewKey() {
  const key = window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
  return key;
}

function encryptMessage(key) {
  const encoded = getMessageEncoding();
  const iv = 0;
  return window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded,
  );
}


/*
  const policy = new Virtru.PolicyBuilder().build();

  const encryptParams = new Virtru.EncryptParamsBuilder()
    .withArrayBufferSource(fileData)
    .withPolicy(policy)
    .withDisplayFilename(filename)
    .build();

  const enc = await client.encrypt(encryptParams);
  return enc;

*/

module.exports = {
  fileToURL,
};
