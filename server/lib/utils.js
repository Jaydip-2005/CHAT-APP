import jwt from "jsonwebtoken";

// function to generate token for a user
export const generateToken = (userId) => {
  const token = jwt.sign(
    { userId },                    // payload
    process.env.JWT_SECRET,        // secret
    // { expiresIn: "30s" }           // options
  );
  return token;
};
