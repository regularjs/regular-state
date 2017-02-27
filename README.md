# regular-state

regular-state是基于[stateman](https://github.com/leeluolee/stateman) 和 Regular的单页应用框架.

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


## 贡献

- 文档使用markdown格式编写, 使用gitbook维护,  仓库地址(https://github.com/regularjs/doc/regular-state)

