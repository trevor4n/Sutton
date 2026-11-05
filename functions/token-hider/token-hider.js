const process = require('process')

const DEFAULT_COLLECTION_ID = '90648782'
const PAGINATION_CAP = '30' //default is 10

// Unsplash collection IDs are numeric (older) or short alphanumeric slugs (newer)
const VALID_COLLECTION_ID = /^[A-Za-z0-9_-]{1,32}$/

exports.handler = async function (event) {
  const { collectionId = DEFAULT_COLLECTION_ID } = event.queryStringParameters || {}

  if (!VALID_COLLECTION_ID.test(collectionId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 400, statusText: 'Invalid collectionId' }),
    }
  }

  // The token goes in the Authorization header only, so it never appears in a URL or a log line
  const baseUrl = process.env.UNSPLASH_URL.replace(/\/?$/, '/')
  const url = new URL(`${encodeURIComponent(collectionId)}/photos`, baseUrl)
  url.searchParams.set('per_page', PAGINATION_CAP)
  url.searchParams.set('page', '1')

  let response
  try {
    response = await fetch(url, {
      headers: {
        'Authorization': 'Client-ID ' + process.env.UNSPLASH_TOKEN,
        'Accept-Version': 'v1',
      },
    })
  } catch (error) {
    console.log('Unsplash request failed:', error.message)
    return {
      statusCode: 502,
      body: JSON.stringify({ status: 502, statusText: 'Bad Gateway' }),
    }
  }

  if (!response.ok) {
    console.log('Unsplash responded with', response.status, 'for collection', collectionId)
    return {
      statusCode: response.status,
      body: JSON.stringify({ status: response.status, statusText: response.statusText }),
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(await response.json()),
  }
}
