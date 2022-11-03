# Virtru Developer Hub Drag and Drop Demo

![Drag and Drop](https://files.readme.io/43813ab-Screen_Shot_2019-02-14_at_2.33.59_PM.png)

The Drag and Drop Demo leverages the [Virtru SDK for JavaScript](https://docs.developer.virtru.com/js/latest/index.html) as well as the [TDF Architecture](https://developer.virtru.com/docs/tdf-overview) in order to secure files and share them with others, while maintaining visibility and control of your data.

This demo showcases features such as:

- Securing a file such that only intended recipients can access its data
- Revoking access to a secured file, so users can no longer access its data
- Decrypting an encrypted file by an authorized user 

And uses the following technology:

- Virtru SDK for JavaScript
- Virtru Auth Widget
- A Virtru Hosted Key Access Server (KAS)
- A Virtru Hosted Entity Attribute Server (EAS)

## See it Live

[Go here](https://demos.developer.virtru.com/dd/) to test drive the live demo. Afterwards, check the out Virtru's [Developer Hub](https://developer.virtru.com/docs/share-track) for a step-by-step guide on how it all works.

## How it Works

### Authenticating

You'll be taken to the demo's login screen. Click 'Start', and log in with your Google, Outlook or Office365 account. If you have neither, you can enter your email address to receive a 8-digit code, e.g., `V-12345678`. 

### Encrypting and Decrypting Files

Once logged in, you should see two drag and drop areas for encrypting and decrypting TDF files.

#### Encrypting

When a file is dropped onto the encrypt region it will be encrypted using Virtru's infrastructure (its Key Access Server and Entity Attribute Server). Once encrypted, the file (as a `.tdf`) will be downloaded to your default download location.

#### Decrypting

Similar to encryption, when a previously encrypted `.tdf` file is dropped onto the decrypt region it will be decrypted using Virtru's Key Access Server. Once the decryption has taken place, the decrypted file (without the `.tdf` extension) will be downloaded to your default download location.

## Run it Locally

This demo can run on your local environment. Please ensure you meet the prerequisites and follow the steps.

### Prerequisites

To be able to use Federated OAuth we suggest you to modify your `/etc/hosts`. This is an optional step, but note the fallback authentication will be email code only.

#### Windows

- Install a POSIX-compatible environment such as [Cygwin](https://www.cygwin.com/) or [Cmder](https://cmder.net/)
- Install [NVM](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows)
- Edit `c:\Windows\System32\Drivers\etc\hosts` to include `127.0.0.1 local.virtru.com`

Alternatively you could install [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) and use the instructions below for Linux

#### Linux / MacOS

- Install [NVM](https://github.com/nvm-sh/nvm#installation-and-update)
- Edit `/etc/hosts` to include `127.0.0.1 local.virtru.com`

### Getting Started

```console
# Clone the repository
$ git clone git@github.com:virtru/encrypt-decrypt-demo.git

# Change directory
$ cd encrypt-decrypt-demo

# Install node via NVM
$ nvm use

# Install node modules
$ npm ci

# Start the node server
$ npm start
```

If running successfully, you can now visit `https://local.virtru.com`.

---

You may be presented with a warning screen with a message similar to "Your connection is not private." This is due to the self-signed SSL certificate when running in development mode. To access the demo:

- Chrome: Click `Advanced` then `Proceed to local.virtru.com (unsafe)`
- Firefox: Click `Advanced` then `Accept the Risk and Continue`
- Safari: Click `Show Details` then `visit this website`
- Opera: Click `Help me understand` then `Proceed to local.virtru.com (unsafe)`

#### Stop the Server

In order to stop the running local server hosting `local.virtru.com`, go to the running Node server in the terminal hold the `ctrl` then press `c`.

## Getting Help

There are many ways to get our attention. 

* If you found a bug or have a feature request, please use [Github Issues](https://github.com/virtru/encrypt-decrypt-demo/issues). 
* You can [join](https://docs.google.com/forms/d/e/1FAIpQLSfCx5tSl9hGQSZ-H-ZIzNw6uWIPN3_HSpMtYssKQ9jytj9yQQ/viewform) Virtru's Developer Hub Community Slack channel to get your questions answered.
* You can get support [here](https://support.virtru.com/hc/en-us/requests/new?ticket_form_id=360001419954)


### License

Copyright © 2019 Virtru Corporation

This repository is released under the MIT license for all artifacts in this repository, with the following exceptions which are subject to our [Virtru Data Protection Platform Subscription Agreement](https://www.virtru.com/terms-of-service/):

- virtru-sdk
