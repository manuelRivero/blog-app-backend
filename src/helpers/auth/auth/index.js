import jwt from "jsonwebtoken";
export const generatejWT = (uid = "", role = "user") => {
  return new Promise((resolve, reject) => {
    const payload = { uid, role };
    jwt.sign(
      payload,
      process.env.SECRETORPRIVATEKEY,
      {
        expiresIn: "24h",
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};

export const generateRefreshJWT = (uid) => {
  return new Promise((resolve, reject) => {
    const payload = { uid };
    jwt.sign(
      payload,
      `${process.env.SECRETORPRIVATEKEY}`,
      {
        expiresIn: "7d",
      },
      (err, tokenRefresh) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el token");
        } else {
          resolve(tokenRefresh);
        }
      }
    );
  });
};
