const process = require('process')

const axios = require('axios')
const qs = require('qs')

exports.handler = async function (event, context, callback) {
  const API_PARAMS = qs.stringify(event.queryStringParameters)
  const COLLECTION_ID = API_PARAMS.slice(API_PARAMS.indexOf('=') + 1) || '90648782'
  const paginationCap = '30' //default is 10
  // const { NODE_ENV, API_KEY: UNSPLASH_TOKEN, API_TST_KEY: UNSPLASH_TESTING_TOKEN, API_URL: UNSPLASH_URL } = process.env
  // ◈◈◈◈◈◈◈◈◈◈

  let URL = `${process.env.UNSPLASH_URL}${COLLECTION_ID}/photos?client_id=${process.env.UNSPLASH_TOKEN}&per_page=${paginationCap}&page=1`
  
  console.log('Constructed URL is ...', URL)

  try {
    const { data } = await axios.get(
      URL,
      { headers: {
        // Accept: "application/json",
        'Authorization': 'client_id=' + process.env.UNSPLASH_TOKEN,
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
