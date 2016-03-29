--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.9
-- Dumped by pg_dump version 9.3.9
-- Started on 2016-03-21 17:06:52

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

--
-- TOC entry 1965 (class 0 OID 24607)
-- Dependencies: 171
-- Data for Name: airavata_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

\connect airavata_db4

INSERT INTO airavata_user VALUES (1, 'aaa', '47bce5c74f589f4867dbd57e9ca9f808', 'ROLE_USER', 1);
INSERT INTO airavata_user VALUES (2, 'ajinkya', '47bce5c74f589f4867dbd57e9ca9f808', 'ROLE_USER', 1);
INSERT INTO airavata_user VALUES (5, 'amruta', '81dc9bdb52d04dc20036dbd8313ed055', 'ROLE_USER', 1);


--
-- TOC entry 1976 (class 0 OID 0)
-- Dependencies: 170
-- Name: airavata_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('airavata_user_id_seq', 5, true);


--
-- TOC entry 1971 (class 0 OID 32888)
-- Dependencies: 179
-- Data for Name: host; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO host VALUES (1, 'karst', 'karst.uits.iu.edu');
INSERT INTO host VALUES (2, 'bigred2', 'bigred2.uits.iu.edu');


--
-- TOC entry 1977 (class 0 OID 0)
-- Dependencies: 178
-- Name: host_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('host_id_seq', 2, true);


--
-- TOC entry 1969 (class 0 OID 24650)
-- Dependencies: 177
-- Data for Name: job_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO job_status VALUES (1, 'Queued', 'Q');
INSERT INTO job_status VALUES (2, 'Running', 'R');
INSERT INTO job_status VALUES (3, 'Completed', 'C');
INSERT INTO job_status VALUES (4, 'Cancelled', 'C');


--
-- TOC entry 1978 (class 0 OID 0)
-- Dependencies: 176
-- Name: job_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('job_status_id_seq', 4, true);


--
-- TOC entry 1967 (class 0 OID 24618)
-- Dependencies: 173
-- Data for Name: job_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO job_type VALUES (2, 'LAMMPS', 'LAMMPS');
INSERT INTO job_type VALUES (1, 'PBS', 'PBS');
INSERT INTO job_type VALUES (3, 'GROMACS', 'GROMACS');


--
-- TOC entry 1979 (class 0 OID 0)
-- Dependencies: 172
-- Name: job_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('job_type_id_seq', 3, true);


-- Completed on 2016-03-21 17:06:52

--
-- PostgreSQL database dump complete
--

