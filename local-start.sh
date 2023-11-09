#!/bin/bash

# Change to the directory where the script is located
cd "$(dirname "$0")"

# Configure the oracle instant client env variable
export DYLD_LIBRARY_PATH=/Users/sammeester/Documents/cs/304/instantclient_19_8:$DYLD_LIBRARY_PATH

# Start Node application
yarn start
