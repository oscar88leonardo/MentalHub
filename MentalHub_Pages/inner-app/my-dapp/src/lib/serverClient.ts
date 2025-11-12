import { createThirdwebClient } from "thirdweb";
export const serverClient = createThirdwebClient({
  // Usar secret key en entorno de servidor para evitar límites de clientId de demo
  secretKey: process.env.THIRDWEB_SECRET_KEY as string,
});


