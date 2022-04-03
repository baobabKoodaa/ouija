addEventListener('fetch', event => {
    const city = event.request.cf.city;
    const data = {
      city: city,
    };
    const json = JSON.stringify(data, null, 2);
  
    return event.respondWith(
      new Response(json, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      })
    );
  });