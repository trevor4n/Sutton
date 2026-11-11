// Netlify Functions API: takes a web Request and returns a web Response.
// Netlify stops accepting the older Lambda-style `exports.handler` format on July 1, 2027.
// Still served at /.netlify/functions/token-hider.

// The game only ever asks for this collection. Serving any other ID would let anyone
// use this function (and its Unsplash key) as a free proxy and burn through the rate limit.
const COLLECTION_ID = '9660118'
const PAGINATION_CAP = '30' //default is 10

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  // Netlify's CDN cache key includes every query parameter by default, so ?x=1 would
  // bypass the cache. Key it on collectionId only. Netlify wants this on every response.
  'Netlify-Vary': 'query=collectionId',
}

// Successful responses only: Netlify's CDN reuses one for an hour, then keeps serving it
// for up to a day while it fetches a fresh copy in the background. `durable` shares the
// cached copy across all of Netlify's edge servers (each would otherwise call the function
// itself), so Unsplash sees roughly one request per hour instead of one per visitor.
// Browsers aren't affected.
const CACHE_HEADERS = {
  'Netlify-CDN-Cache-Control': 'public, durable, max-age=3600, stale-while-revalidate=86400',
}

export default async function (req) {
  const collectionId = new URL(req.url).searchParams.get('collectionId') ?? COLLECTION_ID

  if (collectionId !== COLLECTION_ID) {
    return errorResponse(400, 'Invalid collectionId')
  }

  // The token goes in the Authorization header only, so it never appears in a URL or a log line
  const baseUrl = process.env.UNSPLASH_URL.replace(/\/?$/, '/')
  const url = new URL(`${COLLECTION_ID}/photos`, baseUrl)
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
    return errorResponse(502, 'Bad Gateway')
  }

  if (!response.ok) {
    console.log('Unsplash responded with', response.status, 'for collection', COLLECTION_ID)
    return errorResponse(response.status, response.statusText)
  }

  // Send only the three fields the game uses, in the same shape Unsplash returns them
  let photos
  try {
    photos = (await response.json()).map((photo) => ({
      urls: { thumb: photo.urls.thumb },
      links: { html: photo.links.html },
      user: { name: photo.user.name },
    }))
  } catch (error) {
    console.log('Unexpected response from Unsplash:', error.message)
    return errorResponse(502, 'Bad Gateway')
  }

  return new Response(JSON.stringify(photos), {
    status: 200,
    headers: { ...HEADERS, ...CACHE_HEADERS },
  })
}

function errorResponse(status, statusText) {
  return new Response(JSON.stringify({ status, statusText }), { status, headers: HEADERS })
}
