module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/whatsapp" : "/",
  devServer: {
    proxy: "https://192.168.10.230",
  },
};
