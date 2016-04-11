#!/bin/bash
service postgresql status
if [ "$?" -gt "0" ]
 then
        sudo apt-get -y update
        sudo apt-get -y install postgresql-client postgresql postgresql-contrib
        sudo -u postgres psql postgres -a -f /opt/scripts/airavata_ddl_20160321.sql
        sudo -u postgres psql postgres -a -f /opt/scripts/airavata_dml_20160321.sq
 fi

