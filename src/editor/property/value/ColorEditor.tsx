import React, {CSSProperties} from "react";
import Trigger from 'rc-trigger';
import {ColorResult, SketchPicker} from 'react-color';
import {PropDesc} from "../../../core/block/Descriptor";
import {ValueEditorProps} from "./ValueEditor";
import tinycolor from "tinycolor2";

export class ColorEditor extends React.Component<ValueEditorProps, any> {

  onValueChange = (value: ColorResult) => {
    let color = tinycolor(value.rgb);
    let {onChange} = this.props;
    onChange(color.toRgbString());
  };

  render() {
    let {desc, value, locked, onChange} = this.props;
    let {disableAlpha} = desc;
    let color = tinycolor(value);
    if (!color.isValid()) {
      value = 'none';
    }

    let disabled = (locked || onChange == null);
    let editorStyle: React.CSSProperties;
    if (disabled) {
      editorStyle = {cursor: 'not-allowed'};
    }

    return (
      <Trigger action={disabled ? [] : ['click']}
               popupAlign={{
                 points: ['tl', 'bl'],
                 offset: [0, 3],
                 overflow: {adjustX: true, adjustY: true}
               }}
               prefixCls='ant-dropdown'
               popup={
                 <SketchPicker color={value} width='224px' disableAlpha={disableAlpha}
                               onChangeComplete={this.onValueChange}/>
               }>
        <div className='ticl-color-editor' style={editorStyle}>
          <div className='ticl-color-editor-bg'/>
          <div style={{background: value}}/>
        </div>
      </Trigger>
    );
  }
}