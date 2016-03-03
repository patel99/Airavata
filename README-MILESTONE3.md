Wiki Link - https://github.com/airavata-courses/TeamAlpha/wiki/3.-Project-Milestone-3:-Details-and-Instructions

Instructions for Milestone-3 execution:

PostgreSQL is needed to setup the database. The scripts are provided in db scripts folder. 
We need to install tomcat and run server on localhost.
localhost:8080/Airavata_Remote_Job_Runner/login.htm

User Inputs : Below are the fields expected from users.

Property File:
private.key.path=path to the private key for which ssh is configured
private.key.passphrase=pass phrase for the key if set
user.name=username
user.job.file.path=path to the directory where job file is kept
user.job.file.name=job file name
user.job.remotefile.path=path to the directory on the server
retry.time.interval=time interval for successive request to monitor job status(milliseconds)
default.retry.attempts=default number of attempts (changes as per the required time provided by the server) 

Login details: 
id: airavata
password: aaa

Implementation Details:

Password is hashed and stored in database. We have implemented spring security for user management and for secure communication we used SSL.

To make use of SSL server.xml file of the tomcat server need to be updated.
We need to add following connector to the file.\n
&lt;Connector SSLEnabled="true" clientAuth="false" keystoreFile="path to keystore file" keystorePass="airavata" maxThreads="150" port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol" scheme="https" secure="true" sslProtocol="TLS"/&gt;

Creating keystore:
(Windows)"%JAVA_HOME%\bin\keytool" -genkey -alias tomcat -keyalg RSA
  -keystore \path\to\my\keystore
(Linux) $JAVA_HOME/bin/keytool -genkey -alias tomcat -keyalg RSA
  -keystore /path/to/my/keystore
/path/to/my/keystore should be same as the one given in server.xml file.

Once logged in, the user can see all the submitted jobs list and their status. 
To submit a new job, user has to click on Create Job and supply the input fields and upload job file in case of PBS job
The newly submitted job would be added to the data table and once it is complete, the output files (either error or output file) will be available for download. Output file is downloaded if the job executes successfully and error file would be downloaded in case the job did not execute properly.

If the user does not perform any activity after log in for over 20 mins, the session ends and the account is logged out.

Only single user session is allowed, if the user tries to log in from another system while one session is active, he would be logged out from the previous session

Future development:

Next milestone we will have database for all submitted jobs. As of now only jobs whose status is available on server are displayed in datatable. Next time we will have details of all submitted jobs since the beginning.
Currently we have not added any validations for file upload. Next time we will have validations on type of file to be uploaded.
The output file names are hardcoded as of now. We will append job ids for the same once we maintain database.


Please provide us all the parameters for user input properties mentioned above. We will update the same on github so that you will not need to make any changes and would be convenient for you to just take check out and execute.

