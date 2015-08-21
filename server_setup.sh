#!/bin/bash

# install node.js
curl http://nodejs.org/dist/v0.12.2/node-v0.12.2-linux-x64.tar.gz | gzip -dc | tar -x
sudo mv node-v0.12.2-linux-x64 /opt
sudo ln -s /opt/node-v0.12.2-linux-x64 /opt/node
sudo ln -s /opt/node/bin/node /usr/bin/node
sudo ln -s /opt/node/bin/npm /usr/bin/npm

# install dependencies
sudo apt-get update
sudo apt-get -y install g++ make python

# install protocol buffers
curl -L https://github.com/google/protobuf/releases/download/v2.6.1/protobuf-2.6.1.tar.gz | gzip -dc | tar -x
cd protobuf-2.6.1
./configure
make
sudo make install
sudo ldconfig
cd
rm -rf protobuf-2.6.1

# install server dependencies
cd nodejs-server
npm install
