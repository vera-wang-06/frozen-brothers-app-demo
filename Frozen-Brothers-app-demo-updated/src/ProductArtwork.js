import React from 'react';
import {Image,View} from 'react-native';
import Icon from './Icon';
import Svg,{Path,Ellipse,Line} from 'react-native-svg';
export default function ProductArtwork({product,assets,style}){
 if(assets[product.id])return <View style={style}><Image source={assets[product.id]} style={{width:'100%',height:'100%',resizeMode:'contain'}}/>{product.type==='Videos'&&<View style={{position:'absolute',right:4,bottom:4,backgroundColor:'#85CCDB',borderRadius:14,padding:5}}><Icon name="play" size={17}/></View>}</View>;
 return <View style={[style,{alignItems:'center',justifyContent:'center'}]}><Svg width="85%" height="85%" viewBox="0 0 120 100" fill="none" accessibilityLabel={product.name}>{product.id==='cups'?<><Path d="M28 19h54l-7 66H35Z" fill="#E0F2F6" stroke="#75BBD0" strokeWidth="2"/><Ellipse cx="55" cy="19" rx="27" ry="6" fill="#fff" stroke="#75BBD0" strokeWidth="2"/><Path d="M35 51h40l-2 19H37Z" fill="#85CCDB"/><Path d="M39 60h31" stroke="#fff" strokeWidth="3"/><Path d="M83 29h14l-7 53H77" stroke="#A8D9E4" strokeWidth="2"/></>:<><Path d="M18 73 93 18M24 82l76-54M36 87l71-51" stroke="#E6F5F8" strokeWidth="9"/>{[0,1,2,3,4,5].map(i=><React.Fragment key={i}><Line x1={24+i*11} y1={69-i*8} x2={30+i*11} y2={66-i*8} stroke="#52AEC6" strokeWidth="9"/><Line x1={31+i*11} y1={78-i*8} x2={37+i*11} y2={74-i*8} stroke="#52AEC6" strokeWidth="9"/><Line x1={44+i*10} y1={81-i*7} x2={49+i*10} y2={77-i*7} stroke="#52AEC6" strokeWidth="9"/></React.Fragment>)}</>}</Svg></View>
}
