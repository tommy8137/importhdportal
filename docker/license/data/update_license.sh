#!/bin/sh

if [ $# != 2 ]; then
  echo "usage: update_license.sh <host> <license_key>"
  exit 2
fi

readonly HOST=$1
readonly KEY=$2

readonly BASE_URL=https://${HOST}/api/v1alpha
readonly LOGIN_URL=/auth/login
readonly LICENSE_URL=/admins/about/licenses

access_token=$(curl -k -s -H "Content-Type: application/x-www-form-urlencoded" -X POST -d "username=mis&password=mispw" ${BASE_URL}${LOGIN_URL} | jq -r .accessToken)

license_key=$(echo "license_key: '"${KEY}"'" | protoc about.proto --encode="Licenses")

r=$(curl -k -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/octet-stream" -H "Authorization: Bearer ${access_token}" -X PUT -d "${license_key}" ${BASE_URL}${LICENSE_URL})

if [ "${r}" != "200" ]; then
  echo "failed: status code ${r}"
  exit 1
else
  echo "ok"
  exit 0
fi
