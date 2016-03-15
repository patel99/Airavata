package com.teamAlpha.airavata.utils;

import java.util.HashMap;
import java.util.Map;

import com.teamAlpha.airavata.domain.Status;
import com.teamAlpha.airavata.domain.Type;

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
			+ "#PBS -l nodes=%1$s:ppn=%2$s \n"
			+ "#PBS -l walltime=%3$s \n"
			+ "#PBS -N gromacs.job \n"
			+ "module load intel \n"
			+ "module load openmpi/intel/1.6.3 \n"
			+ "module load gromacs \n"
			+ "cd %4$s \n"
			+ "mpirun -np %5$s mdrun_mpi_d -s %6$s -c %7$s\n";
	
	public static final Map<Integer, Status> JOB_STATUS_MAP = new HashMap<Integer, Status>();
	
	public static final int JOB_STATUS_QUEUED = 1;
	public static final int JOB_STATUS_RUNNING = 2;
	public static final int JOB_STATUS_COMPLETED = 3;
	public static final int JOB_STATUS_CANCELLED = 4;
	
	public static final Map<Integer, Type> JOB_TYPE_MAP = new HashMap<Integer, Type>();
	
	public static final int JOB_TYPE_PBS = 1;
	public static final int JOB_TYPE_LAMMPS = 2;
	public static final int JOB_TYPE_GROMACS = 3;
	
	public static final void setStatusMap(){
		Status s = new Status();
		s.setName("QUEUED");
		s.setName("Q");
		JOB_STATUS_MAP.put(JOB_STATUS_QUEUED, s);
		s = new Status();
		s.setName("RUNNING");
		s.setName("R");
		JOB_STATUS_MAP.put(JOB_STATUS_RUNNING, s);
		s = new Status();
		s.setName("COMPLETED");
		s.setName("C");
		JOB_STATUS_MAP.put(JOB_STATUS_COMPLETED, s);
		s = new Status();
		s.setName("Cancelled");
		s.setName("C");
		JOB_STATUS_MAP.put(JOB_STATUS_CANCELLED, s);
	}
	
	public static final void setTypeMap(){
		Type t = new Type();
		t.setName("PBS");
		t.setName("PBS");
		JOB_TYPE_MAP.put(JOB_TYPE_PBS, t);
		t = new Type();
		t.setName("LAMMPS");
		t.setName("LAMMPS");
		JOB_TYPE_MAP.put(JOB_TYPE_LAMMPS, t);
		t = new Type();
		t.setName("GROMACS");
		t.setName("GROMACS");
		JOB_TYPE_MAP.put(JOB_TYPE_GROMACS, t);
	}
}
