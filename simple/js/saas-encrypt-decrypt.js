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