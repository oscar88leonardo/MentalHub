/**
 * Model IDs extraídos de definition.json (ComposeDB).
 * Usados para la migración a Ceramic SDK.
 */
export const MODEL_IDS = {
  InnerverProfile:
    "kjzl6hvfrbw6c7y0yvbxlnw8u3e2yzs7rbglx4vdec2zlq4eb7g0ii1q8hctii1",
  Schedule:
    "kjzl6hvfrbw6c81d5hth9hbd4a7n4zws5cemhgakkncrfwd8xl5g538ikn0jlx0",
  SessionResponse:
    "kjzl6hvfrbw6c7uqhh3d4s829ldwtsat1fhzffml4oczwm3ll6tvratvexiizg0",
  SessionCredit:
    "kjzl6hvfrbw6c7qyctd2qbqf686un8pxnlw7m2hr5kzuxibt6tnk1yv1b2u0ii7",
  ScheduleTherapist:
    "kjzl6hvfrbw6cawgs4syu07mxy3qa6i8tym3yi2pnyj4tu6o4wgh1i24mro9jjm",
  Workshop:
    "kjzl6hvfrbw6c8j0qn71ouvvmznwlj7bocas3ub9jl5gapf3xe1j4bbpiqsarqr",
  TherapistProfile:
    "kjzl6hvfrbw6c78tvswx6g5ymh9jg0tivj3lit73pi66mtzd7kx09q95yv0fz9l",
  ConsultantProfile:
    "kjzl6hvfrbw6cb6k2xemp930m68movcl51wgexjh1obgcflawkrznrgg5s4ic9j",
} as const;

/** URL del nodo Ceramic. Usar IP mientras no hay dominio. */
export const CERAMIC_NODE_URL =
  process.env.NEXT_PUBLIC_CERAMIC_URL ||
  "http://34.41.166.249"; /* https://ceramicnode.innerverse.care cuando recuperemos el dominio */
