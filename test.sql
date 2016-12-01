SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

COMMENT ON DATABASE postgres IS 'default administrative connection database';

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

SET search_path = public, pg_catalog;

CREATE SEQUENCE customer_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE customer_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

CREATE TABLE customer (
    no integer DEFAULT nextval('customer_seq'::regclass) NOT NULL,
    name character varying,
    address character varying,
    phone character varying,
    email character varying(100)
);


ALTER TABLE customer OWNER TO postgres;

INSERT INTO customer(no, name, address, phone, email) VALUES
(1, 'winter', 'Bandung', '08123456789', 'alwin.ridd@gmail.com'),
(2, 'Jane', 'Jakarta', '08987654321', 'jane@janedoe.com');

SELECT pg_catalog.setval('customer_seq', 2, true);

ALTER TABLE ONLY customer
    ADD CONSTRAINT customer_pk PRIMARY KEY (no);
