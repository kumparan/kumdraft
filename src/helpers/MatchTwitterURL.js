export default function MatchTwitterURL(url) {
  var p = /http(?:s)?:\/\/(?:www.)?twitter\.com\/([a-zA-Z0-9_]+)\/status\//;
  var matches = url.match(p);
  if (matches) {
    return matches[1];
  }
  return false;
}