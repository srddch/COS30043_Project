const baseURL = 'https://cos30043-project-backend.onrender.com/api'

function buildUrl(path, params) {
  const url = new URL(baseURL + path)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value)
      }
    })
  }

  return url.toString()
}

async function request(method, path, data = null, config = {}) {
  const url = buildUrl(path, config.params)

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (data !== null && data !== undefined) {
    options.body = JSON.stringify(data)
  } else if (config.data) {
    options.body = JSON.stringify(config.data)
  }

  const response = await fetch(url, options)

  const text = await response.text()
  let responseData = null

  try {
    responseData = text ? JSON.parse(text) : null
  } catch {
    responseData = text
  }

  if (!response.ok) {
    const error = new Error(
      responseData?.message ||
      responseData?.error ||
      'Request failed'
    )

    error.response = {
      status: response.status,
      data: responseData
    }

    throw error
  }

  return {
    data: responseData
  }
}

const api = {
  get(path, config = {}) {
    return request('GET', path, null, config)
  },

  post(path, data = {}, config = {}) {
    return request('POST', path, data, config)
  },

  put(path, data = {}, config = {}) {
    return request('PUT', path, data, config)
  },

  patch(path, data = {}, config = {}) {
    return request('PATCH', path, data, config)
  },

  delete(path, config = {}) {
    return request('DELETE', path, null, config)
  }
}

export default api