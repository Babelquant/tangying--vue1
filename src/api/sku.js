import request from '@/utils/request'

export function fetchSkuList(query) {
  return request({
    url: '/data/sku/list',
    method: 'get',
    params: query
  })
}

export function fetchCostList(query) {
  return request({
    url: '/data/cost_predict/list',
    method: 'get',
    params: query
  })
}

export function fetchProfitList(query) {
  return request({
    url: '/data/profit/list',
    method: 'get',
    params: query
  })
}
