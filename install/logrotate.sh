#!/bin/sh

date=`/usr/bin/date +"%Y%m%d"`
logs=$*

for log in ${logs}; do
 if [[ ${#log} -gt 0 && -e ${log} ]]; then
  copy_log=${log}.${date}

  if [ ! -e ${copy_log}.gz ]; then
   cp ${log} ${copy_log}
   gzip ${copy_log}
   echo -n > ${log}
  fi
 fi
done
