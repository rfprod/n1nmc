#!/bin/bash

if [ ! -d ~/mongo/ng1nmc ]; then
	mkdir ~/mongo/ng1nmc
	echo 'created directory for mongodb'
else
	echo 'directory for mongodb exists'
fi
