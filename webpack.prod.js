const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        // https://github.com/terser-js/terser#compress-options
        terserOptions: {
          ecma: undefined,
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      APP_CONF: {
        productionMode: true,
        skipWaiting: true,
      },
    }),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
    }),
    new WebpackPwaManifest({
      name: 'Metro Help Application',
      short_name: 'Metro Help',
      description: 'Find Metropolia UAS student lunch menus, public transport timetables and local weather.',
      background_color: '#ffffff',
      crossorigin: 'use-credentials',
      publicPath: '.',
      icons: [
        {
          src: path.resolve('src/assets/icon.png'),
          sizes: [96, 128, 192, 256, 384, 512],
        },
      ],
    }),
  ],
});
