#! /usr/bin/bash

USER=`whoami`
TARGET=node
APP=jantac
 
pids=(`ps -ef | \
      grep ${USER} | \
      grep ${TARGET} | \
      grep ${APP} | \
      grep -v grep | \
      awk '{ print $2; }'`)
 
for pid in ${pids[*]}
do
  kill -9 ${pid}
done
