# vue0

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### delopy to github pages

add below into vue.config.js, '/fit/' is the github repo name

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/fit/' : '/',
})



安装这个js模块
```
npm install gh-pages
```
add deploy command so that we can deploy use 
```
yarn deploy
```
`
"scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "deploy": "gh-pages -d dist"
  },
`


