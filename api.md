# WiPrognosis 20-Xx APIs document

1. [GET /admins/about](#1-get-about)
2. [PUT /admins/about/licenses](#2-modify-license-key)
3. [GET /admins/logs](#3-get-log-files)
4. [GET /admins/modules](#4-get-module-data)
5. [POST /admins/modules](#5-post-module-zip-files)
6. [GET /admins/settings](#6-get-setting-data)
7. [PUT /admins/settings](#7-modify-setting)
8. [POST /auth/login](#8-login)
9. [POST /auth/logout](#9-logout)
10. [POST /auth/refresh](#10-refresh)
11. [GET /risks/categories/:c_id/modules/:m_id/access](#11-risks-access)
12. [POST /risks/categories/:c_id/modules/:m_id/charts](#12-risks-charts)
13. [GET /risks/libs](#13-risks-libs)
14. [GET /searches/overviews/:shift](#14-overview)
15. [GET /searches/overviews/:shift/abnormals/:c_id](#15-overview-abnormals)
16. [GET /searches/patients/:p_id](#16-patient)
17. [GET /searches/patients/:p_id/dashboards/:r_id](#17-patient-dashboard)
18. [GET /searches/patients/:p_id/records](#18-dialyze-records-list)
19. [GET /searches/patients/:p_id/records/:r_id](#19-dialyze-record)
20. [GET /searches/patients/:p_id/risks/:r_id](#20-patients-risks)
21. [GET /searches/patients/:p_id/test_items/:ti_id](#21-test-result-item)
22. [GET /searches/patients/:p_id/test_results](#22-test-result-list)
23. [GET /searches/patients/:p_id/test_results/:tr_id](#23-test-results)
24. [GET /searches/schedules](#24-schedule)
25. [GET /searches/shifts](#25-shift)
26. [GET /users/agreements](#26-get-users-agreements)
27. [PUT /users/agreements](#27-modify-users-agreements)
28. [GET /users/settings](#28-get-users-settings)
29. [GET /alarm/phrase](#29-get-alarm-phrase)
30. [POST /alarm/sbp/status](#30-update-sbp-status)
31. [GET /effective/year/:year/lang/:lang](#31-get-effective-reports)
32. [GET /effective/lists](#32-get-effective-lists)
33. [GET /reports/:date](#33-get-risk-report)
34. [GET /admins/thresholdsetting](#34-get-thresholdsetting-data)
35. [PUT /admins/thresholdsetting](#35-modify-thresholdsetting)
36. [GET /risks/systemthreshold](#36-get-systemthreshold-data)
37. [PUT /risks/setpersonalthreshold](#37-set-personalthreshold-data)

1. **Get About**
------
Get system information

* **URL**

    /admins/about

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag| `<etag>`

        **Content:**

         ```
        {
          "version": <version>, //G0029
          "license_key": <license_key>, //G0030
          "valid_date": <valid_date> //G0115
        }
        ```
        protocol buffer type

       * Protos.About

        ```
        syntax = "proto3";

        message About {
          string version = 1;
          string license_key = 2;
          string valid_date = 3;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


2. **Modify License Key**
------
Update licence key (G0030)

* **URL**

    /admins/about/licenses

* **Method:**

    `PUT`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`
        Content-Type|application/octet-stream

* **URL Params**

    None

* **Data Params**

    * **Required:**

        ```
        {
          "license_key": <license_key>
        }
        ```

        protocol buffer type

       * Protos.Licenses

        ```
        syntax = "proto3";

        message Serial {
          string license_key = 1;
        }
        ```

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**
        ```
        {
          "license_key": <license_key>
        }

        ```

        protocol buffer type
        ```
        syntax = "proto3";

        message Serial {
          string license_key = 1;
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1012 | modify column can not be null | Bad Request
        400 | 1030 | Can not decrypt license key | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        415 | 1032 | Body of the request should Protocol buffer | Unsupported Media Type
        500 | 1006 | Internal error | Internal Server Error


3. **Get Log Files**
------
Get log files

* **URL**

    /admins/logs

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

* **URL Params**

    None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Content-Disposition|attachment; filename=`<filename>`
        Content-Type|application/zip

        **Content:**

        ```
        Compression The Log Files and Downoad The Log File
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


4. **Get Module Data**
------
Get module data

* **URL**

    /admins/modules

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

   * **Optional:**

        * offset = integer, default 0
          * offset says to skip that many rows before beginning to return rows

        * limit = integer (number|all), default all
          * If a limit count is given, no more than that many rows will be returned

        * if you set offset = 0, limit = 2, return 2 records, skip 0 record, means record 1~2

        * if you set offset = 10, limit = 2, return 2 records, skip 10 records, means record 11~12

   * **Example:**

        * show first 20 modules

            `/modules?offset=0&limit=20`

        * show all modules

            `/modules`


* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<etag>`

        **Content:**

         ```
        {
          "total_nums": <num>,
          "module_itmes" :
          [
            {
              "id": <id>,
              "lib_list" : <lib_list>,
              "version": <version>,
              "create_date" : <string>,
              "valid_period_start" : <valid_period_start>,
              "valid_period_end" : <valid_period_end>
            }
          ]
        }

        ```
        protocol buffer type

       * Protos.Module

        ```
        syntax = "proto3";

        message ModuleItem {
          int32 id = 1;
          string lib_list = 2;
          string version = 3;
          string create_date = 4;
          string valid_period_start = 5;
          string valid_period_end = 6;
        }

        message Module {
          int32 total_nums = 1;
          ModuleItem module_items = 2;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


5. **Post Module Zip Files**
------
post module zip files

* **URL**

    /admins/modules

* **Method:**

    `POST`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`
        Content-Disposition| form-data; name=`<name>`; filename=`<filename>`
        Content-Type|multipart/form-data; boundary=`<boundary>`

* **URL Params**

    None

* **Data Params**

    * **Required:**

        ```
        Your module zip files
        ```

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**
        ```
        {
          "fileName": <fileName>,
          "uploadTime": <uploadTime>
        }
        ```

        protocol buffer type

       * Protos.ModuleFile

        ```
        syntax = "proto3";

        message ModuleFile {
          string file_name= 1;
          string upload_time= 2;
        }
        ```


* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1009 | Upload module files fail | Bad Request
        400 | 1015 | Module files decompress fail | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        415 | 1007 | Module file should zip | Unsupported Media Type
        415 | 1008 | Body of the request should form data | Unsupported Media Type
        500 | 1006 | Internal error | Internal Server Error


6. **Get Setting Data**
------
Get setting information

* **URL**

    /admins/settings

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<etag>`

        **Content:**
         ```
        {
          "timeout_minute":<timeout_minute>
        }
        ```

        protocol buffer type

       * Protos.Setting

        ```
        syntax = "proto3";

        message Setting {
          int32 timeout_minute = 1;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


7. **Modify Setting**
------
Update setting

* **URL**

    /admins/settings

* **Method:**

    `PUT`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`
        Content-Type|application/octet-stream

* **URL Params**

    None

* **Data Params**

    * **Required:**

        ```
        {
          "timeout_minute": <timeout_minute> //G0023
        }
        ```
        protocol buffer type

       * Protos.Setting

        ```
        syntax = "proto3";

        message Setting {
          int32 timeout_minute = 1;
        }
        ```

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**
         ```
        {
          "timeout_minute": <timeout_minute>
        }
        ```

        protocol buffer type

       * Protos.Setting

        ```
        syntax = "proto3";

        message Setting {
          int32 timeout_minute = 1;
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1012 | modify column can not be null | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        415 | 1032 | Body of the request should Protocol buffer | Unsupported Media Type
        500 | 1006 | Internal error | Internal Server Error


8. **Login**
------
Login to get access token

* **URL**

    /auth/login

* **Method:**

    `POST`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Content-Type|application/json

* **URL Params**

    None

* **Data Params**

    * **Required:**

        ```
        {
          "username": <username>,
          "password": <password>
        }
        ```

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**
        ```
        {
          "accessToken": <accessToken>,
          "refreshToken": <refreshToken>,
          "expiresIn": <expireTime>,
          "user":{
            "id": <id>,
            "name": <name>,
            "displayName": <displayName>,
            "position": <position>,
            "phone": <phone>,
            "email": <email>,
            "scope":[
              "admin",
              "doctor"
            ]
          }
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Response | Reason
        --- |---| --- |---
        401 | 1001 | Account or Password is not correct //(G0005)  | Unauthorized
        422 | 1003 | body parse error | Unprocessable Entity
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


9. **Logout**
------
Logout from system

* **URL**

    /auth/logout

* **Method:**

    `POST`

* **Header Params**

    None

* **URL Params**

    None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**
        ```
        {
          log out successfully
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Response | Reason
        --- |---| --- |---
        422 | 1003 | body parse error | Unprocessable Entity
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


10. **Refresh**
------
Refresh access token

* **URL**

    /auth/refresh

* **Method:**

    `POST`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Content-Type|application/x-www-form-urlencoded

* **URL Params**

    None

* **Data Params**

    * **Required:**

        param name|param value
        ---|---
        refreshToken|`<refresh_token>`

        ```
        refreshToken=<refresh_token>
        ```

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**
        ```
        {
          "refreshToken":<refreshToken>,
          "accessToken":<accessToken>
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Response | Reason
        --- |---| --- |---
        400 | 1005 | refresh token sholud be provied | Bad Request
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error

11. **Risks Access**
------
Check Risks charts can be access or not

* **URL**

    /risks/categories/**:c_id**/modules/**:m_id**/access

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        None

* **URL Params**

    * **Required:**

        * c_id = int

        * m_id = int

        * time = long

        * p_id = stirng

        * r_id = stirng

    * **Example:**

        * Get access

            `/risks/categories/1/modules/2/access?time=1441875600000&p_id=1234&r_id=r_id2`

* **Data Params**

    None

* **Successful Response:**

    * **Status Code:** 204 No Content

        No Content

* **Error Response:**

    * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1040 | User can not access chart api | Bad Request
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        500 | 1006 | Internal error | Internal Server Error


12. **Risks charts**
------
Risks charts for specific category id and module id

* **URL**

    /risks/categories/**:c_id**/modules/**:m_id**/charts

* **Method:**

    `POST`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        * c_id = int

        * m_id = int

* **Data Params**

    * **Required:**

        * c_id = 1, m_id = 2

        ```
        {
          "conductivity": <conductivity>,//電解質濃度
          "dia_temp_value": <dia_temp_value>,
          "uf": <uf>,
          "blood_flow": <blood_flow>,
          "total_uf": <total_uf>,//總脫水量
          "dia_flow" :<dia_flow>,
          "ns": <ns>,
          "age": <age>,
          "dm": <dm>,
          "temperature": <temperature>,
          "dryweight": <dryweight>,
          "gender": <gender>,
          "sbp": <sbp>,
          "date": <yyyy-mm-dd>
        }
        ```
        protocol buffer type

        * Protos.BPVar

        ```
        syntax = "proto3";

        message ReqBPVariation {
          double conductivity = 1;
          double dia_temp_value = 2;
          double uf = 3;
          int32 blood_flow = 4;
          double total_uf  = 5;
          int32 dia_flow = 6;
          double ns = 7;
          int32 age = 8;
          int32 dm = 9;
          double temperature = 10;
          double dryweight = 11;
          string gender = 12;
          int32 sbp = 13;
          string date = 14;
        }

        ```
        *  c_id = 1, m_id = 3

        ```
        {
          "conductivity": <conductivity>,//電解質濃度
          "dia_temp_value": <dia_temp_value>,
          "uf": <uf>,
          "blood_flow": <blood_flow>,
          "total_uf": <total_uf>,//總脫水量
          "dia_flow" :<dia_flow>,
          "ns": <ns>,
          "age": <age>,
          "dm": <dm>,
          "temperature": <temperature>,
          "dryweight": <dryweight>,
          "gender": <gender>,
          "sbp": <sbp>,
          "date": <yyyy-mm-dd>,
          "ul": <ul>, //1是大於
          "ulnum": <ulnum>,
          "diff": <diff> //差值
        }
        ```
        protocol buffer type

        * Protos.BPProb

        ```
        syntax = "proto3";

        message ReqBPProbability {
          double conductivity = 1;
          double dia_temp_value = 2;
          double uf = 3;
          int32 blood_flow = 4;
          double total_uf = 5;
          int32 dia_flow = 6;
          double ns = 7;
          int32 age = 8;
          int32 dm = 9;
          double temperature = 10;
          double dryweight = 11;
          string gender = 12;
          int32 sbp = 13;
          string date = 14;
          int32 ul = 15;
          int32 ulnum = 16;
          int32 diff = 17;
        }

        ```

* **Successful Response:**

    * **Status Code:** 200 OK

        **Content:**

        *  c_id = 1, m_id = 2

        ```
        {
            "res_bp_variation":
            [
                {
                  "UB_UB": <UB_UB1>,
                  "UB": <UB1>,
                  "LB": <LB1>,
                  "LB_LB": <LB_LB1>
                },
                {
                  "UB_UB": <UB_UB2>,
                  "UB": <UB2>,
                  "LB": <LB2>,
                  "LB_LB": <LB_LB2>
                }
            ]
        }

        ```

        protocol buffer type

        * Protos.BPVar

        ```
        syntax = "proto3";

        message ResBPVariation {
          repeated Bounds res_bp_variation = 1;
        }
        message Bounds {
          double UB_UB = 1;
          double UB = 2;
          double LB = 3;
          double LB_LB= 4;
        }
        ```
        *  c_id = 1, m_id = 3

        ```
        {
            "res_bp_probability":
            [
                <probability1>,
                <probability2>,
                <probability3>,
                <probability4>,
            ]
        }

        ```

        protocol buffer type

        * Protos.BPProb

        ```
        syntax = "proto3";

        message ResBPProbability {
          repeated int32 res_bp_probability = 1;
        }
        ```

* **Error Response:**

    * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1017 | prediction input can not be null | Bad Request
        400 | 1033 | _Protobufjs error message_ | Bad Request
        400 | 1037 | Module not found | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1034~~ | ~~Predict charts not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        408 | 9527 | Request Timeout | Request Timeout
        415 | 1032 | Body of the request should Protocol buffer | Unsupported Media Type
        500 | 1006 | Internal error | Internal Server Error


13. **Risks Libs**
------
Risks category and module from libs

* **URL**

    /risks/libs

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**
        None

    * **Optional:**

        * lang = string (zh_TW|zh_CN|en_US)

* **Data Params**

    * **Required:**

        None

* **Successful Response:**

    * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`
        Content-Type|application/octet-stream

        **Content:**

        ```
        {
          "categories":
          [
            {
              "c_id": 1,
              "c_name": "BP",
              "modules":
              [
                {
                  "m_id": 1,
                  "m_name": "Variation"
                },
              ]
            },
          ]
        }
        ```

        protocol buffer type

       * Protos.Libs

        ```
        syntax = "proto3";

        message Libs {
          repeated Category categories = 1;
        }
        message Category {
          int32 c_id = 1;
          string c_name = 2;
          repeated Module modules = 3;
        }
        message Module {
          int32 m_id = 1;
          string m_name = 2;
        }
        ```

* **Error Response:**

    * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        408 | 9527 | Request Timeout | Request Timeout
        500 | 1006 | Internal error | Internal Server Error


14. **Overview**
------
Get today patient overview

* **URL**

    /searches/overviews/**:shift**?hemarea=**:hemarea**

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        * shift = string ( 1 | 2 | 3 | all ) means (morning|mid|evening|all)

        * **Optional:**
        * lang = string (zh_TW|zh_CN|en_US)
        * hemarea = string (0 | 1 | 2 | A | B ... )

    * **Example:**

        * Get today overview data of morning shift

            `/overviews/morning`

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "total": <total>,   //G0044 應到人數
          "attended": <attended>, //G0045 已到人數
          "not_attend": <not_attend>, //G0047 未到
          "normal": <normal>, //G0049 正常
          "abnormal": <abnormal>, //G0048 風險人數
          "pie_chart": [ //G0119
            {
              "c_name": <category_A>,
              "c_id": "<c_id>",
              "number":<number1>
            },
            {
              "c_name": <category_A>,
              "c_id": "<c_id>",
              "number":<number2>
            },
          ]
        }
        ```
        protocol buffer type

       * Protos.Overview

        ```
        syntax = "proto3";

        message Overview {
          int32 total = 1;
          int32 attended = 2;
          int32 not_attend = 3;
          int32 normal = 4;
          int32 abnormal = 5;
          repeated PieChart pie_chart= 6;
        }
        message PieChart {
          string c_name = 1;
          string c_id = 2;
          int32 number = 3;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        400 | 1013 | URL parameter can not be null | Bad Request
        ~~404~~ | ~~1028~~ | ~~Overview not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


15. **Overview Abnormals**
------
Get today's overview abnormals by provied shift and abnormal id

* **URL**

    /searches/overviews/**:shift**/abnormals/**:c_id**?hemarea=**:hemarea**

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        * shift = string ( 1 | 2 | 3 | all ) means (morning|mid|evening|all)
        * c_id = string (category id|all)

    * **Optional:**

        * lang = string (zh_TW|zh_CN|en_US)
        * hemarea = string (0 | 1 | 2 | A | B ... )

    * **Example:**

        * Get today overview abnormal list of morning shift and abnormalA

            `/searches/overviews/morning/abnormals/abnormalA`

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "abnormal_list": [
            {
              "name": <name>, //G0035
              "gender": <F|M>, //G0051
              "patient_id": <p_id>,
              "bed_no": <bed_no>, //G0050
              "r_id": <r_id>,
              "age": <age>, //G0052
              "risk_category": //G0053
              [
                {
                  "c_id": <c_id>,
                  "c_name": <c_name>,
                  "m_id": <m_id>,
                  "m_name": <m_name>
                },
              ],
              "alarm_status": <-1|0|1|2> <無風險|有風險[未處理|觀察中|已處理]>
            },
          ]
        }
        ```
        protocol buffer type

       * Protos.OverviewAbnormal

        ```

        message AbnormalList {
          repeated Abnormal abnormal_list = 1;
        }
        message Abnormal {
          string name = 1;
          string gender = 2;
          string patient_id = 3;
          string bed_no = 4;
          string r_id = 5;
          int32 age = 6;
          repeated RiskCategory risk_category = 7;
          int32 alarm_status = 8;
        }
        message RiskCategory {
          string c_id = 1;
          string c_name = 2;
          string m_id = 3;
          string m_name = 4;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        400 | 1013 | URL parameter can not be null | Bad Request
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1029~~ | ~~Overview abnormals not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


16. **Patient**
------
Get patient information by provide patient id

* **URL**

    /searches/patients/**:p_id**

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        * p_id = string

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "name": <name>,
          "patient_id": <p_id>,
          "bed_no": <bed_no>,
          "age": <age>,
          "gender": <gender>,
          "diseases":[
            {
              "d_id": <d_id1>,
              "d_name": <d_name1>
            },
            {
              "d_id": <d_id2>,
              "d_name": <d_name2>
            }
          ]
        }
        ```
        protocol buffer type

       * Protos.Patient

        ```
        syntax = "proto3";

        message Patient {
          string name = 1;
          string patient_id = 2;
          string bed_no = 3;
          int32 age = 4;
          string gender = 5;
          repeated Disease diseases = 6
        }
        message Disease {
          string d_id = 1;
          string d_name = 2;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code | Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1014~~ | ~~Patient is not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


17. **Patient Dashboard**
------
Get patient dashboard, it'll show the latest test and the record on the date you provide

* **URL**

    /searches/patients/**:p_id**/dashboards/**:r_id**

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        * p_id = string

        * r_id = string

        * notesformat = "progressnote" or "dart" , 只有改內容外面看不出來有差別!!

    * **Example:**

         ` /searches/patients/<p_id>/dashboards/<r_id>`

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "status_hightlight":
          {
            "weight":
            {
              "pre": <pre-weight>, //G0062
              "post": <post-weight> //G0062
            },
            "sbp": //G0096
            {
              "pre": <pre-systolic>, //G0066
              "post": <post-systolic> //G0067
            },
            "dbp": //G0097
            {
              "pre": <pre-diastolic>, //G0066
              "post": <post-diastolic> //G0067
            },
            "heparin_usage_status": //G0063
            {
              "start": <start>,
              "remain": <remain>,
              "circulation": <circulation>
            }
          },
          "dialyze_records": //G0013
          {
            "r_id": <r_id>,
            "total": <total>, //G0068
            "abnormal":
            [
              {
                "symptom": <symptom>,
                "pi_id": <pi_id>
              },
            ],
            "handled":
            [
              {
                "symptom": <symptom>,
                "treatment": <treatment>,
                "pi_id": <pi_id>
              },
            ]
          },
          "dialysis_test_result": //G0014
          {
            "tr_id": <tr_id>,
            "date": <yyyy-mm-dd>,
            "total": <total>,
            "abnormal":
            [
                {
                  "name": <name>,
                  "value": <value>,
                  "ti_id": <ti_id>
                }
            ]
          }
        }
        ```
        protocol buffer type

       * Protos.Dashboard

        ```
        syntax = "proto3";

        message Summary {
          Status status_hightlight = 1;
          DialyzeRecords dialyze_records = 2;
          TestResults dialysis_test_result = 3;
        }
        message Status {
          Weight weight = 1;
          Blood sbp = 2;
          Blood dbp = 3;
          Heparin heparin_usage_status = 4;
        }
        message Weight {
          double pre = 1;//<pre-weight>
          double post = 2;// <post-weight>
        }
        message Blood {
          int32 pre = 1;
          int32 pre = 2;
        }
        message Heparin {
          int32 start = 1;
          int32 remain = 2;
          int32 circulation =3;
        }
        message DialyzeRecords {
          string r_id = 1;
          int32 total = 2;
          repeated RecordAbnormal abnormal = 3;
          repeated RecordHandled handled = 4;
        }
        message RecordAbnormal {
          string symptom = 1;
          string pi_id = 2;
        }
        message RecordHandled {
          string symptom = 1;
          string treatment = 2;
          string pi_id = 3;
        }
        message TestResults {
          string tr_id = 1;
          string date = 2;// <yyyy-mm-dd>
          int32 total = 3;
          repeated TestAbnormal abnormal = 4;
        }
        message TestAbnormal {
          string name= 1;
          string value = 2;
          string ti_id = 3;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code | Error Code | Message | Reason
        --- |---| --- |---
        400 | 1013 | URL parameter can not be null | Bad Request
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1014~~ | ~~Patient is not found~~ | ~~Not Found~~
        401 | 1011 | Access token is not valid | Unauthorized
        ~~404~~ | ~~1027~~ | ~~Patient dashboard data not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


18. **Dialyze records list**
------
Get patient's dialyze records list by query start_date and end_date.

* **URL**

    /searches/patients/**:p_id**/records

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

      * p_id= string
      * start_date = string (yyyy-mm-dd) // app side default: today - 0.5 year
      * end_date = string (yyyy-mm-dd) // app side default: today
    * **Optional:**
        <!-- * offset = integer, default 0
          * offset says to skip that many rows before beginning to return rows

        * limit = integer (number|all), default all
          * If a limit count is given, no more than that many rows will be returned

        * if you set offset = 0, limit = 2, return 2 records, skip 0 record, means record 1~2

        * if you set offset = 10, limit = 2, return 2 records, skip 10 records, means record 11~12 -->

    * **Example:**

        get first 20 records form start date 2015-08-07 and end date 2015-08-08

        `/searches/patients/<p_id>/records?start_date=2015-08-07&end_date=2015-08-08`

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "total_nums": <total_nums>,
          "records":
          [
            {
              "r_id": <r_id>,
              "date": <yyyy-mm-dd>,
              "tr_id": <tr_id>
            }
          ]
        }
        ```
        protocol buffer type

       * Protos.RecordList

        ```
        syntax = "proto3";

        message DialyzeList {
          int32 total_nums = 1;
          repeated Record records = 2;
        }
        message Record {
          string r_id = 1;
          string date = 2; // <yyyy-mm-dd>
          string tr_id= 3;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1013 | URL parameter can not be null | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1014~~ | ~~Patient is not found~~ | ~~Not Found~~
        ~~404~~ | ~~1025~~ | ~~Patient records data not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


19. **Dialyze record**
------
Get patient dialyze records detail by record id

* **URL**

    /searches/patients/**:p_id**/records/**:r_id**

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|valueRecordDart
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**
        header|value
        ---|---
        If-None-Match| `<etag>`
        * sbp_alarm = integer , 1 -> process sbp_alarm, other sbp_alarm return []
        * notesformat = "progressnote" or "dart"

* **URL Params**

    * p_id= string

    * r_id= string

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        default notesformat = "progressnote" 

        ```
        {
          "r_id": <r_id>,
          "times_of_dialyze": <times_of_dialyze_this_month>, //G0094
          "date": <yyyy-mm-dd>,
          "start_time": <Date valueOf()>,
          "end_time": <Date valueOf()>,
          "dryweight": <dryweight>,
          "temperature": <temperature>,
          "dialysateca1": <dialysateca1>,
          "status" <status>,
          "sbp_alarm" : [
            "time": <time> // timestamp,ex: :1505086545000
            "alarm_status": <-9527|-2|-1|0|1|2|> <未評估風險|無警示訊息|無風險|有風險[未處理|觀察中|已處理]>
            "alarm_phrase": <alarm_phrase>
            "alarm_process": <alarm_process>,
            "alarm_time":  <hh:mm>,
            "process_time" : <YYYY-MM-DD HH:mm A | ''>
          ],
          "items":
          [
            {
              "ri_id": <ri_id>,
              "name": <item_name>,
              "unit": <item_unit>,
              "type": <type>,
              "data":
              [
                {
                  "time": <Date valueOf()>,
                  "value": <value>,
                  "status": <2|1|0><handled|abnormal|normal>
                },
              ]
            },
          ],
          "panels": //S010.3
          {
            "pre":
            [
              {
                "pi_id": <pi_id>,
                "time": <Date valueOf()>,
                "symptom": <symptom>, // G0108
                "treatment": <treatment>, // G0109
                "order": <order>, // G0110
                "status": <2|1><handled|abnormal> //G0111
              },
            ],
            "intra":
            [
              {
                "pi_id": <pi_id>,
                "time": <Date valueOf()>,
                "symptom": <symptom>,
                "treatment": <treatment>,
                "order": <order>,
                "status": <2|1> <handled|abnormal>,
                "rectime":<YYYY-MM-DD HH:mm:ss>
              },
            ],
            "post":
            [
              {
                "pi_id": <pi_id>,
                "time": <Date valueOf()>,
                "symptom": <symptom>,
                "treatment": <treatment>,
                "order": <order>,
                "status": <2|1><handled|abnormal>
              },
            ]
          }
        }
        ```
        protocol buffer type

       * Protos.Record

        ```
        syntax = "proto3";

        message Dialyze {
          string r_id = 1;
          int32 times_of_dialyze = 2;
          string date = 3;// <yyyy-mm-dd>
          int64 start_time = 4;
          int64 end_time = 5;
          double dryweight = 6;
          double temperature = 7;
          double dialysateca1 = 8;
          double dialysis_year = 9;
          repeated Items items = 10;
          Panellist panels = 11;
          int32 status = 12; // <0|1|2> (<已報到|透析中|透析結束>)
          repeated SbpAlarm sbp_alarm = 13;
        }
        message Items {
          string ri_id= 1;
          string name = 2;
          string unit = 3;
          string type = 4;
          repeated Data data = 5;
        }
        message Data {
          int64 time = 1;
          double value = 2;
          int32 status = 3;
        }
        message Panellist {
          repeated Panel pre = 1;
          repeated Panel intra = 2;
          repeated Panel post = 3;
        }
        message Panel {
          string pi_id = 1;
          int64 time = 2;
          string symptom = 3;
          string treatment = 4;
          string order = 5;
          int32 status = 6 ;// <2|1><handled|abnormal>
          string rectime = 7;
        }

        message SbpAlarm {
          int64 time = 1;
          int32 alarm_status = 2;
          string alarm_phrase = 3;
          string alarm_process  = 4;
          string alarm_time = 5;
          string process_time = 6;
        }
        ```

        default notesformat = "dart" 


        ```
        {
          "r_id": <r_id>,
          "times_of_dialyze": <times_of_dialyze_this_month>, //G0094
          "date": <yyyy-mm-dd>,
          "start_time": <Date valueOf()>,
          "end_time": <Date valueOf()>,
          "dryweight": <dryweight>,
          "temperature": <temperature>,
          "dialysateca1": <dialysateca1>,
          "status" <status>,
          "sbp_alarm" : [
            "time": <time> // timestamp,ex: :1505086545000
            "alarm_status": <-9527|-2|-1|0|1|2|> <未評估風險|無警示訊息|無風險|有風險[未處理|觀察中|已處理]>
            "Subject": <Subject>,
            "DContent": <DContent>,
            "AContent": <AContent>,
            "RContent": <RContent>,
            "TContent": <TContent>,
            "alarm_time":  <hh:mm>,
            "process_time" : <YYYY-MM-DD HH:mm A | ''>
          ],
          "items":
          [
            {
              "ri_id": <ri_id>,
              "name": <item_name>,
              "unit": <item_unit>,
              "type": <type>,
              "data":
              [
                {
                  "time": <Date valueOf()>,
                  "value": <value>,
                  "status": <2|1|0><handled|abnormal|normal>
                },
              ]
            },
          ],
          "panels": //S010.3
          {
            "pre":
            [
              {
                "pi_id": <pi_id>,
                "time": <Date valueOf()>,
                "Subject": <Subject>,
                "DContent": <DContent>,
                "AContent": <AContent>,
                "RContent": <RContent>,
                "TContent": <TContent>,
                "order": <order>, // G0110
                "status": <2|1>,<handled|abnormal> //G0111
                "rectime":<YYYY-MM-DD HH:mm:ss>
              },
            ],
            "intra":
            [
              {
                "pi_id": <pi_id>,
                "time": <Date valueOf()>,
                "Subject": <Subject>,
                "DContent": <DContent>,
                "AContent": <AContent>,
                "RContent": <RContent>,
                "TContent": <TContent>,
                "order": <order>,
                "status": <2|1> <handled|abnormal>,
                "rectime":<YYYY-MM-DD HH:mm:ss>
              },
            ],
            "post":
            [
              {
                "pi_id": <pi_id>,
                "time": <Date valueOf()>,
                "Subject": <Subject>,
                "DContent": <DContent>,
                "AContent": <AContent>,
                "RContent": <RContent>,
                "TContent": <TContent>,
                "order": <order>,
                "status": <2|1> <handled|abnormal>,
                "rectime":<YYYY-MM-DD HH:mm:ss>
              },
            ]
          }
        }
        ```
        protocol buffer type

        * Protos.RecordDart

        ```
        syntax = "proto3";

        message Dialyze {
          string r_id = 1;
          int32 times_of_dialyze = 2;
          string date = 3;// <yyyy-mm-dd>
          int64 start_time = 4;
          int64 end_time = 5;
          double dryweight = 6;
          double temperature = 7;
          double dialysateca1 = 8;
          double dialysis_year = 9;
          repeated Items items = 10;
          Panellist panels = 11;
          int32 status = 12; // <0|1|2> (<已報到|透析中|透析結束>)
          repeated SbpAlarm sbp_alarm = 13;
        }
        message Items {
          string ri_id= 1;
          string name = 2;
          string unit = 3;
          string type = 4;
          repeated Data data = 5;
        }
        message Data {
          int64 time = 1;
          double value = 2;
          int32 status = 3;
        }
        message Panellist {
          repeated PanelDart pre = 1;
          repeated PanelDart intra = 2;
          repeated PanelDart post = 3;
        }
        message PanelDart {
          string pi_id = 1;
          int64 time = 2;
          string Subject = 3;
          string DContent = 4;
          string AContent = 5;
          string RContent = 6;
          string TContent = 7;
          string order = 8;
          int32 status = 9;// <2|1><handled|abnormal>
          string rectime = 10;
        }

        message SbpAlarmDart {
          int64 time = 1;
          int32 alarm_status = 2;
          string Subject = 3;
          string DContent = 4;
          string AContent = 5;
          string RContent = 6;
          string TContent = 7;
          string alarm_time = 8;
          string process_time = 9;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1014~~ | ~~Patient is not found~~ | ~~Not Found~~
        ~~404~~ | ~~1016~~ | ~~Record is not found~~ | ~~Not found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


20. **Patients Risks**
------
Get patient's patients risks (S008.5.1)

* **URL**

    /searches/patients/**:p_id**/risks/**:r_id**

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * p_id = string

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "risk_summary": //G0072
          [
            {
              "category": <category>, //G0053
              "c_id": <c_id>,
              "module": //G0073
              [
                  {
                    "m_id": <m_id>,
                    "m_name": <m_name>,
                    "risk_time":<HH:mm>,
                    "type": <upper|middle|lower>,
                    "alarm_status": <-1|0|1|2> <無風險|有風險[未處理|觀察中|已處理]>
                  },
              ],
            },
          ]
        }
        ```
        protocol buffer type

       * Protos.RiskSummary

        ```
        syntax = "proto3";

        message RiskSummary {
          repeated Prediction risk_summary = 1;
        }
        message Prediction {
          string category = 1;
          string c_id = 2;
          repeated Module module = 3;
        }
        message Module {
          string m_id = 1;
          string m_name =2;
          string risk_time = 3;
          string type = 4;
          int32 alarm_status = 5;
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1014~~ | ~~Patient is not found~~ | ~~Not Found~~
        ~~404~~ | ~~1031~~ | ~~Patient abnormals not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


21. **Test Result Item**
------
Get patient's one item of test result by test item id

* **URL**

    /searches/patients/**:p_id**/test_items/**:ti_id**

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        * p_id = string

        * ti_id = string

    * **Optional:**

        * start_date = string (yyyy-mm-dd), default: 1970-01-01

        * end_date = string (yyyy-mm-dd), default: today

        * offset = integer, default 0
          * offset says to skip that many rows before beginning to return rows

        * limit = integer (number)
          * If a limit count is given, no more than that many rows will be returned

        * if you set offset = 0, limit = 2, return 2 records, skip 0 record, means record 1~2

        * if you set offset = 10, limit = 2, return 2 records, skip 10 records, means record 11~12

    * **Example:**

         get 10 test items records before the date 2015-08-10

          `/test_items/<ti_id>?start_date=2015-08-10&end_date=2015-08-11&offset=0&limit=20`

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "total_nums": <total_nums>,
          "results":
          [
            {
              "tr_id": <tr_id>,
              "date": <Date valueOf()>,
              "value": <value>
            },
          ]
        }
        ```
        protocol buffer type

       * Protos.Item

        ```
        syntax = "proto3";

        message ItemsList {
          int32 total_nums = 1
          repeated Item results = 2;
        }
        message Item {
          string tr_id = 1;
          string date = 2;
          double value = 3;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1013 | URL parameter can not be null | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1014~~ | ~~Patient is not found~~ | ~~Not Found~~
        ~~404~~ | ~~1019~~ | ~~Item is not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


22. **Test Result list**
------
Get patient's test result list

* **URL**

    /searches/patients/**:p_id**/test_results

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        * p_id = string

    * **Optional:**

        * start_date = string (yyyy-mm-dd), default: 1970-01-01

        * end_date = string (yyyy-mm-dd), default: today

        * offset = integer, default 0
          * offset says to skip that many rows before beginning to return rows

        * limit = integer (number)
          * If a limit count is given, no more than that many rows will be returned

        * if you set offset = 0, limit = 2, return 2 records, skip 0 record, means record 1~2

        * if you set offset = 10, limit = 2, return 2 records, skip 10 records, means record 11~12

    * **Example:**

        get first 20 record from start date 2015-08-10 and end date 2015-08-11

        `?start_date=2015-08-10&end_date=2015-08-11&offset=0&limit=20`

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "total_nums": <total_num>,
          "tests":
          [
            {
              "tr_id": <tr_id>,
              "date": <yyyy-mm-dd>
            }
          ]
        }
        ```
        protocol buffer type

       * Protos.ResultList

        ```
        syntax = "proto3";

        message TestResults {
          int32 total_nums = 1;
          repeated Tests tests= 2;
        }
        message Tests {
          string tr_id = 1;
          string date = 2;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1013 | URL parameter can not be null | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1014~~ | ~~Patient is not found~~ | ~~Not Found~~
        ~~404~~ | ~~1026~~ | ~~Patient test result data not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


23. **Test Results**
------
Get patient's physical test result by test result id

* **URL**

    /searches/patients/**:p_id**/test_results/**:tr_id**

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        * p_id = string
        * tr_id= string

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "tr_id": <tr_id>,
          "date": <yyyy-mm-dd>,
          "results":
          [
            {
              "name": <name>,
              "ti_id": <ti_id>,
              "value": <value>,
              "unit": <unit>,
              "standard": <standard>,
              "tendency": <1|2|3|0>, //<up|equal|down|none>
              "status":  <0|1|2|3> // <正常|異常|危急|無>
            },
          ]
        }
        ```
        protocol buffer type

        * Protos.Result

        ```
        syntax = "proto3";

        message TestItem {
          string name = 1;
          string ti_id = 2;
          string value = 3;
          string unit = 4;
          string standard = 5;
          int32 tendency = 6;
          int32 status = 7;
        }
        message TestResult {
          string tr_id = 1;
          string date = 2; // <yyyy-mm-dd>
          repeated TestItem results = 3;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        ~~404~~ | ~~1014~~ | ~~Patient is not found~~ | ~~Not Found~~
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        ~~404~~ | ~~1030~~ | ~~Patient test result detail data not found~~ |~~ Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


24. **Schedule**
------
Get shift schedule of the day for user select

* **URL**

    /searches/schedules

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

      * start_date = string (yyyy-mm-dd) // app side default: today - 0.5 year

      * end_date = string (yyyy-mm-dd) // app side default: today

    * **Optional:**

        * offset = integer, default 0
          * offset says to skip that many rows before beginning to return rows

        * limit = integer (number|all), default all
          * If a limit count is given, no more than that many rows will be returned

        * if you set offset = 0, limit = 2, return 2 records, skip 0 record, means record 1~2

        * if you set offset = 10, limit = 2, return 2 records, skip 10 records, means record 11~12

        * sort = [date/name/gender/patient_id/bed_no/shift/progress]

        * q = [name/id]

    * **Example:**

        * show first 20 schedules during 2015-08-07 to 2015-08-08

            `/schedules?start_date=2015-08-07&end_date=2015-08-08&offset=0&limit=20`

        * show all schedules during 2015-01-08 to 2015-08-09

            `/schedules?start_date=2015-01-08&end_date=2015-08-09`

        * Retrieves a list of schedules in descending order of name

            `/schedules?start_date=2015-01-08&end_date=2015-08-09&sort=-name`

        * Retrieves a list of schedules in ascending order of bed_no

            `/schedules?start_date=2015-01-08&end_date=2015-08-09&sort=bed_no`

        * Retrieve a list of schedules mentioning the word 'susan' in name or patient_id

            `/schedules?start_date=2015-01-08&end_date=2015-08-09&q=susan`　


* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "total_nums": <num>,
          "schedule_patients":
          [
            {
              "date": <yyyy-mm-dd>,
              "name": <name>,
              "gender": <F|M>,
              "patient_id": <p_id>,
              "bed_no": <bed_no>,
              "schedule": <1|2|3>,
              "progress": <Not Started|Under Dialysis|Finished> (<已報到|透析中|透析結束>),
              "r_id":<r_id>,
            },
          ]
        }
        ```
        protocol buffer type

       * Protos.Schedule

        ```
        syntax = "proto3";

        message Schedule {
          int32 total_nums = 1;
          repeated SchedulePatients schedule_patients = 2;
        }
        message SchedulePatients {
          string date = 1;// <yyyy-mm-dd>
          string name = 2;
          string gender = 3; //<F|M>
          string patient_id = 4;
          string bed_no = 5;
          int32 schedule = 6;// <1|2|3> (Morning Shift|Mid-Day Shift|Evening Shift)
          string progress = 7;// <Not Started|Under Dialysis|Finished> (<已報到|透析中|透析結束>)
          string r_id = 8;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1013 | URL parameter can not be null | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        ~~404~~ | ~~1023~~ | ~~Schedule not found~~ | ~~Not Found~~
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error

25. **Shift**
------
Get shift for overview

* **URL**

    /searches/shifts

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * **Required:**

        None

    * **Optional:**
        None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**
        ```
        {
          "shifts":
          [
            {
              "s_id": <s_id>,
              "s_name": <s_name>,
            },
          ]
        }
        ```
        protocol buffer type

       * Protos.Schedule

        ```
        syntax = "proto3";

        message Shifts {
          repeated Shift shifts = 1;
          repeated string hemarea = 2;
        }
        message Shift {
          int32 s_id = 1;
          string s_name = 2;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error

26. **Get Users Agreements**
------
Get user agreements

* **URL**

    /users/agreements

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**

        ```
        {
          "always_show": <1|2> // defalut 2:disagree
        }
        ```

        protocol buffer type

       * Protos.Agreement

        ```
        syntax = "proto3";

        message Agreements {
          int32 always_show = 1;
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


27. **Modify Users Agreements**
------
Update user agreements

* **URL**

    /users/agreements

* **Method:**

    `PUT`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`
        Content-Type|application/octet-stream

* **URL Params**

    None

* **Data Params**

    * **Required:**

        ```
        {
          "always_show": <1|2>
        }
        ```

        protocol buffer type

       * Protos.Agreement

        ```
        syntax = "proto3";

        message Agreements {
          int32 always_show = 1;
        }
        ```

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<md5>`

        **Content:**

        ```
        {
          "always_show": <1|2>
        }
        ```

        protocol buffer type

        ```
        syntax = "proto3";

        message Agreements {
          int32 always_show = 1;
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1012 | modify column can not be null | Bad Request
        400 | 1033 | _Protobufjs error message_ | Bad Request
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        415 | 1032 | The request should be Protocol buffer | Unsupported Media Type
        500 | 1006 | Internal error | Internal Server Error


28. **Get Users Settings**
------
Get setting information

* **URL**

    /users/settings

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<etag>`

        **Content:**
         ```
        {
          "timeout_minute":<timeout_minute>
        }
        ```

        protocol buffer type

       * Protos.Setting

        ```
        syntax = "proto3";

        message Setting {
          int32 timeout_minute = 1;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error

29. **Get Alarm Phrase**
------
Get alarm phrase

* **URL**

    /alarm/phrase?notesformat=`notesformat`

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`


* **URL Params**

    * notesformat = string , "dart" or "progressnote"

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<etag>`

        **Content:**

        if notesformat = "progressnote"
         
        ```
        {
          AlarmLists:
          [
            {
             "alarm_phrase":<alarm_phrase>,
             "alarm_process":[alarm_process]
            },
          ]
        }
        ```

        protocol buffer type

       * Protos.AlarmList

        ```
        syntax = "proto3";


        message AlarmLists {
          repeated AlarmList AlarmLists = 1;
        }

        message AlarmList {
          string alarm
          string alarm_phrase = 1;
          repeated string alarm_process = 2;
        }
        ```

        if notesformat = "dart"

        ```
        {
          "DartLists":
          [
            {
             "Subject": "風險評估-有不適",
             "DContent": "10-1經目前透析參數模擬後續血壓變化警示，且病人有抽筋、頭暈等不適症狀",
             "AContent":[
                "依調整透析參數模擬結果，進行實際參數調整，持續觀察病人症狀。",
                "依臨床經驗調整透析相關參數，持續觀察病人症狀。",
                "暫不調整相關參數，另執行其他給氧、暫停透析(趕回血)等臨床處置，持續觀察病人症狀。",
                "通知主治醫師評估及處置。"
              ],
            },
            {
             "Subject": "風險評估-無不適",
             "DContent": "10-2經目前透析參數模擬後續血壓變化警示，但病人無不適症狀",
             "AContent":[
                "依調整透析參數模擬結果，進行實際參數調整，持續觀察病人症狀。",
                "依臨床經驗調整透析相關參數，持續觀察病人症狀。",
                "暫不調整相關參數，另執行其他給氧、暫停透析(趕回血)等臨床處置，持續觀察病人症狀",
                "暫不調整相關參數及處置內容，持續觀察病人症狀",
                "通知主治醫師評估血壓變化情形，並依醫囑進行處置。(如血壓已過低，但病人無不適正在休息，仍建議請醫師評估)",
              ],
            },
          ]
        }
        ```

        protocol buffer type

       * Protos.DartList

        ```
        syntax = "proto3";

        message DartLists {
          repeated DartList DartLists = 1;
        }

        message DartList {
          string Subject = 1;
          string DContent = 2;
          repeated string AContent = 3;
        }

        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        403 | 1002 | License has expired. Please contact with administrator. //(G0007) | Forbidden
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error

30. **Update sbp status**
------
Insert or Update sbp status

* **URL**

    /alarm/sbp/status

* **Method:**

    `PUT`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    * notesformat = string , "dart" or "progressnote"

* **Data Params**
    * **Required:**

      default notesformat = "progressnote"

        ```
        {
          "hdrec_id": <hdrec_id>,
          "sbp_time": <sbp_time>,// 日期格式(yyyy-MM-dd HH:mm)
          "ev_status": <ev_status>,// <1|2> (<觀察中|已處理>)
          "ev_situation": <ev_situation>,
          "ev_process": <ev_process>,
          "ev_time": <ev_time>
        }
        ```
        protocol buffer type

       * Protos.SbpVar

        ```
        syntax = "proto3";


        message ReqSbp {
         string hdrec_id = 1;
         string sbp_time = 2;
         int32 ev_status = 3;
         string ev_situation = 4;
         string ev_process = 5;
         string ev_time = 6;
       }

        ```

        if notesformat = "dart"

        ```
        {
          "hdrec_id": <hdrec_id>,
          "sbp_time": <sbp_time>,// 日期格式(yyyy-MM-dd HH:mm)
          "ev_status": <ev_status>,// <1|2> (<觀察中|已處理>)
          "Subject": <Subject>,
          "DContent": <DContent>,
          "AContent": <AContent>,
          "RContent": <RContent>,
          "TContent": <TContent>,
          "Process_Date": <Process_Date> //原本的ev_time
        }
        ```
        protocol buffer type

       * Protos.SbpVarDart

        ```
        syntax = "proto3";


        message ReqSbpDart {
         string hdrec_id = 1;
         string sbp_time = 2;
         int32 ev_status = 3;
         string Subject = 4;
         string DContent = 5;
         string AContent = 6;
         string RContent = 7;
         string TContent = 8;
         string Process_Date = 9; //原本的ev_time
       }

        ```


* **Successful Response:**

  * **Status Code:** 204 OK


* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Response | Reason
        --- |---| --- |---
        400 | 1005 | Sbs update status err, error format | Bad Request | Patient not found
        401 | 1001 | Account or Password is not correct //(G0005)  | Unauthorized
        422 | 1003 | body parse error | Unprocessable Entity
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        415 | 1032 | Body of the request should Protocol buffer | Unsupported Media Type
        500 | 1006 | Internal error | Internal Server Error

31. **GET Effective Reports**
------
Get effective report

* **URL**

    /effective/year/:year/lang/:lang

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        None

* **URL Params**

  * year = string (2017)

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag| `<etag>`

        **Content:**

          PDF file


* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error

32. **Get Effective Lists**
------
Get effective lists

* **URL**

    /effective/lists

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag| `<etag>`

        **Content:**

        ```
        {
          year: [
            "2015",
            "2016",
            "2017",
          ]
        }

        ```
        protocol buffer type

       * Protos.List

        ```
        syntax = "proto3";

        message Lists {
          repeated string year = 1;
        }

        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error

33. **Get Risk Report**
------
Get Risk Report

* **URL**

    /reports/:date

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

* **URL Params**

  * date = string ('YYYY-MM-DD')

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**

          CSV file


* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        400 | 1047 | REQUEST_FORMAT_ERROR | Please input date which format is YYYY-MM-DD, ex: YYYY-MM-DD
        400 | 1048 | REQUEST_NOT_FOUND | No data with date
        500 | 1006 | Internal error | csv modules error

34. **Get Threshold Setting Data**
------
Get Threshold Setting Data

* **URL**

    /admins/thresholdsetting

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **URL Params**

    None

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<etag>`

        **Content:**
         ```
        {
          "status":<status>,
          "max_threshold":<max_threshold>,
          "min_threshold":<min_threshold>
        }
        ```

        protocol buffer type

       * Protos.ThresholdSetting

        ```
        syntax = "proto3";

        message ThresholdSetting {
          required string status = 1;
          required float max_threshold = 2;
          required float min_threshold = 3;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error


35. **Modify Threshold Setting**
------
Update Threshold setting

* **URL**

    /admins/thresholdsetting

* **Method:**

    `PUT`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`
        Content-Type|application/octet-stream

* **URL Params**

    None

* **Data Params**

    * **Required:**

        ```
        {
          "status":<status>,
          "max_threshold":<max_threshold>,
          "min_threshold":<min_threshold>
        }
        ```
        protocol buffer type

       * Protos.ThresholdSetting

        ```
        syntax = "proto3";

        message ThresholdSetting {
          required string status = 1;
          required float max_threshold = 2;
          required float min_threshold = 3;
        }
        ```

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**
         ```
        {
          "status":<status>,
          "max_threshold":<max_threshold>,
          "min_threshold":<min_threshold>
        }
        ```

        protocol buffer type

       * Protos.ThresholdSetting

        ```
        syntax = "proto3";

        message ThresholdSetting {
          required string status = 1;
          required float max_threshold = 2;
          required float min_threshold = 3;
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1047 | REQUEST_FORMAT_ERROR | Please input stauts which type is string and to be 0 or 1; max_threshold and min_threshold are float number and min_threshold should be less then max_threshold
        400 | 1048 | REQUEST_NOT_FOUND | No data with status, max_threshold or min_threshold
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        415 | 1032 | Body of the request should Protocol buffer | Unsupported Media Type
        500 | 1006 | Internal error | Internal Server Error

36. **Get System threshold Data**
------
Get System threshold Data by personal

* **URL**

    /risks/systemthreshold

* **Method:**

    `GET`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`

    * **Optional:**

        header|value
        ---|---
        If-None-Match| `<etag>`

* **Required:**

        * r_id = stirng

    * **Example:**

        * Get personal threshold data

            `/risks/systemthreshold?r_id=r_id2`

* **Data Params**

    None

* **Successful Response:**

  * **Status Code:** 200 OK

        **Header:**

        header|value
        ---|---
        Etag|`<etag>`

        **Content:**
         ```
        {
          "status":<status>,
          "max_threshold":<max_threshold>,
          "min_threshold":<min_threshold>,
          "personal_threshold":<personal_threshold>,
          "editable":<editable>
        }
        ```

        protocol buffer type

       * Protos.PersonThreshold

        ```
        syntax = "proto3";

        message PersonalThreshold {
          required string status = 1;
          required float max_threshold = 2;
          required float min_threshold = 3;
          required float personal_threshold = 4;
          required string editable = 5;
        }
        ```

* **Redirection Response:**

  * **Status Code:** 304 Not Modified

      * Content has not been modified, use cache

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        500 | 1006 | Internal error | Internal Server Error

37. **Modify Personal Alarm Threshold Setting**
------
Update Personal Alarm Threshold setting

* **URL**

    /risks/setpersonalthreshold

* **Method:**

    `PUT`

* **Header Params**

    * **Required:**

        header|value
        ---|---
        Authorization| `Bearer <access_token>`
        Content-Type|application/octet-stream

* **URL Params**

    None

* **Data Params**

    * **Required:**

        ```
        {
          "r_id":<r_id>,
          "personal_threshold":<personal_threshold>
        }
        ```
        protocol buffer type

       * Protos.SetPersonalThreshold

        ```
        syntax = "proto3";

        message SetPersonalThreshold {
          required string r_id = 1;
          required float setting_threshold = 2;
        }
        ```

* **Successful Response:**

  * **Status Code:** 200 OK

        **Content:**
         ```
        {
          "status":<status>,
          "max_threshold":<max_threshold>,
          "min_threshold":<min_threshold>,
          "personal_threshold":<personal_threshold>,
          "editable":<editable>
        }
        ```

        protocol buffer type

       * Protos.PersonThreshold

        ```
        syntax = "proto3";

        message PersonalThreshold {
          required string status = 1;
          required float max_threshold = 2;
          required float min_threshold = 3;
          required float personal_threshold = 4;
          required string editable = 5;
        }
        ```

* **Error Response:**

  * **Status Code:**

        Status Code |Error Code| Message | Reason
        --- |---| --- |---
        400 | 1047 | REQUEST_FORMAT_ERROR | personal_threshold is number and personal_threshold should be between max_threshold and min_threshold
        400 | 1048 | REQUEST_NOT_FOUND | No data with r_id or personal_threshold
        400 | 1048 | STATUS_ERROR | threshold setting status or this patient is not on Hemodialysis can't set personal alarm threshold
        401 | 1011 | Access token is not valid | Unauthorized
        405 | 1004 | HTTP method is wrong | Method Not Allowed
        415 | 1032 | Body of the request should Protocol buffer | Unsupported Media Type
        500 | 1006 | Internal error | Internal Server Error

