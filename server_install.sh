#!/bin/bash

# zip the server program
tar cfj nodejs-server.tar.xz nodejs-server

# upload the server program and the setup script to AWS server
scp nodejs-server.tar.xz server_setup.sh server:~/

# decompress the server program
ssh server 'tar xf nodejs-server.tar.xz'
ssh server 'rm ~/nodejs-server.tar.xz'
rm nodejs-server.tar.xz

# execute and delete the setup script
ssh server '~/server_setup.sh'
ssh server 'rm ~/server_setup.sh'
