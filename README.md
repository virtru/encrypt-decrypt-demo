# Virtru Developer Platform Drag and Drop Demo

## What is this?

This project represents an example of how to use Virtru Developer Platform to encrypt and decrypt files. This uses:

* Virtru JavaScript SDK
* A Vitru Hosted Key Access Server (KAS)
* A Vitru Hosted Entity Attribute Server (EAS)

## Setup Requirements

Before you can successfully build and run this JS example, please be sure you have met the following pre-reqs:

* Node/NPM - Node and NPM are both requirements to build and run the example
* If you plan to run this locally, in your local `/etc/hosts` file, ensure you have the following added: `127.0.0.1 	local.virtru.com`. This will enable `local.virtru.com` hosting from your local machine.
* If you are running this example locally from a Windows machine, please ensure you use a POSIX-compatible environment such as [Cygwin](`https://www.cygwin.com/`).

## Clone

After [setting up Git](https://help.github.com/en/articles/set-up-git) on your local machine, clone this repository. From a command line interface:

1. Change to the desired directory

```console
foo@bar:~$ cd my-projects 
```

2. Clone this repository

```console
foo@bar:~$ git clone git@github.com:virtru/encrypt-decrypt-demo.git
foo@bar:~$ cd encrypt-decrypt-demo
```

## Running the Demo

1. From within the project, issue the following from a command prompt:

```console
foo@bar:~$ npm run setup
```

2. Now build and start the server:

```console
foo@bar:~$ npm run start
```

Navigate to https://local.virtru.com/ in your browser. On Chrome you may need to allow access because the certificate the demo uses is self-signed. To do this, just click on the "Advanced" button and then click the link "Proceed to local.virtru.com (unsafe)".

You'll be taken to the demo's login screen. Click 'Start', and log in with your Google, Outlook or Office365 account. If you have neither, you can enter your email address to receive a 8-digit code, e.g., `V-12345678`. 

Once logged in, you should see two drag and drop areas for encrypting and decrypting TDF files.

## Encrypting and Decrypting Files

### Encrypting

When a file is dropped onto the encrypt region it will be encrypted using Virtru's infrastructure (its Key Access Server and Entity Attribute Server). Once encrypted, the file (as a `.tdf`) will be downloaded to your default download location.

### Decrypting

Similar to encryption, when a previously encrypted `.tdf` file is dropped onto the decrypt region it will be decrypted using Virtru's Key Access Server. Once the decryption has taken place, the decrypted file (without the `.tdf` extension) will be downloaded to your default download location.

## Stop the Server

In order to stop the running local server hosting `local.virtru.com`, go to the running Node server in the terminal and enter Ctrl^C.

## Where can I get more info?

If you want more info on this demo or want to learn more about Virtru's Developer Platform, please go to [Virtru Developer Platform Documentation](https://developer.virtru.com/). More information on this demo can be found [here](https://developer.virtru.com/docs/demo).




