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

let client;


//Encrypt the filedata and return the stream content and filename
async function encrypt(fileData, filename, userId, asHtml) {
  
  client = buildClient();

  const policy = new Virtru.PolicyBuilder().build();

  const encryptParams = new Virtru.EncryptParamsBuilder()
      .withArrayBufferSource(fileData)
      .withPolicy(policy)
      .withDisplayFilename(filename)
      .build();

  const enc = await client.encrypt(encryptParams);
  return enc;
}


//Decrypt the file by creating an object url (for now) and return the stream content
async function decrypt(fileData, userId, asHtml) {

 client = buildClient();
 const decryptParams = new Virtru.DecryptParamsBuilder()
      .withArrayBufferSource(fileData)
      .build();

 const decrypted = await client.decrypt(decryptParams);
 return decrypted;
}

function getMimeByProtocol(isHtmlProtocol){
  return isHtmlProtocol ? {type: 'text/html;charset=binary'} : {type: 'application/json;charset=binary'};
}

//Handle filename parsing with parens involved
function buildDecryptFilename(filename){
  const ext = filename.substr(-4);
  let finalFilename = filename;

  if(ext === ".tdf"){
    finalFilename = finalFilename.replace(ext,"");
  }

  finalFilename = finalFilename.replace(/\([^.]*\)$/, '');

  return finalFilename;
}

//Encrypt or decrypt the file by using the support functions, depending on the value of the shouldEncrypt flag
async function encryptOrDecryptFile(filedata, filename, shouldEncrypt, userId, completion, asHtml) {
  if (shouldEncrypt) {
    const ext = asHtml ? 'html' : 'tdf';
    const encrypted = await encrypt(filedata, filename, userId, asHtml);
    await encrypted.toFile(`${filename}.${ext}`);
    completion && completion();
  } else {
    const decrypted = await decrypt(filedata, userId, isHtmlProtocol);
    const finalFilename = buildDecryptFilename(filename).trim();
    await decrypted.toFile(finalFilename);
    completion && completion();
  }
}

module.exports = {
  encryptOrDecryptFile
};