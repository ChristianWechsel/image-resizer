// https://nodejs.org/learn/getting-started/fetch

export function get(target: string) {
  return fetch(target).then((response) => response.json());
}

export function post(target: string) {
  return fetch(target, {
    method: "POST",
  }).then((response) => response.json());
}
