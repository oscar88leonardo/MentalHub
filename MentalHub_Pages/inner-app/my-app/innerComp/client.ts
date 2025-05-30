import { createThirdwebClient } from "thirdweb";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENTID;
///const secretKey = process.env.NEXT_PUBLIC_THIRDWEB_SECRETKEY;
//const secretKey ="0uWDQQZQiSyZymP7hHJ7fsedkJnJZBIR3J1t0hkQtPRRvg8EUC36xDoRJpp21QEJcKF39ZYcCUYXnZOI2ZTXXA";

export const client = createThirdwebClient({
    clientId: clientId as string,
    //secretKey: secretKey as string,
});