# regular-state

**regular-state**是整合了 [Regularjs(MVVM组件框架)](https://github.com/regularjs/regular)和 [Stateman(基于状态抽象的路由库)](https://github.com/leeluolee/stateman)的单页系统框架，它支持**服务端渲染(Server side Rendering)**


## 指南

[文档指南](http://regularjs.github.io/regular-state/)

## 特性

- **服务端渲染支持**
- 基于层级状态的**多层路由**支持, 可动态增删路由节点
- **异步路由**支持，每个生命周期都可以异步处理
- 支持**异步View**加载(依赖模块系统支持)
- **强大路径匹配**, 类express语法
- 三种方案(history/hashchange/iframe轮训)的**自动降级与升级**
- 低版本支持(需引入Promise Polyfill)


## 浏览器支持

**regular-state**可运行在支持ES5的浏览器，并且需要Promise的支持. 低级浏览器请使用类似[promise-polyfill](https://github.com/taylorhakes/promise-polyfill)的垫片脚本

## TODO

# 低版本IE的fallback
# Promise 
# default 
# notfound
# 单双引号， 属性设置有坑
# isRunning 有坑
# run 需要try 太白痴了

## 贡献

- 文档使用markdown格式编写, 使用gitbook维护,  仓库地址(https://github.com/regularjs/doc/regular-state)

