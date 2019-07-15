const userId = new URL(window.location.href).searchParams.get('userId');
const protocol = new URL(window.location.href).searchParams.get('protocol');

//Get the mimetype from the file data
function getMIMEType(filedata) {
  let typeOb = fileType(filedata);

  if (!typeOb) {
    const arr = (new Uint8Array(filedata)).subarray(0, 4);
    let header = '';
    for (let i = 0; i < arr.length; i++) {
      header += arr[i].toString(16);
    }

    //Using mimetype magic numbers, find any types that the fileType module may have missed
    switch (header) {
      case '7b227061':
        typeOb = {mime: 'html/text', ext: 'txt'};
        break;
      default:
        typeOb = {mime: 'unknown', ext: 'unknown'};
    }
  }

  return typeOb;
}

//Save the file locally as a download
function saveFile(filedata, type, filename) {
  const blob = new Blob([filedata], type);
  saveAs(blob, filename);
}

function isHtmlProtocol() { return protocol && protocol.toLowerCase() === 'html'; }


//Extract the policy from the TDF file to be used in updates
async function readPolicyFromTDF(filedata, completion) {
  const url = window.URL.createObjectURL(new Blob([filedata], {type: 'application/zip'}));
  const policy = await TDF.getPolicyFromRemoteTDF(url);
  return policy;
}

//Fetch the policy from ACM
async function fetchPolicy(uuid) {

  forceLoginIfNecessary();
  const client = buildClient();

  const policy = await client.fetchPolicy(uuid);
  return policy;
}

//Revoke the policy by its UUID
async function revokePolicy(uuid) {

  forceLoginIfNecessary();
  const client = buildClient();

  await client.revokePolicy(uuid);
}

//Update the policy by its UUID
async function updatePolicy(policy) {

  forceLoginIfNecessary();
  const client = buildClient();

  await client.updatePolicy(policy.build());
}


module.exports = {
  getMIMEType,
  saveFile,
  readPolicyFromTDF,
  revokePolicy,
  fetchPolicy,
  updatePolicy,
  isHtmlProtocol
};
