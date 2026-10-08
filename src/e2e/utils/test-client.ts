// https://nodejs.org/learn/getting-started/fetch

export function get(target: string) {
  return fetch(target).then((response) => response.json());
}

export function post(
  target: string,
  message: {
    headers: Record<string, string>;
    body: BodyInit;
  },
) {
  return fetch(target, {
    method: "POST",
    headers: message.headers,
    body: message.body,
  })
    .then((response) => {
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => new Uint8Array(arrayBuffer));
}
