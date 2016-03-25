package com.teamAlpha.airavata.utils;

public class Constants {

	
	
	public final static String CMD_CD="cd";
	public final static String CMD_QSUB="qsub";
	public final static String CMD_QSTAT="qstat";
	public final static String CMD_QDEL="qdel";
	public final static String CMD_D2U="dos2unix";
	public final static String CMD_MPICC="mpicc";
	public final static String CMD_CAT="cat";
	public final static String JOB_GROMAC="gromacs.job";	
	public final static int PBS_JOB_CODE = 0;
	public final static int LAMMPS_JOB_CODE = 1;
	public final static int GROMACS_JOB_CODE = 2;
	public static String PBS_CONTENT = "#!/bin/bash \n"
			+ "#PBS -l nodes=%1$s:ppn=%2$s \n"
			+ "#PBS -l walltime=%3$s \n"
			+ "cd %4$s \n"
			+ "mpirun -n %5$s %6$s \n";
	
	public static String LAMMPS_CONTENT = "#!/bin/bash \n"
			+ "#PBS -l nodes=%1$s:ppn=%2$s \n"
			+ "#PBS -l walltime=%3$s \n"
			+ "module load intel \n"
			+ "module load openmpi/intel \n"
			+ "module load lammps \n"
			+ "cd %4$s \n"
			+ "mpirun -np %5$s lmp_openmpi -suffix omp < %6$s \n";
	public static String GROMACS_CONTENT = "#!/bin/bash \n"
			+ "#PBS -k o \n"
			+ "#PBS -l nodes=%1$s:ppn=%2$s \n"
			+ "#PBS -l walltime=%3$s \n"
			+ "#PBS -N gromacs.job \n"
			+ "module load openmpi/intel/1.6.3 gromacs/intel/4.6.5 \n"
			+ "cd %4$s \n"
			+ "mpirun -hostfile $PBS_NODEFILE -np %5$s mdrun_mpi -nice 0 -v -deffnm %6$s -c %7$s\n";
}
