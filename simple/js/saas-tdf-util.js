const userId = new URL(window.location.href).searchParams.get('userId');
const protocol = new URL(window.location.href).searchParams.get('protocol');

function isHtmlProtocol() { return protocol && protocol.toLowerCase() === 'html'; }


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
  revokePolicy,
  updatePolicy,
  isHtmlProtocol
};
