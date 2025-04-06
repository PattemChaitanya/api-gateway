const { fetchData } = require("./fetching-data");

async function forwardRequest(service, request) {
  const targetUrl = `${service[1].host}${request.url}`;

  const response = await fetchData(targetUrl, request.method, request.headers, request.body);

  return {
    status: response.status,
    data: response.data,
    headers: response.headers,
  };
}

module.exports = {
  forwardRequest,
};
