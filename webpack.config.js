const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
	entry:  "./index.js",//已多次提及的唯一入口文件
	output: {
		path: "./dist",//打包后的文件存放的地方
    filename: "mqtt.js",//打包后输出文件的文件名
    libraryTarget: 'commonjs2' //可使用commonjs模块规范引用
	},
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'stage-2'],
        plugins: [
          "add-module-exports"
        ]
      }
    }]
  },
  plugins: [
    new UglifyJsPlugin()
  ]
}