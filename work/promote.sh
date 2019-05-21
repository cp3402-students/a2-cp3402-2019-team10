#!/bin/bash

#################
# Setup Section #
#################
TEMP_DIR=`mktemp -d`  # Create a temporary directory and save its name for later use
cd ${TEMP_DIR}


##################
# Config Section #
##################
SERVER_ROOT=/var/www/html
STAGING_DIR=staging
STAGING_DB=staging
PROD_DIR=wp
PROD_DB=wp
DB_USER=cp3402
DB_PASSWD=CoffeeCan.3402
SAMPLE_DB_CONTENT=sample_content.sql

#################################################
# CHANGE NOTHING BELOW THIS LINE!
#################################################

#
# Copy all wordpress content files
# from staging to production 
printf "Copying wp_content from staging to production\n"
( cd ${SERVER_ROOT}/${STAGING} ; tar cf - wp_content ) | ( cd  ${SERVER_ROOT}/${PROD_DIR} ; tar xf - )


#
# Dump Current Database 
#
printf "Dumping staging database for promotion to production\n"
/usr\bin/mysqldump ${STAGING_DB} -u${DB_USER} -p${DB_PASSWD} > DB_DUMP.sql 2> DB_DUMP.err >> DB_IMPORT.log 2>&1

printf "Importing freshly dumped staging database into production\n"
printf "\n##################\nImport fresh staging database at `date` \n##################\n" >> DB_IMPORT.log 2>&1
/usr/bin/mysql ${PROD_DB} -u${DB_USER} -p${DB_PASSWD} < DB_DUMP.sql >> DB_IMPORT.log 2>&1

if [ -f "${SERVER_ROOT}/staging/content.sql" ]; then
    #
    # Import Sample Content (possibly from other databases)
    # or arbitrary SQL statements as required.
    #
    printf "Importing sample content into production\n"
    printf "\n##################\nImport sample content at `date` \n##################\n" >> DB_IMPORT.log 2>&1
    /usr/bin/mysql ${PROD_DB} -u${DB_USER} -p${DB_PASSWD} < DB_DUMP.sql >> DB_IMPORT.log 2>&1
fi


#
# Edit database's stored paths and URLs
#
printf "Editing the production database's stored URLs and paths\n"
printf "\n##################\nEdit stored paths and URLs at `date` \n##################\n" >> DB_IMPORT.log 2>&1
mysql ${PROD_DB} -u${DB_USER} -p${DB_PASSWD} << END_INLINE_SQL >> DB_IMPORT.log 2>&1
--
UPDATE wp_options 
  SET option_value='http://notdotcom.fun/prod/' 
  WHERE option_name='siteurl';
--
UPDATE wp_options 
  SET option_value='http://notdotcom.fun/prod/' 
  WHERE option_name='home';
END_INLINE_SQL 


