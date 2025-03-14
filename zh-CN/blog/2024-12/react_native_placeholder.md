---
lastUpdated: true
commentabled: true
recommended: true
title: react-native Image 实现placeholder占位图
description: react-native Image 实现placeholder占位图
date: 2024-12-16 14:18:00
pageClass: blog-page-class
---

# react-native Image 实现placeholder占位图 #

`react-native` Image没有placeholder这样的props，但是业务有需要这种场景，网上找了几种方法：

- 包裹Image，但是该方法在新版本已无法使用
- 使用ImageBackground包裹Image，如果图片有透明度，背景图和网络加载的图片就叠加在一起了

![预览图](/images/rn_phones.png)

所以可以自定义一个组件实现网络加载图片失败后的占位图：

```vue
import React from 'react';
import {Image} from 'react-native';
import PropTypes from 'prop-types';

class ImageView extends React.PureComponent {
    static propTypes = {
        source: PropTypes.object,
        style: Image.propTypes.style,
        placeholderSource: PropTypes.number.isRequired,
    };

    state: {
        source: {},
        loading: boolean
    };

    constructor(props) {
        super(props);
        this.state = {
            source: this.props.source,
            loading: true,
        };
    }

    render() {
        return (
            <Image source={this.state.source} style={this.props.style} onLoad={() => {
                this.setState({loading: false})
            }} onLoadEnd={() => {
                if (this.state.loading === true) {
                    this.setState({source: this.props.placeholderSource})
                }
            }}/>
        );
    }

}

export default ImageView;
```

如果希望Image在未加载网络图片时就有占位图可以用两个Image实现:

```vue
import React from 'react';
import {Image, StyleSheet, View, ViewPropTypes} from 'react-native';
import PropTypes from 'prop-types';

class ImageView extends React.PureComponent {
    static propTypes = {
        source: PropTypes.object,
        style: ViewPropTypes.style,
        placeholderSource: PropTypes.number.isRequired,
    };

    state: {
        loading: boolean;
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    render() {
        return (
            <View style={this.props.style}>
                <Image style={[this.props.style, styles.imageStyle]} source={this.props.source} onLoad={() => this.setState({loading: false})}/>
                {this.state.loading ? <Image style={[this.props.style, styles.imageStyle]} source={this.props.placeholderSource}/> : null}
            </View>
        );
    }

}

const styles = StyleSheet.create({
    imageStyle: {position: 'absolute', top: 0, right: 0, left: 0, bottom: 0}
});

export default ImageView;
```

使用时设置placeHolderSource为占位图资源即可。

```vue
<ImageView style={styles.icon} source={{uri: imageUrl}} placeholderSource={require("./img/icon.png")}/>
```
