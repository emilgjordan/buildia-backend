export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '3600s' },
  },
});
