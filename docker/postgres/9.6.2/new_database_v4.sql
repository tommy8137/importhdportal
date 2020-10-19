CREATE SCHEMA IF NOT EXISTS spframework;
-- Database generated with pgModeler (PostgreSQL Database Modeler).
-- pgModeler  version: 0.8.1
-- PostgreSQL version: 9.4
-- Project Site: pgmodeler.com.br
-- Model Author: ---
-- Database creation must be done outside an multicommand file.
-- These commands were put in this file only for convenience.
-- -- object: new_database | type: DATABASE --
-- -- DROP DATABASE IF EXISTS new_database;
-- CREATE DATABASE new_database
-- ;
-- -- ddl-end --
--
-- object: spframework.lang | type: TABLE --
-- DROP TABLE IF EXISTS spframework.lang CASCADE;
CREATE TABLE spframework.lang(
  id serial NOT NULL PRIMARY KEY,
  en text,
  zhtw text,
  zhcn text
);
-- object: spframework.lib | type: TABLE --
-- DROP TABLE IF EXISTS spframework.lib CASCADE;
CREATE TABLE spframework.lib(
  id serial NOT NULL PRIMARY KEY,
  c_id smallint,
  m_id smallint,
  entry text,
  proto_res text,
  proto_req text,
  proto_json json
);
-- object: spframework.version | type: TABLE --
-- DROP TABLE IF EXISTS spframework.version CASCADE;
CREATE TABLE spframework.version(
  id smallint,
  version text,
  start_date date,
  end_date date,
  update_time timestamptz
);
-- object: m_lang_id | type: CONSTRAINT --
-- ALTER TABLE spframework.lib DROP CONSTRAINT IF EXISTS m_lang_id CASCADE;
ALTER TABLE spframework.lib ADD CONSTRAINT m_lang_id FOREIGN KEY (m_id)
REFERENCES spframework.lang (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --
-- object: c_lang_id | type: CONSTRAINT --
-- ALTER TABLE spframework.lib DROP CONSTRAINT IF EXISTS c_lang_id CASCADE;
ALTER TABLE spframework.lib ADD CONSTRAINT c_lang_id FOREIGN KEY (c_id)
REFERENCES spframework.lang (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --
-- object: lib_id | type: CONSTRAINT --
-- ALTER TABLE spframework.version DROP CONSTRAINT IF EXISTS lib_id CASCADE;
ALTER TABLE spframework.version ADD CONSTRAINT lib_id FOREIGN KEY (id)
REFERENCES spframework.lib (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --
INSERT INTO spframework.lang (en, zhtw, zhcn) VALUES ('SBP', '收縮壓', '收缩压');
INSERT INTO spframework.lang (en, zhtw, zhcn) VALUES ('Range', '落點區間', '落点区间');
INSERT INTO spframework.lang (en, zhtw, zhcn) VALUES ('Probability', '或然率', '或然率');
INSERT INTO spframework.lang (en, zhtw, zhcn) VALUES ('Estimation', '估計值', '估计值');
INSERT INTO spframework.lib (c_id, m_id, entry, proto_res, proto_req, proto_json) WITH t1 AS (
    Select id from spframework.lang where en = 'SBP'
  ), t2 AS (
    Select id from spframework.lang where en = 'Range'
  )
select t1.id, t2.id, 'BP_dSBP', 'ResBPRange', 'ReqBPRange', '{
    "package": null,
    "messages": [
        {
            "name": "ReqBPRange",
            "fields": [
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "conductivity",
                    "id": 1,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dia_temp_value",
                    "id": 2,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "uf",
                    "id": 3,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "blood_flow",
                    "id": 4,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "total_uf",
                    "id": 5,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "dia_flow",
                    "id": 6,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ns",
                    "id": 7,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "age",
                    "id": 8,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "dm",
                    "id": 9,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "temperature",
                    "id": 10,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dryweight",
                    "id": 11,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gender",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "sbp",
                    "id": 13,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "deltadia_temp_value",
                    "id": 15,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dialysis_year",
                    "id": 16,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "target_uf",
                    "id": 17,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "delta_uf",
                    "id": 18,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "delta_bloodflow",
                    "id": 19,
                    "options": {
                        "default": 0
                    }
                }
            ]
        },
        {
            "name": "ResBPRange",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "Bounds",
                    "name": "res_bp_variation",
                    "id": 1
                }
            ]
        },
        {
            "name": "Bounds",
            "fields": [
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "Upper_bound_CI",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "Upper_bound",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "Lower_bound",
                    "id": 3
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "Lower_bound_CI",
                    "id": 4
                }
            ]
        }
    ]
}' from t1,t2;
INSERT INTO spframework.lib (c_id, m_id, entry, proto_res, proto_req, proto_json) WITH t1 AS (
    Select id from spframework.lang where en = 'SBP'
  ), t2 AS (
    Select id from spframework.lang where en = 'Probability'
  )
select t1.id, t2.id, 'BP_PB', 'ResBPProbability', 'ReqBPProbability', '{
    "package": null,
    "messages": [
        {
            "name": "ReqBPProbability",
            "fields": [
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "conductivity",
                    "id": 1,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dia_temp_value",
                    "id": 2,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "uf",
                    "id": 3,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "blood_flow",
                    "id": 4,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "total_uf",
                    "id": 5,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "dia_flow",
                    "id": 6,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ns",
                    "id": 7,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "age",
                    "id": 8,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "dm",
                    "id": 9,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "temperature",
                    "id": 10,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dryweight",
                    "id": 11,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gender",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "sbp",
                    "id": 13,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "ul",
                    "id": 15,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "ulnum",
                    "id": 16,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "diff",
                    "id": 17,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "deltadia_temp_value",
                    "id": 18,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dialysis_year",
                    "id": 19,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "target_uf",
                    "id": 20,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "delta_uf",
                    "id": 21,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "delta_bloodflow",
                    "id": 22,
                    "options": {
                        "default": 0
                    }
                }
            ]
        },
        {
            "name": "ResBPProbability",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "int32",
                    "name": "res_bp_probability",
                    "id": 1
                }
            ]
        }
    ]
}' from t1,t2;
INSERT INTO spframework.lib (c_id, m_id, entry, proto_res, proto_req, proto_json) WITH t1 AS (
    Select id from spframework.lang where en = 'SBP'
  ), t2 AS (
    Select id from spframework.lang where en = 'Estimation'
  )
select t1.id, t2.id, 'SBP_est', 'ResBPEstimation', 'ReqBPEstimation', '{
    "package": null,
    "messages": [
        {
            "name": "ReqBPEstimation",
            "fields": [
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "conductivity",
                    "id": 1,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dia_temp_value",
                    "id": 2,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "uf",
                    "id": 3,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "blood_flow",
                    "id": 4,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "total_uf",
                    "id": 5,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "dia_flow",
                    "id": 6,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "ns",
                    "id": 7,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "age",
                    "id": 8,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "dm",
                    "id": 9,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "temperature",
                    "id": 10,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dryweight",
                    "id": 11,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "gender",
                    "id": 12
                },
                {
                    "rule": "optional",
                    "type": "int32",
                    "name": "sbp",
                    "id": 13,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "string",
                    "name": "date",
                    "id": 14
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "dialysis_year",
                    "id": 15,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "deltadia_temp_value",
                    "id": 16,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "target_uf",
                    "id": 17,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "delta_uf",
                    "id": 18,
                    "options": {
                        "default": 0
                    }
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "delta_bloodflow",
                    "id": 19,
                    "options": {
                        "default": 0
                    }
                }
            ]
        },
        {
            "name": "ResBPEstimation",
            "fields": [
                {
                    "rule": "repeated",
                    "type": "Predict",
                    "name": "res_bp_estimation",
                    "id": 1
                }
            ]
        },
        {
            "name": "Predict",
            "fields": [
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "Lower_bound",
                    "id": 1
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "Predict",
                    "id": 2
                },
                {
                    "rule": "optional",
                    "type": "double",
                    "name": "Upper_bound",
                    "id": 3
                }
            ]
        }
    ]
}' from t1,t2;
INSERT INTO spframework.version WITH t1 AS (
    Select id from spframework.lib where entry = 'BP_dSBP' AND c_id = '1' AND m_id = '2')
    Select t1.id, 'v1.5', '2010-01-01', '2099-01-01', now() from t1;
INSERT INTO spframework.version WITH t1 AS (
    Select id from spframework.lib where entry = 'BP_PB' AND c_id = '1' AND m_id = '3')
    Select t1.id, 'v1.5', '2010-01-01', '2099-01-01', now() from t1;
INSERT INTO spframework.version WITH t1 AS (
    Select id from spframework.lib where entry = 'SBP_est' AND c_id = '1' AND m_id = '4')
        Select t1.id, 'v1.5', '2010-01-01', '2099-01-01', now() from t1;