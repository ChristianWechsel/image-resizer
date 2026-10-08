export function get(target: string) {
  return fetch(target).then((response) => response.json());
}
