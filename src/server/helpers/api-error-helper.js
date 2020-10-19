export const errorCode = {
  AUTH_WRONG: 1001,
  LICENSE_EXPIRED: 1002,
  UNPROCESSABLE: 1003,
  METHOD_WRONG: 1004,
  INTERNAL_ERROR: 1006,
  MODULE_FILE_FORMAT_ERROR: 1007,
  FORM_DATA_ERROR: 1008,
  UPLOAD_FILES_ERROR: 1009,
  UNAUTHORIZED: 1011,
  MODIFY_COLUMN_NULL: 1012,
  FILE_DECOMPRESS_ERROR: 1015,
  PREDICT_NULL: 1017,
  URL_VAR_NULL: 1013,
  CRYPT_FAIL: 1030,
  NOT_PROTOBUF: 1032,
  PROTOBUFJS_ERROR: 1033,
  MODULE_NOT_FOUND: 1036,
  PMODULE_NOT_FOUND: 1037,
  DB_CONNECT_ERROR: 1038,
  DB_QUERY_ERROR: 1039,
  ACCESS_DENY: 1040,
  RW_FILE_ERROR: 1041,
  PROTOS_NOT_FOUND: 1042,
  JSON_PARSE_ERROR: 1043,
  DB_ERROR: 1044,
  PREDICT_INPUT_ERROR: 1045,
  SERVICE_RENDER_ERROR: 2001,
  TIME_OUT: 9527,
  REQUEST_DATA_EMPTY: 1046,
  REQUEST_FORMAT_ERROR: 1047,
  REQUEST_NOT_FOUND: 1048,
  STATUS_ERROR: 1049,
}

export const throwApiError = (message, code) => {
  const err = new Error(message)
  err.code = code
  throw err
}

export const methodNotAllowedOptions = {
  throw: true,
  methodNotAllowed: () => {
    throwApiError('HTTP method is wrong', errorCode.METHOD_WRONG)
  }
}