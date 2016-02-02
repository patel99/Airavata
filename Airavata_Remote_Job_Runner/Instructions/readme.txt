1st project milestone:Instructions on How to Run The Remote Job Execution

There are two ways you can execute remote job execution module of this project.

Clone the source code to your local repository, then use Eclipse or other IDE to run the main class.
Main class for remote job execution is: com.teamAlpha.airavata.facade.Main
You will still have to customize user_input.properties file to successfully run the code. This file is present in 'props' folder.[More details about what is to be customized in properties file is listed later in this document]
You can run pre-built jar file using 'java -jar .jar'
In this case you will have to copy the props folder to the folder where you have saved the jar file.
Then customize user_input.properties file.
Instructions on customizing user_input.properties file:

User Inputs : Below are the fields expected from users.

private.key.path=path to the private key for which ssh is configured
private.key.passphrase=pass phrase for the key if set
user.name=username
user.job.file.path=path to the directory where job file is kept
user.job.file.name=job file name
user.job.remotefile.path=path to the directory on the server
retry.time.interval=time interval for successive request to monitor job status(milliseconds)
default.retry.attempts=default number of attempts (changes as per the required time provided by the server) 

##SAMPLE##
######################################################################
private.key.path=F:\\IUB\\Semester2\\SGA\\putty_private_key.ppk
private.key.passphrase=Ajinkya123$
user.name=adhamnas
user.job.file.path=F:\\IUB\\Semester2\\SGA\\
user.job.file.name=mpi_hello.c
user.job.remotefile.path=/N/dc2/scratch/adhamnas/job-submission
retry.time.interval=20000
default.retry.attempts=15
######################################################################

