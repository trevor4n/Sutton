const process = require('process')

const axios = require('axios')
const qs = require('qs')

exports.handler = async function (event, context, callback) {
  const API_PARAMS = qs.stringify(event.queryStringParameters)
  const COLLECTION_ID = API_PARAMS.slice(API_PARAMS.indexOf('=') + 1) || '90648782'
  const { API_TOKEN, API_TOKEN_TESTING, API_URL } = process.env
  const paginationCap = '30' //default is 10
/*   $ netlify functions-create
  ◈ Injected .env file env var: UNSPLASH_KEY
  ◈ Injected .env file env var: UNSPLASH_TESTING_KEY
  note this function requires API_URL and API_TOKEN build environment variables set in your Netlify Site. */
  // const URL = `${API_URL}${API_PARAMS}/photos?client_id=${API_TOKEN}&per_page=${paginationCap}&page=1`
  const URL = `${API_URL}${COLLECTION_ID}/photos?client_id=${process.env.UNSPLASH_KEY}&per_page=${paginationCap}&page=1`
  console.log('Constructed URL is ...', URL)

  try {
    const { data } = await axios.get(
      URL,
      { headers: {
        // Accept: "application/json",
        'Authorization': 'client_id=' + process.env.UNSPLASH_KEY,
        'Accept-Version': 'v1'
      } }
    )

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    }
  } catch (error) {
    const { data, headers, status, statusText } = error.response
    return {
      statusCode: error.response.status,
      body: JSON.stringify({ status, statusText, headers, data }),
    }
  }
}

// module.exports = { handler }
