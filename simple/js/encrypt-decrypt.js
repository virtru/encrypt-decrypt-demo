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


const RCA3Utils = require('./util-rca3');

console.log('Utils: ', RCA3Utils);

let client;

// Encrypt the filedata and return the stream content and filename
async function encrypt(fileData, filename) {
  client = buildClient();

  const policy = new Virtru.PolicyBuilder().build();

  const encryptParams = new Virtru.EncryptParamsBuilder()
    .withArrayBufferSource(fileData)
    .withPolicy(policy)
    .withDisplayFilename(filename)
    .build();

  const enc = await client.encrypt(encryptParams);
  console.log('Enc: ', typeof enc);


  return enc;
}


// Decrypt the file by creating an object url (for now) and return the stream content
async function decrypt(fileData) {
  client = buildClient();
  const decryptParams = new Virtru.DecryptParamsBuilder()
    .withArrayBufferSource(fileData)
    .build();

  const decrypted = await client.decrypt(decryptParams);
  return decrypted;
}

// Handle filename parsing with parens involved
function buildDecryptFilename(filename) {
  const ext = filename.substr(-4);
  let finalFilename = filename;

  if (ext === '.tdf') {
    finalFilename = finalFilename.replace(ext, '');
  }

  finalFilename = finalFilename.replace(/\([^.]*\)$/, '');

  return finalFilename;
}

// Encrypt or decrypt the file by using the support functions
async function encryptOrDecryptFile(filedata, filename, shouldEncrypt, completion) {
  if (shouldEncrypt) {
    const encrypted = await encrypt(filedata, filename);
    const encryptedBuffer = await encrypted.toBuffer();

    console.log(RCA3Utils.fileToURL(encryptedBuffer, filename));

    await encrypted.toFile(`${filename}.tdf`);
  } else {
    const decrypted = await decrypt(filedata);
    const finalFilename = buildDecryptFilename(filename).trim();
    await decrypted.toFile(finalFilename);
  }

  if (completion) {
    completion();
  }
}

// Revoke the policy by its UUID
async function revokePolicy(uuid) {
  forceLoginIfNecessary();
  await buildClient().revokePolicy(uuid);
}

// Update the policy by its UUID
async function updatePolicy(policy) {
  forceLoginIfNecessary();
  await buildClient().updatePolicy(policy.build());
}


const dlButton = document.getElementById('downloadButton');
// Function to consistently get URL into the localStorage

const hash = localStorage.getItem('pageFragment');

if (hash) {
  dlButton.addEventListener('click', async () => {
    const tdfObj = await RCA3Utils.HashtoFile(hash);
    encryptOrDecryptFile(tdfObj.content, tdfObj.filename, false);
  });
} else {
  dlButton.style.display = 'none';
}

module.exports = {
  revokePolicy,
  updatePolicy,
  encryptOrDecryptFile,
};
