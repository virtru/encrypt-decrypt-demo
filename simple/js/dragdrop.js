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

let fetchedPolicy;
let fetchedPolicyBuilder;

let revokeInProgress = false;
let updateInProgress = false;
let shouldEncrypt = true;

const revokeButton = getById('revokePolicyButton');
const updateButton = getById('updatePolicyButton');
const removeUserButton = getById('removeUserButton');
const addUserButton = getById('addUserButton');
const moreButton = getById('moreButton');
const addUserInput = getById('addUserInput');
const disableReshareInput = getById('checkReshareDisabled');
const enableExpirationInput = getById('checkExpirationEnabled'); // eslint-disable-line no-unused-vars
const datePicker = getById('datepicker');
const userList = getById('userList');

const userManagementTab = getById('user_tab');
const userManagementArea = getById('policy_manager_user_container');
const controlsManagementTab = getById('controls_tab');
const controlsManagementArea = getById('policy_manager_controls_container');

// Load a default user string
function setDefaultUserListText() {
  userList.innerHTML = '<option value="default">No users (except owner)</option>';
}

function setLoggedInUserLabel() {
  getById('loggedInUserLabel').innerHTML = getUser();
}

function setupLogoutButton() {
  getById('logoutButton').addEventListener('click', logout);
}

// UI function
function setupDragoverEvent(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}

// Convert the date that comes from the picker to what's needed for the policy (utc)
function convertPickerDateFormatToUTC(date) {
  // return new Date(date).toISOString();
  return `${date}T11:59:59.000Z`;
}

// Format the date back to what's required for the date picker
function convertUTCToPickerDateFormat(date) {
  // return moment(date).format("YYYY-MM-DDTkk:mm");
  return moment(date).format('YYYY-MM-DD');
}

// From the fetched policy, extract the expiration date (if one already exists)
function getExpirationDateFromFetchedPolicy() {
  return fetchedPolicy && fetchedPolicy.getExpirationDeadline();
}

// Process a single file, and encrypt or decrypt it by passing the 'shouldEncrypt' toggle flag
function processFile(fileOb, completion) {
  const reader = new FileReader();
  const filename = fileOb.name;

  reader.onload = async () => {
    try {
      await encryptOrDecryptFile(reader.result, filename, shouldEncrypt, completion);
    } catch (err) {
      console.error(err);
      if (!shouldEncrypt) {
        alert('An error occurred attempting to decrypt this file. Please be sure you have access to do so.');
      } else {
        alert('An error occurred attempting to encrypt this file. Please be sure you have authenticated, and try again.');
      }
    }
  };

  reader.readAsArrayBuffer(fileOb);
}

// UI function
function addUserToList(user) {
  const userOption = document.createElement('option');
  userOption.text = user;
  userOption.value = user;
  userList.add(userOption);
  if (userList.options[0].value === 'default') {
    userList.options[0].remove(0);
  }
}

// UI function
function toggleRemoveUserButton(enabled) {
  if (!enabled) {
    removeUserButton.className = 'remove_user_button_disabled';
    removeUserButton.removeEventListener('click', removeUser);
  } else {
    removeUserButton.className = 'remove_user_button';
    removeUserButton.addEventListener('click', removeUser);
  }
}

// Removes a user from the in-memory list
function removeUserFromList() {
  userList.remove(userList.selectedIndex);

  if (userList.length === 0) {
    setDefaultUserListText();
    toggleRemoveUserButton(false);
  }
}

// Removes the selected user from the policy in-memory
function removeUser() {
  const userToRemove = userList.value;
  fetchedPolicyBuilder.removeUsersWithAccess(userToRemove);
  removeUserFromList(userToRemove);
}

// Adds the user to the policy in-memory that is created using the text input
function addUser() {
  const userToAdd = addUserInput.value ? addUserInput.value.trim() : null;
  if (!userToAdd) {
    alert('You must provide an email address of a user to add to the policy');
    return;
  }
  fetchedPolicyBuilder.addUsersWithAccess(userToAdd);
  addUserToList(userToAdd);
  toggleRemoveUserButton(true);
  addUserInput.value = '';
}

// UI function
function toggleAddUserButton(enabled) {
  if (!enabled) {
    addUserButton.className = 'add_user_button_disabled';
  } else {
    addUserButton.addEventListener('click', addUser);
    addUserButton.className = 'add_user_button';
  }
}

// UI function
function populateUserList(users) {
  let userAdded = false;
  users.forEach((user) => {
    if (user !== getUser()) {
      addUserToList(user);
      userAdded = true;
    }
  });

  if (!userAdded) {
    setDefaultUserListText();
    toggleRemoveUserButton(false);
  }
}

/* eslint-disable no-unused-vars */

// When the user drags over the encrypt region
function handleEncryptDragOver(evt) {
  shouldEncrypt = true;
  setupDragoverEvent(evt);
}

// When the user drags over the decrypt region
function handleDecryptDragOver(evt) {
  shouldEncrypt = false;
  setupDragoverEvent(evt);
}

// When the user drags over the policy edit region
function handleViewDragOver(evt) {
  setupDragoverEvent(evt);
}

// Recursively process multiple files
function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  const allFiles = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;

  const processFiles = (files, indx) => {
    if (indx >= files.length) return;

    processFile(files[indx], () => {
      processFiles(files, ++indx);
    });
  };

  forceLoginIfNecessary();

  processFiles(allFiles, 0);
}

// Allows the drag and drop functionality to first load the file's policy, and populate elements
function handleFileViewer(evt) {
  evt.stopPropagation();
  evt.preventDefault();

  const files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;
  const file = files[0];

  const reader = new FileReader();
  const filename = file.name;

  reader.onload = async (e) => {
    try {
      client = buildClient();

      const decParams = new Virtru.DecryptParamsBuilder()
        .withArrayBufferSource(reader.result)
        .build();

      const uuid = await client.getPolicyId(decParams);
      fetchedPolicy = await client.fetchPolicy(uuid);
      fetchedPolicyBuilder = fetchedPolicy.builder();
      togglePolicyElements(true);
      populateUserList(fetchedPolicy.getUsersWithAccess());
      getById('editingPolicyText').innerHTML = 'Editing Policy';
    } catch (err) {
      console.error(err);
      alert('An error occurred in trying to read this policy. Please be sure you are the policy owner.');
    }
  };

  reader.readAsArrayBuffer(file);
}

/* eslint-enable no-unused-vars */

// UI function
function toggleRevokeButton(enabled) {
  if (!enabled) {
    revokeButton.className = 'policy_revoke_button_disabled';
    revokeButton.removeEventListener('click', revoke);
  } else {
    revokeButton.className = 'policy_revoke_button';
    revokeButton.addEventListener('click', revoke);
  }
}

// Revokes the policy by calling the revoke endpoint
async function revoke() {
  if (revokeInProgress) return;

  if (!confirm('This will remove access for all users (except the Policy Owner). Continue?')) return; // eslint-disable-line no-restricted-globals

  toggleRevokeButton(false);
  const revokeButtonContent = revokeButton.innerHTML;
  revokeButton.innerHTML = 'Revoking...';
  revokeInProgress = true;
  await revokePolicy(fetchedPolicy.getPolicyId());
  toggleRevokeButton(true);
  revokeButton.innerHTML = revokeButtonContent;
  revokeInProgress = false;
}

// Updates the policy by calling the update endpoint
async function update() {
  if (updateInProgress || !validateAndSetDatePickerSelection()) return;

  toggleUpdateButton(false);
  const updateButtonContent = updateButton.innerHTML;
  updateButton.innerHTML = 'Updating...';
  updateInProgress = true;

  forceLoginIfNecessary();

  await updatePolicy(fetchedPolicyBuilder);
  toggleUpdateButton(true);
  updateButton.innerHTML = updateButtonContent;
  updateInProgress = false;
}

// Ensures that the date that is selected before an update is complete, otherwise stop the update
function validateAndSetDatePickerSelection() {
  // If a user selects they want an expiration, try to set it on the policy
  if (checkExpirationEnabled.checked) {
    if (!datePicker.value) {
      alert('You have selected to use an expiration date, but have not chosen a complete date and time selection');
      return false;
    }
    fetchedPolicyBuilder.enableExpirationDeadline(convertPickerDateFormatToUTC(datepicker.value));
  } else {
    // No expiration is selected, so remove it from the policy
    fetchedPolicyBuilder.disableExpirationDeadline();
  }

  return true;
}

// UI function
function toggleUpdateButton(enabled) {
  if (!enabled) {
    updateButton.className = 'policy_update_button_disabled';
    updateButton.removeEventListener('click', update);
  } else {
    updateButton.className = 'policy_update_button';
    updateButton.addEventListener('click', update);
  }
}

// Initialize the date picker using the expiration date from the fetched policy (if one exists)
function initializeDatePicker() {
  const dateFromPolicy = getExpirationDateFromFetchedPolicy();
  if (checkExpirationEnabled.checked || dateFromPolicy) {
    datePicker.className = 'datepicker';
    if (dateFromPolicy) {
      datePicker.value = convertUTCToPickerDateFormat(dateFromPolicy);
    }
  }
}

// Initialize the reshare checkbox with what's in the fetched policy (if one exists)
function initializeReshareClickCheckbox() {
  const resharePresent = fetchedPolicy && !fetchedPolicy.hasReshare();
  checkReshareDisabled.checked = resharePresent;
}

// UI function for the 'More' policy edit region
function initializeMoreButton() {
  moreButton.addEventListener('click', () => {
    const row = document.getElementsByTagName('tr')[1];
    row.style.visibility = 'visible';
    const expandClass = 'expandmore';
    const compressClass = 'compressmore';
    moreButton.value = moreButton.value.includes('More') ? 'Less' : 'More';
    if (!(row.className === expandClass || row.className === compressClass)) {
      row.className = expandClass;
    } else {
      row.className = row.className === compressClass ? expandClass : compressClass;
    }
  });
}

// UI function
function toggleDatePicker() {
  if (!checkExpirationEnabled.checked) {
    datePicker.className = 'datepicker_disabled';
  } else {
    datePicker.className = 'datepicker';
  }

  datePicker.disabled = !checkExpirationEnabled.checked;
}

// UI function
function toggleReshareCheckbox(enabled) {
  disableReshareInput.disabled = !enabled;
  document.addEventListener('click', () => {
    if (fetchedPolicy) {
      if (disableReshareInput.checked) {
        fetchedPolicyBuilder.disableReshare();
      } else {
        fetchedPolicyBuilder.enableReshare();
      }
    }
  });
}

// UI function
function toggleExpirationCheckbox(enabled) {
  checkExpirationEnabled.disabled = !enabled;
  checkExpirationEnabled.checked = getExpirationDateFromFetchedPolicy() || false;
  document.addEventListener('click', toggleDatePicker);
}

// Toggle the UI elements off and on - perfect for first loading
function togglePolicyElements(enabled) {
  toggleRevokeButton(enabled);
  toggleUpdateButton(enabled);
  toggleRemoveUserButton(enabled);
  toggleAddUserButton(enabled);
  toggleAddUserInput(enabled);
  toggleUserList(enabled);
  toggleReshareCheckbox(enabled);
  toggleExpirationCheckbox(enabled);
  initializeDatePicker();
  initializeReshareClickCheckbox();
  initializeMoreButton();
}

// UI function
function setUpTabs() {
  userManagementTab.addEventListener('click', activateUsersTab);
  controlsManagementTab.addEventListener('click', activateControlsTab);
}

// UI function
function disableAllTabs() {
  deactivateTab(userManagementArea, userManagementTab);
  deactivateTab(controlsManagementArea, controlsManagementTab);
}

// UI function
function activateUsersTab() {
  disableAllTabs();
  activateTab(userManagementArea, userManagementTab);
}

// UI function
function activateControlsTab() {
  disableAllTabs();
  activateTab(controlsManagementArea, controlsManagementTab);
}

// UI function
function activateTab(containerEl, tabEl) {
  tabEl.className += ' active';
  containerEl.style.display = 'block';
  containerEl.className += ' active';
}

// UI function
function deactivateTab(containerEl, tabEl) {
  tabEl.className = tabEl.className.replace(' active', '');
  containerEl.style.display = 'none';
  containerEl.className = containerEl.className.replace(' active', '');
}

// UI toggle function
function toggleUserList(enabled) {
  userList.disabled = !enabled;
}

// UI toggle function
function toggleAddUserInput(enabled) {
  if (!enabled) {
    addUserInput.className = 'text_input_disabled';
  } else {
    addUserInput.className = 'text_input';
  }

  addUserInput.disabled = !enabled;
}

// Initialize the elements and tabs as needed
function init() {
  forceLoginIfNecessary();
  togglePolicyElements(false);
  setUpTabs();
  activateUsersTab();
  setLoggedInUserLabel();
  setupLogoutButton();
}

init();
