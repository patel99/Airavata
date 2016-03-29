User Inputs :
Below are the fields expected from users.

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