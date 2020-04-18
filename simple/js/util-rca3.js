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

  // // gen Key
  // const sessionkey = 1; // random 32 byte val

  // // encrypt fileData
  // const ciphertext = 1; // encrypt(fileData,sessionkey)

  // // upload fileData to S3
  // //    SecureLib S3 Uploader
  // //    https://github.com/virtru/secure-lib.js/blob/master/lib/s3-uploader.js

  // // construct URL

  // const base64key = 1; // base64 of the key
  // const rca3Url = 1; // `${BASE_URL}index.html`+`?f=`+filename+`#`;

  // // Return url
  console.log('Args: ', { fileData, filename });
  return 'https://someurl';
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
