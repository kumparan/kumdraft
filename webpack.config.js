module.exports = {
  entry: {
    app: ['./src/App.js']
  },
  output: {
    path: './public/assets',
    publicPath: '/assets/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        include: __dirname,
        query: {
          presets: ['es2015', 'react'],
          plugins: [
            "add-module-exports",
            "transform-class-properties"
          ]
        }
      }
    ]
  }
};