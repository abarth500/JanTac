#! /usr/bin/bash


PREFIX=%%%PREFIX%%%

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
#	jake -f ./Jakefile "server:configure path=/jantac"
fi
jake -f ./Jakefile "server:install"
find ${PREFIX} -type f -print | xargs chmod 644
find ${PREFIX} -type d -print | xargs chmod 755
 
cd ${PWD}/${1%/*}
cd ..
cd ${PREFIX}/node
node jantac.js&