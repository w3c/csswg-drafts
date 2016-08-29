#!/bin/bash

function error_exit
{
  echo -e "\e[01;31m$1\e[00m" 1>&2
  exit 1
}

echo "Installing bikeshed dependencies..."
sudo apt-get install python2.7 python-dev libxslt1-dev libxml2-dev || error_exit "Error installing Python and dependencies"
sudo pip install lxml || error_exit "Error installing pip libxml"
sudo pip install lxml --upgrade || error_exit "Error upgrading libxml"
sudo pip install pygments || error_exit "Error installing Pygments"

cd ..

echo "Cloning and installing bikeshed..."
git clone https://github.com/tabatkins/bikeshed.git bikeshed || error_exit "Error cloning bikeshed"

sudo pip install --editable bikeshed || error_exit "Error installing bikeshed"

bikeshed/bikeshed.py update || error_exit "Error updating bikeshed"
