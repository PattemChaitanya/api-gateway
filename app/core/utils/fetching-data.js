const axios = require("axios");

async function fetchData(url, method, headers, body) {
  const response = await axios({
    method,
    url,
    headers,
    data: body,
  });

  return {
    status: response.status,
    data: response.data,
    headers: response.headers,
  };
}

module.exports = {
  fetchData,
};
