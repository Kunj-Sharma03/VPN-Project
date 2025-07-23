# VPN Project

Virtual Private Network software built with Java using OpenSSL.

## How to run the VPN

In order to run the VPN you need to run the ForwardServer class.

You should run the ForwardServer class with specific program arguments:

`# 🚀 VPN Project: When Java Meets the Matrix 

> **Built in collaboration with [Harshan C](https://github.com/Harshana-07) and [Kunj Sharma](https://github.com/Kunj-Sharma03)**  
> *Because who doesn't want to tunnel through the internet like a digital mole? 🕳️*

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![OpenSSL](https://img.shields.io/badge/OpenSSL-721412?style=for-the-badge&logo=openssl&logoColor=white)
![OCR](https://img.shields.io/badge/Tesseract-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 🎭 What the Heck is This?

Ever wanted to create your own VPN but thought "Nah, that's too complicated"? Well, we thought the same thing... and then built it anyway! 😅

This is a **fully-functional Virtual Private Network** implementation that combines:
- **Java backend** (because we're masochists who love verbosity)
- **Electron GUI** (because clicking buttons is easier than remembering command line arguments)
- **OCR functionality** (because why not read text from images while tunneling?)
- **Certificate-based authentication** (trust issues much?)

## 🌟 Features That'll Blow Your Mind

### 🔐 **Security Features**
- **RSA 2048-bit encryption** for handshakes (because 1024 is so 2005)
- **AES encryption** for session data (fast like a caffeinated cheetah)
- **X.509 certificate authentication** (fancy certificates that actually work)
- **Custom CA support** (be your own certificate authority, live the dream!)

### 🖥️ **GUI Features**
- **Electron-based interface** (shiny buttons that actually do things)
- **Real-time connection monitoring** (watch the packets flow like a digital waterfall)
- **OCR text extraction** (because reading text from images is apparently essential for VPN operations... don't ask 🤷‍♂️)
- **Cross-platform compatibility** (works on your toaster if it runs Electron)

### 🛠️ **Developer Features**
- **Clean Java architecture** (OOP done right, mostly)
- **Modular design** (because spaghetti code is only good with marinara)
- **Comprehensive logging** (debug everything, trust nothing)
- **Easy certificate generation** (we've got scripts for that!)

---

## 🚀 Quick Start (Because Nobody Reads Documentation)

### Prerequisites
- **Java 8+** (older than your last relationship)
- **Node.js & npm** (because JavaScript is inevitable)
- **OpenSSL** (for those sweet, sweet certificates)

### Installation
```bash
# Clone this masterpiece
git clone https://github.com/Kunj-Sharma03/VPN-Project.git
cd VPN-Project

# Install GUI dependencies (grab a coffee, this might take a while)
cd gui
npm install

# Build the Java backend (pray to the compiler gods)
cd ..
./build.sh
```

### Running the VPN

#### Option 1: GUI Mode (For Normal Humans)
```bash
cd gui
npm start
```
Click the shiny "Start VPN" button and watch the magic happen! ✨

#### Option 2: Command Line Mode (For Masochists)

**Start the Server:**
```bash
java -cp out server.ForwardServer 
  --handshakeport=2206 
  --usercert=certs/server.pem 
  --cacert=certs/CA.pem 
  --key=certs/serverprivatekey.pem
```

**Start the Client:**
```bash
java -cp out client.ForwardClient 
  --handshakehost=localhost 
  --handshakeport=2206 
  --targethost=localhost 
  --targetport=1337 
  --usercert=certs/client.pem 
  --cacert=certs/CA.pem 
  --key=certs/clientprivatekey.der
```

---

## 🎯 Testing (Because We're Not Savages)

### The Classic Netcat Test
```bash
# Terminal 1: Start a server
nc -l 1337

# Terminal 2: Connect through VPN
nc localhost [CLIENT_FORWARD_PORT]

# Type messages and watch them magically appear on the other side!
```

### OCR Test (Because Why Not?)
1. Take a screenshot with text
2. Use the GUI's OCR feature
3. Watch it extract text like a digital archaeologist

---

## 🔧 Project Structure (For the Curious)

```
VPN-Project/
├── 📁 src/                          # Java source code (the meat and potatoes)
│   ├── 📁 client/                   # Client-side logic
│   ├── 📁 server/                   # Server-side logic
│   ├── 📁 communication/            # The networking magic
│   └── 📁 meta/                     # Utilities and common stuff
├── 📁 out/                          # Compiled Java classes (don't touch!)
├── 📁 gui/                          # Electron GUI (the pretty face)
│   ├── 📄 main.js                   # Main Electron process
│   ├── 📄 index.html                # The beautiful interface
│   └── 📄 ocr-handler.js           # OCR magic happens here
├── 📁 certs/                        # Demo certificates (trust us, bro)
├── 📄 build.sh                      # Build script (your new best friend)
└── 📄 .gitignore                    # What we don't talk about
```

---

## 🛡️ How the Magic Works

### The Handshake Dance 💃
1. **Client says hello** (with certificate, because manners)
2. **Server verifies client** (trust but verify)
3. **Server says hello back** (with its own certificate)
4. **Client verifies server** (paranoia is healthy)
5. **Client requests forwarding** (please tunnel my packets!)
6. **Server sets up session** (generates keys like a cryptographic DJ)
7. **Secure tunnel established** (🎉 party time!)

### The Encryption Flow 🔐
```
[User Data] → [AES Encryption] → [VPN Tunnel] → [AES Decryption] → [Target Server]
```
*It's like putting your data in a digital safe, throwing it through a secure tunnel, and having it arrive perfectly intact on the other side!*

---

## 🎨 Certificates (The Trust Fall Exercise)

### Using Our Demo Certificates (Lazy Mode)
We've included demo certificates so you can test immediately. These are about as secure as a screen door on a submarine, but they work for testing! 🚪

### Generating Your Own Certificates (Paranoid Mode)

**Create your CA (Certificate Authority):**
```bash
openssl req -new -x509 -newkey rsa:2048 -keyout CA.key -out CA.pem -days 365
```

**Generate server certificate:**
```bash
openssl req -out server.csr -new -newkey rsa:2048 -keyout serverprivatekey.pem
openssl x509 -req -in server.csr -CA CA.pem -CAkey CA.key -CAcreateserial -out server.pem -days 365
```

**Generate client certificate:**
```bash
openssl req -out client.csr -new -newkey rsa:2048 -keyout clientprivatekey.pem
openssl x509 -req -in client.csr -CA CA.pem -CAkey CA.key -CAcreateserial -out client.pem -days 365

# Convert to DER format (because Java has opinions)
openssl pkcs8 -nocrypt -topk8 -inform PEM -in clientprivatekey.pem -outform DER -out clientprivatekey.der
```

---

## 🐛 Troubleshooting (When Things Go Wrong)

### Common Issues and Solutions

**"Window won't show up!"**
- We fixed this! The GUI now forces itself to be visible because we're not taking any chances.

**"Certificates are invalid!"**
- Check if you're using the right certificate paths
- Make sure all certificates are signed by the same CA
- Try using our demo certificates first

**"Connection refused!"**
- Check if the server is actually running
- Verify the ports aren't blocked by your firewall
- Make sure you're not connecting to your neighbor's WiFi by mistake

**"OCR isn't working!"**
- Make sure the image has clear, readable text
- Try different languages (we support English and Hindi)
- Accept that OCR is basically digital witchcraft and sometimes just doesn't work

---

## 🤝 Contributing (Join the Madness)

Found a bug? Have a feature request? Want to add support for carrier pigeons? We welcome contributions!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/my-awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/my-awesome-feature`)
5. Open a Pull Request
6. Wait for us to review it (we promise we're not too harsh)

---

## 📜 License

This project is licensed under the "Do Whatever You Want But Don't Blame Us" license. Officially, it's ISC, but the spirit remains the same.

---

## 🎉 Credits & Acknowledgments

**Built with love, caffeine, and questionable life choices by:**
- **[Harshan C](https://github.com/HarshanC)** - The Java wizard who made the backend actually work
- **[Kunj Sharma](https://github.com/Kunj-Sharma03)** - The GUI master who made it look pretty

**Special thanks to:**
- Stack Overflow (our real MVP)
- Coffee ☕ (the fuel of programmers)
- The countless bugs that taught us patience
- Our rubber ducks 🦆 (they're great listeners)

---

## 📞 Support

If you're having issues, check our documentation. If that doesn't help, create an issue on GitHub. If that still doesn't help, have you tried turning it off and on again?

---

<div align="center">

**Made with ❤️ and a healthy dose of sarcasm**

*"It's not a bug, it's a feature!"* - Every programmer ever

[⭐ Star this repo](https://github.com/Kunj-Sharma03/VPN-Project) if it made you smile, even once!

</div>`

These are program arguments for the client:

`--handshakehost=localhost --handshakeport=2206 --targethost=localhost --targetport=1337 --usercert=certs/client.pem --cacert=certs/CA.pem --key=certs/clientprivatekey.der`

## How to test it

Open a netcat listening to the target port specified by the client.

Connect a netcat to the client's forward port that it specifies in the logs of its program after the handshake is complete.

You should then be able to write text between the two netcats.

Test the encryption is working by looking at the ForwardThread file and uncomment the block of code specified in the file.

## Certificates

This program requires that the server's and client's certificates have been signed by the same CA.

Generate the CA certificate and its private key:

`openssl req -new -x509 -newkey rsa:2048 -keyout CAprivatekey.pem -out CA.pem`

Generate the CSR for the client/server:

`openssl req -out client.csr -new -newkey rsa:2048 -keyout clientprivatekey.pem`  

Sign the CSR with the CA:

`openssl x509 -req -in client.csr -CA CA.pem -CAkey CAprivatekey.pem -CAcreateserial -out client.pem`

We also need to convert .pem formatted key to a .der:

`openssl pkcs8 -nocrypt -topk8 -inform PEM -in clientprivatekey.pem -outform DER -out clientprivatekey.der`

## How does it work?

Below is a detailed set of steps breaking down how, using this project, a client and server create a secure communication channel.

The step numbers are referenced in the code at the points where each task is completed. 

1. ClientHello 
    1. the first message the client sends to the server
    2. MessageType = ClientHello
    3. Certificate = client’s x509 certificate (as a string)
2. Server Verifies Client certificate
3. ServerHello (if verified)
    1. MessageType = ServerHello
    2. Certificate = server’s x509 certificate
4. Client verifies server certificate
5. Client requests port forwarding to target host & port
    1. MessageType = forward
    2. TargetHost = server.kth.se (target server)
    3. TargetPort = 6789 (port of server)
6. If server agrees on target, sets up session:
    1. Generate Session Key & IV
    2. Encrypt Session & IV with client's public key (taken from client's cert)
    3. Create socket endpoint, and port number for session communication
7. Server sends client session message
    1. MessageType = session
    2. SessionKey = AES key encrypted with client’s Public Key (as a string)
    3. SessionIV = AES CTR IV, encrypted with …
    4. ServerHost = name of host to which client should connect (address of VPN server)
    5. ServerPort = TCP port which client should connect (VPN Server’s port it has decided on)
8. Client receives session message and knows information for a session, handshake is complete
9. VPN client connects with user
    1. VPN client decides on internal communication host and port for the user
    2. User creates TCP connection with client host and client port
    3. Now data that user sends goes through VPN client, gets encrypted, gets sent to VPN server, gets decrypted and sent to target.
10. Setup of secure communication channel is now complete 
