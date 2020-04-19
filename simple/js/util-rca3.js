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

const axios = require('axios');

console.log('Axios: ', axios);

let client;

// Encrypt the filedata and return the stream content and filename
async function fileToURL(fileData, filename) {
  client = buildClient();

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  // encrypt fileData
  const sessionKey = await getNewKey();// random 32 byte val
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    sessionKey,
    fileData,
  );

  // upload fileData to S3
  //    SecureLib S3 Uploader
  //    https://github.com/virtru/secure-lib.js/blob/master/lib/s3-uploader.js

  // construct URL

  const key = await window.crypto.subtle.exportKey('jwk', sessionKey);
  const s3 = 'someid';
  const hashObj = {
    filename,
    key,
    s3,
  };

  const hashb64 = btoa(JSON.stringify(hashObj));

  rca3Url = `https://${window.location.hostname}${window.location.pathname}#${hashb64}`;
  await upload(ciphertext);
  return rca3Url;
}

async function URLtoFile(URL) {
  client = buildClient();

  let hashObj;
  try {
    hashObj = JSON.decode(atob(window.location.hash));
  } catch (e) {
    throw new Error('There was a problem getting the key data from the hash');
  }

  const sessionKey = await crypto.subtle.importKey('jwk', hashObj.key);

  // grab S3 url queryparam
  s3url = hashObj.s3;
  // grab encrypted blob from S3
  encryptedblob = 1;
  // decrypt blob to get TDF


  const plaintext = window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: 0,
    },
    sessionKey,
    encryptedblob,
  );
  return plaintext;
}

async function getNewKey() {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
  return key;
}

async function upload(fileData) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', new Blob([fileData]));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload');
    xhr.onload = function () {
      resolve(JSON.parse(xhr.responseText));
    };

    xhr.send(formData);
  });
}

async function download(fileId) {
  return fileId;
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
  URLtoFile,
};
