const entries = [
  'activeCount',
  'activeTime',
  'currentPage',
  'dealer',
  'description',
  'duration',
  'email',
  'generateTime',
  'identity',
  'isActive',
  'isGrant',
  'isGroup',
  'isLock',
  'isParent',
  'licenseCode',
  'licenseType',
  'makeTime',
  'num',
  'offset',
  'pageSize',
  'productCode',
  'productDescription',
  'productId',
  'productName',
  'roleId',
  'totalPage',
  'type',
  'userName',
  'version',
]

export const validLicenseInfo = entries.reduce((result, field) => {
  result.license[field] =
    field == 'activeTime' ? new Date().toISOString()
      : field == 'duration' ? 360
      : field
  return result
}, { license: {} })

export default entries

