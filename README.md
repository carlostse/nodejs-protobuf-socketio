### Server Setup ###
Add the config below in ~/.ssh/config

```
Host server
  hostname ec2-xxx-xxx-xxx-xxx.ap-southeast-1.compute.amazonaws.com
  user ubuntu
  identityFile ~/.ssh/xxx.pem
```

Run `server_install.sh` to install the server program in AWS
```
$ ./server_install.sh
```

The installation script is designed for Ubuntu, tested with 14.04.2 LTS.

The script will download and install node.js v0.12.2 x64.

Also, it will install g++ and python to compile the Google Protocol Buffers 2.6.1 and its node.js binding.

### Generate Protocol Buffers Classes ###
```
$ ./generate_protobuf.sh
```