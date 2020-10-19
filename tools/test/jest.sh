#!/bin/bash
if [ ${TEST_TYPE} = "api" ]; then
  echo "Start API Testing ..."
  jest --config jest.server.json -t ${PATTERN} --forceExit --runInBand
elif [ ${TEST_TYPE} = "unit" ]; then
  echo "Start Unit Testing ..."
  jest --config jest.server.unit.json -t ${PATTERN} --forceExit --runInBand
elif [ ${TEST_TYPE} = "unit-cover" ]; then
  echo "Start Unit Testing (with coverage report)..."
  jest --config jest.server.unit.cover.json -t ${PATTERN} --coverage --forceExit --runInBand
fi
