import jwt from "jsonwebtoken";

export const validateJWT = (req, res, next) => {
  const bearerToken = req.headers.authorization;

  if (bearerToken) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const { uid, role } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
      req.uid = uid;
      req.role = role;
      next();
    } catch (error) {
      console.log("error", error);
      return res.status(401).json({
        ok: false,
        message: "Token no válido",
      });
    }
  } else {
    return res.status(401).json({
      ok: false,
      message: "No hay token en la petición",
    });
  }
};
