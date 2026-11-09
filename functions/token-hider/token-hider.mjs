// Netlify Functions API: takes a web Request and returns a web Response.
// Netlify stops accepting the older Lambda-style `exports.handler` format on July 1, 2027.
// Still served at /.netlify/functions/token-hider.

const DEFAULT_COLLECTION_ID = '90648782'
const PAGINATION_CAP = '30' //default is 10

// Unsplash collection IDs are numeric (older) or short alphanumeric slugs (newer)
const VALID_COLLECTION_ID = /^[A-Za-z0-9_-]{1,32}$/

export default async function (req) {
  const collectionId = new URL(req.url).searchParams.get('collectionId') ?? DEFAULT_COLLECTION_ID

  if (!VALID_COLLECTION_ID.test(collectionId)) {
    return new Response(JSON.stringify({ status: 400, statusText: 'Invalid collectionId' }), { status: 400 })
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
    return new Response(JSON.stringify({ status: 502, statusText: 'Bad Gateway' }), { status: 502 })
  }

  if (!response.ok) {
    console.log('Unsplash responded with', response.status, 'for collection', collectionId)
    return new Response(
      JSON.stringify({ status: response.status, statusText: response.statusText }),
      { status: response.status },
    )
  }

  return new Response(JSON.stringify(await response.json()), { status: 200 })
}
