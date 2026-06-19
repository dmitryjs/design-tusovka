// Official YooKassa webhook source IPs:
// https://yookassa.ru/developers/using-api/webhooks

const YOOKASSA_IPV4_CIDRS = [
  "185.71.76.0/27",
  "185.71.77.0/27",
  "77.75.153.0/25",
  "77.75.156.11",
  "77.75.156.35",
  "77.75.154.128/25",
] as const;

const YOOKASSA_IPV6_PREFIX = "2a02:5180:";

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }

  let value = 0;
  for (const part of parts) {
    const octet = Number.parseInt(part, 10);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return null;
    }
    value = (value << 8) + octet;
  }

  return value >>> 0;
}

function ipv4MatchesCidr(ip: string, cidr: string): boolean {
  const [network, prefixLengthRaw] = cidr.split("/");
  const prefixLength = Number.parseInt(prefixLengthRaw ?? "", 10);
  const ipInt = ipv4ToInt(ip);
  const networkInt = ipv4ToInt(network);

  if (ipInt === null || networkInt === null || !Number.isInteger(prefixLength)) {
    return false;
  }

  const mask = prefixLength === 0 ? 0 : (~0 << (32 - prefixLength)) >>> 0;
  return (ipInt & mask) === (networkInt & mask);
}

export function isYookassaWebhookIp(ip: string | null | undefined): boolean {
  if (!ip) {
    return false;
  }

  const normalized = ip.trim().toLowerCase();

  if (normalized.includes(":")) {
    return normalized.startsWith(YOOKASSA_IPV6_PREFIX);
  }

  if (YOOKASSA_IPV4_CIDRS.some((entry) => !entry.includes("/") && entry === normalized)) {
    return true;
  }

  return YOOKASSA_IPV4_CIDRS.some((cidr) =>
    cidr.includes("/") ? ipv4MatchesCidr(normalized, cidr) : false,
  );
}
