delete TYHD_PAT_HD_QA from TYHD_PAT_HD_QA as q inner join tyhd_pat_hd_master as m on m.hd_date = '2017-11-27' and m.hdrec_id = q.hdrec_id
delete TYHD_PAT_HD_REC from TYHD_PAT_HD_REC as q inner join tyhd_pat_hd_master as m on m.hd_date = '2017-11-27' and m.hdrec_id = q.hdrec_id
delete from tyhd_pat_hd_master where hd_date = '2017-11-27' 
delete from tyhd_appointment where app_date = '2017-11-27' 
delete from tyhd_pat_hd_memo where substring(hdrec_id, 25, 8) like '20171127' 
delete from tyhd_cis_data where data_time like '2017-11-27%'
delete from tyhd_cis_data where data_time like '2017-11-27%'
delete from TYHD_PAT_HD_QA where substring(hdrec_id, 25, 8) = '20171127'


