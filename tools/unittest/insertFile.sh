#!/bin/bash
# https://docs.microsoft.com/en-us/sql/linux/sql-server-linux-setup-tools
# 1. 違反 PRIMARY KEY 條件約束 =>  如果你是在開發 api unittest時,不該執行 truncateTalbe,
#    改變 backcase pat_no,hdrec_id to into 新增testcase即可,
#    記得之後要恢復並擴稱其hdrec_id和pat_no list.
# 2. 欄位不合 => 檢查 (insert script or HD) 和 unittest的欄位
sqlcmd -S 192.168.1.159 -U wi -P wistron -d unittest -i tyhd_appointment.sql
sqlcmd -S 192.168.1.159 -U wi -P wistron -d unittest -i tyhd_cis_data.sql
sqlcmd -S 192.168.1.159 -U wi -P wistron -d unittest -i tyhd_lab_data.sql
sqlcmd -S 192.168.1.159 -U wi -P wistron -d unittest -i tyhd_pat_hd_master.sql
sqlcmd -S 192.168.1.159 -U wi -P wistron -d unittest -i tyhd_pat_hd_base.sql
sqlcmd -S 192.168.1.159 -U wi -P wistron -d unittest -i tyhd_pat_hd_memo.sql
sqlcmd -S 192.168.1.159 -U wi -P wistron -d unittest -i tyhd_pat_hd_qa.sql
sqlcmd -S 192.168.1.159 -U wi -P wistron -d unittest -i tyhd_pat_hd_rec.sql
