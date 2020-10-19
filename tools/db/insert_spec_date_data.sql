begin tran t1
	DECLARE @targetDate varchar(8) = '20171127'
	DECLARE @copyDate varchar(10) = CAST('20171017' AS DATE)

	DECLARE @dayDiff as  int = DATEDIFF(day, @copyDate ,@targetDate)


	DECLARE @copytime as varchar = '1'

	select *, m_hdrec_id = substring(hdrec_id, 1, 32 - 8) + @targetDate

	 into #temp_master

	  FROM (
		select B.pat_no, convert(varchar(10), dateadd(day,@dayDiff, hd_date), 120) as hd_date,
			row_number() over(partition by B.pat_no, convert(varchar(10), dateadd(day,@dayDiff, hd_date), 120) order by hd_date, B.pat_no) as RN,
			hdrec_id
			from tyhd_pat_hd_master A
		inner join tyHD_PAT_HD_BASE B
		ON A.PAT_NO = B.PAT_NO
		where hd_date = @copyDate

	) tbl1 where rn = 1


	-- TYHD_PAT_HD_MASTER

		select a.*
		  INTO #master
		  from tyhd_pat_hd_master a
		INNER JOIN #temp_master b
			on a.hdrec_id = b.hdrec_id

		update a
		   set a.hdrec_id = b.m_hdrec_id,
		       a.hd_date = b.hd_date
		  from #master a
		inner join #temp_master b
	 on a.hdrec_id = b.hdrec_id


	insert into tyhd_pat_hd_master select * from #master

	-- TYHD_PAT_HD_QA

		SELECT A.*
		  INTO #qa
	  	FROM TYHD_PAT_HD_QA A, #temp_master B
	 	WHERE A.HDREC_ID = B.HDREC_ID
		update a
		   set a.hdrec_id = b.m_hdrec_id
		  from #qa a
		inner join #temp_master b
		 on a.hdrec_id = b.hdrec_id


		update a
		   set a.qa_data = convert(varchar(10), dateadd(day, @dayDiff, a.qa_data),120)
		  from #qa a
		 where a.qa_item = 'st_date'


		update a
		   set a.qa_data = convert(varchar(10), dateadd(day, @dayDiff, a.qa_data),120)
		  from #qa a
		 where a.qa_item = 'ed_date'

	insert into TYHD_PAT_HD_QA select * from #qa

	-- TYHD_APPOINTMENT

		select APP_SEQ, PAT_NO, id_no, pat_name, app_priod, bed_no=bed_no + @copytime, cancel_flag, cancel_user,
			app_date = convert(varchar(10), dateadd(day, @dayDiff, app_date),120),
			ROW_NUMBER() OVER (partition by app_seq, app_priod, bed_no, convert(varchar(10), dateadd(day, @dayDiff,app_date),120)
								    order by app_seq, app_date, app_priod) as RN
		  into #appointment
		  from tyhd_appointment
		 where app_date = @copyDate and cancel_flag = 'N'


		insert into tyhd_appointment (APP_SEQ, PAT_NO, id_no, pat_name, app_priod, bed_no, cancel_flag, cancel_user, app_date)

		  select APP_SEQ, PAT_NO, id_no, pat_name, app_priod, bed_no, cancel_flag, cancel_user, app_date

		    from #appointment

		   where RN = 1

	-- TYHD_PAT_HD_MEMO

		SELECT A.*
		  INTO #memo
		  FROM TYHD_PAT_HD_MEMO A, #temp_master B
		 WHERE A.HDREC_ID = B.HDREC_ID

		update a
		   set a.hdrec_id = b.m_hdrec_id,
		       a.ev_time = convert(varchar(16), dateadd(day,@dayDiff, ev_time), 120),
		       a.record_date = convert(varchar(20), dateadd(day,@dayDiff, record_date), 120)
		  FROM #memo a
		  INNER JOIN #temp_master b
			  on a.hdrec_id = b.hdrec_id
			 and isdate(a.ev_time) = 1
			 and isdate(a.record_date) = 1

		INSERT INTO TYHD_PAT_HD_MEMO select * from #memo

	-- TYHD_CIS_DATA
		SELECT A.*
		  INTO #cis_data
		  FROM TYHD_CIS_DATA A, #temp_master B
		 WHERE A.HDREC_ID = B.HDREC_ID
		update a
		   set a.hdrec_id = b.m_hdrec_id,
		       a.data_time = REPLACE(convert(varchar(20), dateadd(day,@dayDiff, data_time), 120),'-','/'),
		       a.rec_date = convert(varchar(20), dateadd(day,@dayDiff, rec_date), 120)
		  from #cis_data a
		inner join #temp_master b
		on a.hdrec_id = b.hdrec_id
		 and isdate(a.data_time) = 1

	INSERT INTO TYHD_CIS_DATA select * from #cis_data

	-- TYHD_PAT_HD_REC

	SELECT A.*
	  INTO #hd_rec
	FROM TYHD_PAT_HD_REC A, #temp_master B
	 WHERE A.HDREC_ID = B.HDREC_ID
	update a
		set a.hdrec_id = b.m_hdrec_id,
		a.data_time = REPLACE(convert(varchar(20), dateadd(day, @dayDiff, data_time), 120),'-','/'),
		a.rec_date = convert(varchar(20), dateadd(day, @dayDiff, rec_date), 120)
	from #hd_rec a
	inner join #temp_master b
		on a.hdrec_id = b.hdrec_id

	INSERT INTO TYHD_PAT_HD_REC select * from #hd_rec


	drop table #temp_master
	drop table #master
	drop table #qa
	drop table #appointment
	drop table #memo
	drop table #cis_data
	drop table #hd_rec
commit tran t1
