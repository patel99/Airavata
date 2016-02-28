package com.teamAlpha.airavata.utils;

public class Constants {

	
	
	public final static String CMD_CD="cd";
	public final static String CMD_QSUB="qsub";
	public final static String CMD_QSTAT="qstat";
	public final static String CMD_QDEL="qdel";
	public final static String CMD_D2U="dos2unix";
	public final static String CMD_MPICC="mpicc";
	public final static String CMD_CAT="cat";
	public final static int PBS_JOB_CODE = 0;
	public final static int LAMMPS_JOB_CODE = 1;
	public static String PBS_CONTENT = "#!/bin/bash \n"
			+ "#PBS -l nodes=%1$s:ppn=%2$s \n"
			+ "#PBS -l walltime=%3$s \n"
			+ "cd %4$s \n"
			+ "mpirun -n %5$s %6$s \n";
	
	public static String LAMMPS_CONTENT = "#!/bin/bash \n"
			+ "#PBS -l nodes=%1$s:ppn=%2$s \n"
			+ "#PBS -l walltime=%3$s \n"
			+ "module load intel"
			+ "module load openmpi/intel"
			+ "module load lammps"
			+ "cd %4$s \n"
			+ "mpirun -np %5$s lmp_openmpi -suffix omp < %6$s \n";
}
