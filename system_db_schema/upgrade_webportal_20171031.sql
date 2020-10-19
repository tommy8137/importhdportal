begin;
  ALTER table webportal.risk ADD shift integer;
  ALTER table webportal.risk ADD hemarea text;
  ALTER table webportal.risk ADD ev_status integer;
  ALTER table webportal.risk ADD sbp_time text default '1991-01-01 00:00:00';
  ALTER table webportal.risk ADD record_date text;
  ALTER table webportal.risk DROP IF exists last_record_time;
  ALTER table webportal.risk DROP IF exists status;
commit;
begin;
  ALTER table webportal.risk ADD primary key (hemno, sbp_time);
commit;
begin;
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
commit;
