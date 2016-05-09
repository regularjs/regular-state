# regular-state

regular-state是基于[stateman](https://github.com/leeluolee/stateman) 和 Regular的单页应用框架.

## 文档

请见[如何开发基于Regularjs的单页应用](http://regularjs.github.io/guide/zh/spa/stateman.html)

## 范例

[基于regular-state与webpack的单页范例](https://github.com/regularjs/example/tree/master/routing)



```js
routes: {
    'app': {
        default: '/:id'
    }
    'app.$notfound': {

    }
        
    
}
<div>
    
</div>

```

##遗留问题

# 低版本IE的fallback
# Promise 
# 一个类似Link的东西， 所有此类directive或组件直接全局注册在Regular即可
# default 
# notfound
# directive 可以支持 不默认parse
# 动态组件。
# 单双引号， 属性设置有坑
# isRunning 有坑
# run 需要try 太白痴了
# 秒拍发微博 介绍




