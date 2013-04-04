#! /usr/bin/bash

if [ -e ~/jantac-git ]; then
	rm -rf ~/jantac-git
fi
AllNew=false
if [ ! -e ~/jantac ]; then
	AllNew=true
	mkdir ~/jantac
fi
git clone --depth 1 git://github.com/abarth500/JanTac.git ~/jantac-git
cp -rf ~/jantac-git/* ~/jantac
rm -rf ~/jantac-git
cd ~/jantac
if $AllNew ; then
	jake -f ./Jakefile "server:configure"
fi
jake -f ./Jakefile "server:install[/jantac]"
find /jantac -type f -print | xargs chmod 644
find /jantac -type d -print | xargs chmod 755
 
cd /jantac/node
node jantac.js&