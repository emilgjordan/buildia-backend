export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRATION_TIME },
  },
  refreshToken: {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
  },
});
