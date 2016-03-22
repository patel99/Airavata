--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.9
-- Dumped by pg_dump version 9.3.9
-- Started on 2016-02-28 11:35:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 1934 (class 1262 OID 24585)
-- Name: airavata_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE airavata_db WITH TEMPLATE = template0 ENCODING = 'UTF8';


ALTER DATABASE airavata_db OWNER TO postgres;

\connect airavata_db4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 171 (class 3079 OID 11750)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 1937 (class 0 OID 0)
-- Dependencies: 171
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 170 (class 1259 OID 24599)
-- Name: airavata_user; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE airavata_user (
    id serial NOT NULL,
    username character varying(10),
    password character varying(100),
    role character varying(10),
    enabled integer
);


ALTER TABLE public.airavata_user OWNER TO postgres;

--
-- TOC entry 1822 (class 2606 OID 24603)
-- Name: airavata_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY airavata_user
    ADD CONSTRAINT airavata_user_pkey PRIMARY KEY (id);


--
-- TOC entry 1936 (class 0 OID 0)
-- Dependencies: 5
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2016-02-28 11:35:29

--
-- PostgreSQL database dump complete
--

