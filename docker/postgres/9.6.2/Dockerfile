FROM repo.devpack.cc/bestshape/postgres:9.6.2

COPY new_database_v4.sql /docker-entrypoint-initdb.d/.

COPY web-portal-init.sql /docker-entrypoint-initdb.d/.

CMD ["postgres"]
