addEventListener('fetch', event => {
    const data = {
      city:  event.request.cf.city,
      colo:  event.request.cf.colo,
      country :  event.request.cf.country,
      region :  event.request.cf.region,
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