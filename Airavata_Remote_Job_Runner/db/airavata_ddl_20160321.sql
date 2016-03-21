--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.9
-- Dumped by pg_dump version 9.3.9
-- Started on 2016-03-21 17:05:45

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

DROP DATABASE airavata_db;
--
-- TOC entry 1982 (class 1262 OID 24604)
-- Name: airavata_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE airavata_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'English_United States.1252' LC_CTYPE = 'English_United States.1252';


ALTER DATABASE airavata_db OWNER TO postgres;

\connect airavata_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 6 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 1983 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 180 (class 3079 OID 11750)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 1985 (class 0 OID 0)
-- Dependencies: 180
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 171 (class 1259 OID 24607)
-- Name: airavata_user; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE airavata_user (
    id integer NOT NULL,
    username character varying(10) NOT NULL,
    password character varying(100),
    role character varying(10),
    enabled integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.airavata_user OWNER TO postgres;

--
-- TOC entry 170 (class 1259 OID 24605)
-- Name: airavata_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE airavata_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.airavata_user_id_seq OWNER TO postgres;

--
-- TOC entry 1986 (class 0 OID 0)
-- Dependencies: 170
-- Name: airavata_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE airavata_user_id_seq OWNED BY airavata_user.id;


--
-- TOC entry 179 (class 1259 OID 32888)
-- Name: host; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE host (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    address character varying(100) NOT NULL
);


ALTER TABLE public.host OWNER TO postgres;

--
-- TOC entry 178 (class 1259 OID 32886)
-- Name: host_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE host_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.host_id_seq OWNER TO postgres;

--
-- TOC entry 1987 (class 0 OID 0)
-- Dependencies: 178
-- Name: host_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE host_id_seq OWNED BY host.id;


--
-- TOC entry 175 (class 1259 OID 24629)
-- Name: job_details; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE job_details (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_type_id integer NOT NULL,
    queue_type character varying(25),
    job_id character varying(25),
    job_name character varying(25),
    session_id character varying(25),
    nodes integer,
    no_of_tasks integer,
    memory character varying(25),
    "time" character varying(20),
    elaps_time character varying(25),
    job_status_id integer,
    insts timestamp without time zone DEFAULT now() NOT NULL,
    updts timestamp without time zone,
    host_id integer DEFAULT 0 NOT NULL,
    remote_path character varying(255) NOT NULL
);


ALTER TABLE public.job_details OWNER TO postgres;

--
-- TOC entry 174 (class 1259 OID 24627)
-- Name: job_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE job_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.job_details_id_seq OWNER TO postgres;

--
-- TOC entry 1988 (class 0 OID 0)
-- Dependencies: 174
-- Name: job_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE job_details_id_seq OWNED BY job_details.id;


--
-- TOC entry 177 (class 1259 OID 24650)
-- Name: job_status; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE job_status (
    id integer NOT NULL,
    name character varying(25) NOT NULL,
    value character varying(25)
);


ALTER TABLE public.job_status OWNER TO postgres;

--
-- TOC entry 176 (class 1259 OID 24648)
-- Name: job_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE job_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.job_status_id_seq OWNER TO postgres;

--
-- TOC entry 1989 (class 0 OID 0)
-- Dependencies: 176
-- Name: job_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE job_status_id_seq OWNED BY job_status.id;


--
-- TOC entry 173 (class 1259 OID 24618)
-- Name: job_type; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE job_type (
    id integer NOT NULL,
    name character varying(25) NOT NULL,
    value character varying(25) NOT NULL
);


ALTER TABLE public.job_type OWNER TO postgres;

--
-- TOC entry 172 (class 1259 OID 24616)
-- Name: job_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE job_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.job_type_id_seq OWNER TO postgres;

--
-- TOC entry 1990 (class 0 OID 0)
-- Dependencies: 172
-- Name: job_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE job_type_id_seq OWNED BY job_type.id;


--
-- TOC entry 1847 (class 2604 OID 24610)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY airavata_user ALTER COLUMN id SET DEFAULT nextval('airavata_user_id_seq'::regclass);


--
-- TOC entry 1854 (class 2604 OID 32891)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY host ALTER COLUMN id SET DEFAULT nextval('host_id_seq'::regclass);


--
-- TOC entry 1850 (class 2604 OID 24632)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_details ALTER COLUMN id SET DEFAULT nextval('job_details_id_seq'::regclass);


--
-- TOC entry 1853 (class 2604 OID 24653)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_status ALTER COLUMN id SET DEFAULT nextval('job_status_id_seq'::regclass);


--
-- TOC entry 1849 (class 2604 OID 24621)
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_type ALTER COLUMN id SET DEFAULT nextval('job_type_id_seq'::regclass);


--
-- TOC entry 1856 (class 2606 OID 24612)
-- Name: airavata_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY airavata_user
    ADD CONSTRAINT airavata_user_pkey PRIMARY KEY (id);


--
-- TOC entry 1858 (class 2606 OID 24673)
-- Name: airavata_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY airavata_user
    ADD CONSTRAINT airavata_user_username_key UNIQUE (username);


--
-- TOC entry 1860 (class 2606 OID 24626)
-- Name: pj_job_type; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY job_type
    ADD CONSTRAINT pj_job_type PRIMARY KEY (id);


--
-- TOC entry 1866 (class 2606 OID 32893)
-- Name: pk_host; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY host
    ADD CONSTRAINT pk_host PRIMARY KEY (id);


--
-- TOC entry 1862 (class 2606 OID 24637)
-- Name: pk_job_details; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY job_details
    ADD CONSTRAINT pk_job_details PRIMARY KEY (id);


--
-- TOC entry 1864 (class 2606 OID 24658)
-- Name: pk_job_status; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY job_status
    ADD CONSTRAINT pk_job_status PRIMARY KEY (id);


--
-- TOC entry 1870 (class 2606 OID 32905)
-- Name: fk_host; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_details
    ADD CONSTRAINT fk_host FOREIGN KEY (host_id) REFERENCES host(id);


--
-- TOC entry 1869 (class 2606 OID 24667)
-- Name: fk_job_status; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_details
    ADD CONSTRAINT fk_job_status FOREIGN KEY (job_status_id) REFERENCES job_status(id);


--
-- TOC entry 1868 (class 2606 OID 24643)
-- Name: fk_job_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_details
    ADD CONSTRAINT fk_job_type FOREIGN KEY (job_type_id) REFERENCES job_type(id);


--
-- TOC entry 1867 (class 2606 OID 24638)
-- Name: fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY job_details
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES airavata_user(id);


--
-- TOC entry 1984 (class 0 OID 0)
-- Dependencies: 6
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2016-03-21 17:05:46

--
-- PostgreSQL database dump complete
--

