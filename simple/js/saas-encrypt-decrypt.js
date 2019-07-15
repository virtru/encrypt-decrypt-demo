let client;

//Convert a stream to a buffer
async function streamToBuffer(stream) {
  const bufs = [];
  stream.on('data', function(d) { bufs.push(d); });
  return new Promise((resolve) => {
    stream.on('end', function() {
      resolve(Buffer.concat(bufs));
    });
  });
}


//Encrypt the filedata and return the stream content and filename
async function encrypt(fileData, filename, userId, asHtml) {
  //TODO use withBuffer
  
  client = buildClient();
  const contentStream = TDF.createMockStream(fileData);
  const policy = new Virtru.Client.VirtruPolicyBuilder().build();

  const encryptParams = new Virtru.Client.VirtruEncryptParamsBuilder()
      .withStreamSource(contentStream)
      .withPolicy(policy)
      .withDisplayFilename(filename)
      .build();

  const ct = await client.encrypt(encryptParams);
  const buff = await streamToBuffer(ct);
  return {content: buff, name: filename};
}


//Decrypt the file by creating an object url (for now) and return the stream content
async function decrypt(filedata, userId, asHtml) {

 client = buildClient();
 const decryptParams = new Virtru.Client.VirtruDecryptParamsBuilder()
      .withBufferSource(filedata)
      .build();

 const content = await client.decrypt(decryptParams);
 const buff = await streamToBuffer(content);
 return buff;

}

function getMimeByProtocol(isHtmlProtocol){
  return isHtmlProtocol ? {type: 'text/html;charset=binary'} : {type: 'application/json;charset=binary'};
}

//Encrypt or decrypt the file by using the support functions, depending on the value of the shouldEncrypt flag
async function encryptOrDecryptFile(filedata, filename, shouldEncrypt, userId, completion, asHtml) {
  if (shouldEncrypt) {
    const ext = asHtml ? 'html' : 'tdf';
    const written = await encrypt(filedata, filename, userId, asHtml);
    saveFile(written.content, getMimeByProtocol(asHtml), `${written.name}.${ext}`);
    completion && completion();
  } else {
    const written = await decrypt(filedata, userId, isHtmlProtocol);
    const ext = filename.substr(-4);
    let finalFilename = filename;

    if(ext === ".tdf"){
      finalFilename = finalFilename.replace(ext,"");
    }

    saveFile(written, {type: getMIMEType(written).mime}, finalFilename);
    completion && completion();
  }
}

module.exports = {
  encryptOrDecryptFile
};