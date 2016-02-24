package com.teamAlpha.airavata.utils;

public class Constants {

	
	
	public final static String CMD_CD="cd";
	public final static String CMD_QSUB="qsub";
	public final static String CMD_QSTAT="qstat";
	public final static String CMD_QDEL="qdel";
	public final static String CMD_D2U="dos2unix";
	public final static String CMD_MPICC="mpicc";
	public final static String CMD_CAT="cat";
	public static String PBS_CONTENT = "#!/bin/bash \n"
			+ "#PBS -l nodes=%1$s:ppn=%2$s \n"
			+ "#correct this "
			+ "#PBS -l walltime=%3$s \n"
			+ "# no need to specify a queue on Karst, except if you need the debug or interactive queue \n"
			+ "#load the mpi module \n"
			+ "#cd to working directory \n"
			+ "cd %4$s \n"
			+ "mpirun -n %5$s %6$s \n";

}
