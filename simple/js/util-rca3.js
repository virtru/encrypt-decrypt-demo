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
  const iv = new Uint8Array(12);
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

  const response = await upload(ciphertext);
  const key = await window.crypto.subtle.exportKey('jwk', sessionKey);

  const id = response.filename;
  const hashObj = {
    filename,
    key,
    id,
  };

  const hashb64 = btoa(JSON.stringify(hashObj));

  rca3Url = `https://${window.location.hostname}${window.location.pathname}#${hashb64}`;

  const dl = await URLtoFile(hashb64);

  console.log('DL: ', dl);

  return rca3Url;
}

async function URLtoFile(hash) {
  // URL is the full URL of the file.
  let hashObj;
  try {
    hashObj = JSON.parse(atob(hash));
  } catch (e) {
    throw new Error('There was a problem getting the key data from the hash');
  }

  const sessionKey = await crypto.subtle.importKey(
    'jwk',
    hashObj.key,
    { name: 'AES-GCM' },
    false,
    hashObj.key.key_ops,
  );

  // grab S3 url queryparam
  const fileId = hashObj.id;

  // Grab the encrypted blob
  const encryptedArrayBuffer = await download(fileId);

  // decrypt blob to get TDF

  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(12),
    },
    sessionKey,
    encryptedArrayBuffer,
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
      const resp = JSON.parse(xhr.responseText);
      resolve(resp);
    };

    xhr.send(formData);
  });
}

async function download(id) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', `/uploads/${id}`);
    xhr.onload = function () {
      console.log(xhr.response);
      resolve(xhr.response);
    };

    xhr.send();
  });
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
