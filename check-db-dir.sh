#!/bin/bash

if [ ! -d ~/mongo ]; then
	mkdir ~/mongo
	echo 'created directory for mongo databases'
else
	echo 'directory for mongo database exists'
fi

if [ ! -d ~/mongo/ng1nmc ]; then
	mkdir ~/mongo/ng1nmc
	echo 'created directory for app database'
else
	echo 'directory for app database exists'
fi
