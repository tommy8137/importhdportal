CREATE SCHEMA IF NOT EXISTS webportal;

CREATE TABLE IF NOT EXISTS webportal.risk
(
  pno                 text,
  hemno               text,
  c_id                integer,
  m_id                integer,
  type                text,
  sbp_time            text,
  shift               integer,
  hemarea             text,
  risk_time           text,
  ev_status           integer,
  record_date         text,
  PRIMARY KEY (hemno, sbp_time)
)

WITH (
  OIDS=FALSE
);

CREATE TABLE IF NOT EXISTS webportal.user (
  id                   serial NOT NULL PRIMARY KEY ,
  doctor_id            text NOT NULL ,
  timeout_minute       integer DEFAULT 20,
  always_show          integer DEFAULT 2
);

CREATE TABLE IF NOT EXISTS webportal.version (
  version            text NOT NULL,
  update_time        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webportal.sbp_drop (
  year                text,
  month               text,
  "number"            integer,
  bpropevent_num      integer,
  bpdrop_rate         numeric,
  startdate           date,
  enddate             date
);

CREATE TABLE IF NOT EXISTS webportal.process_rate (
  year                text,
  month               text,
  process_rate        numeric,
  numerator           integer,
  denominator         integer,
  startdate           date,
  enddate             date
);

CREATE TABLE IF NOT EXISTS webportal.alarm_threat (
  year                text,
  month               text,
  treat               numeric,
  nontreat            numeric,
  startdate           date,
  enddate             date
);
-- RELEASE_VERSION will be replaced to 2016xxxx.xxx-T by deploy pack.sh
INSERT INTO webportal.version (version) VALUES ('RELEASE_VERSION');
