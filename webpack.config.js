// webpack.config.js
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/pds/npmBuildIndex.js',
  output: {
    path: path.resolve(__dirname, 'build'),
   filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
     {
        test: /\.js$/,
       include: path.resolve(__dirname, 'src/pds'),
        exclude: /(node_modules|bower_components|build)/,
       use: {
         loader: 'babel-loader',
         options: {
            presets: ["@babel/preset-env"]
          }
        }
      }, {
        test: /\.*css$/,
        use : ExtractTextPlugin.extract({
           fallback : 'style-loader',
            use : [
                'css-loader',
                'sass-loader'
           ]
        })
      },
    ]
  },
  externals: {
    'react': 'commonjs react' 
  }
};