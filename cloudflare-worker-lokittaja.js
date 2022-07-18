addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    const proxy_url = "https://endpoint1.collection.eu.sumologic.com/receiver/v1/http/ZaVnC4dhaV0vBIvS0oahg-8LYhDkyFCtWZ2zZ_7NbP0x0PYd0DmEk2cLgA4DJlePqnHWB5KjcxPFudwdOmtop0b6isr9VgLeKHYmzJ6eSqkD0cyZ6FNQiQ=="
    const params = "" + request.url.split('?')[1]
    if (params === "" || params === "undefined") {
        return new Response("Invalid request")
    }
    const response = await fetch(proxy_url + '?' + params);
    return new Response("Logged", {
        headers: {
        'content-type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }