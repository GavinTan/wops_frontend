import React, {useEffect, useState, useRef} from "react";
// @ts-ignore
import RFB from '@novnc/novnc/core/rfb';
// @ts-ignore
import KeyTable from '@novnc/novnc/core/input/keysym'
import {DownOutlined} from '@ant-design/icons';
import {Menu, Dropdown, Button, Input, Tag, Row, Col} from 'antd';
import "./index.less"


const VNC: React.FC = (props: any) => {
  const vncUrl = `ws://127.0.0.1:6088?token=${props.location.query.token}`;
  const [desktopName, setDesktopName] = useState<string>('正在连接中。。。');
  const [sendTxtValue, setSendTxtValue] = useState<string>('');
  const [disconnected, setDisconnected] = useState<number>(0);
  const screenRef = useRef(null);
  const [rfbObj, setRfbObj] = useState<any>();
  const connectNum = 5;  // 重连次数
  let name = '';

  const connectedToServer = () => {
    setDesktopName(name);
  }

  const updateDesktopName = (e: any) => {
    name = e.detail.name;
  }

  const disconnectedFromServer = (msg: any) => {
    if (msg.detail.clean) {
      setDesktopName('连接断开，进行重连。。。')
      for (let i = 0; i <= connectNum; i += 1) {
        setTimeout(() => {
          setDisconnected(i)
        }, 1000);
      }
    } else {
      setDesktopName('连接被关闭')
    }
  }


  const toUnicode = (theString: any) => {
    let unicodeString = '';
    for (let i = 0; i < theString.length; i += 1) {
      let theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
      while (theUnicode.length < 4) {
        theUnicode = `0${theUnicode}`;
      }
      theUnicode = `0x${theUnicode}`;
      unicodeString += theUnicode;

    }
    return unicodeString;
  }

  const sendCtrlAltFn = (f: any) => {
    const keysCode = [0xFFBE, 0xFFBF, 0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC4, 0xFFC5, 0xFFC6, 0xFFC7, 0xFFC8, 0xFFC9];
    rfbObj.sendKey(KeyTable.XK_Control_L, 'ControlLeft', true);
    rfbObj.sendKey(KeyTable.XK_Alt_L, 'AltLeft', true);
    rfbObj.sendKey(keysCode[f], 'Fn', true);
    rfbObj.sendKey(keysCode[f], 'Fn', false);
    rfbObj.sendKey(KeyTable.XK_Alt_L, 'AltLeft', false);
    rfbObj.sendKey(KeyTable.XK_Control_L, 'ControlLeft', false);
  }


  useEffect(() => {
    const rfb = new RFB(screenRef.current, vncUrl);

    rfb.addEventListener('connect', connectedToServer);
    rfb.addEventListener('disconnect', disconnectedFromServer);
    rfb.addEventListener('desktopname', updateDesktopName);
    setRfbObj(rfb);
  }, [disconnected]);


  const sendKeyMenu = (
    <Menu onClick={(e) => {
      if (e.key === 'delete') {
        rfbObj.sendCtrlAltDel();
      }
      sendCtrlAltFn(e.key);
    }}>
      <Menu.Item key="delete">
        Ctrl+Alt+Delete
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="0">
        Ctrl+Alt+F1
      </Menu.Item>
      <Menu.Item key="1">
        Ctrl+Alt+F2
      </Menu.Item>
    </Menu>
  );

  const sendTextMenu = (
    <Menu style={{width: 300, height: 240}}>
      <Menu.Item key="send">
        <Tag
          style={{width: '100%', textAlign: 'center', marginBottom: 15}}
          color="orange"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >不支持中文以及非键盘上的符号</Tag>
        <Input.TextArea
          showCount
          onChange={(e) => {
            setSendTxtValue(e.target.value);
          }}
          maxLength={100}
          rows={5}
          onPressEnter={(e) => {
            e.stopPropagation();
          }}
          onClick={(a) => {
            a.stopPropagation();
          }}/>
        <Button
          style={{right: 0, marginRight: 10, marginTop: 30, position: 'absolute'}}
          type="primary"
          onClick={() => {
            const shiftStr = '~!@#$%^&*()_+|{}:"<>?';

            for (let i = 0; i < sendTxtValue.length; i += 1) {
              if (shiftStr.indexOf(sendTxtValue[i]) >= 0) {
                rfbObj.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', true);
                rfbObj.sendKey(toUnicode(sendTxtValue[i]), '', true);
                rfbObj.sendKey(toUnicode(sendTxtValue[i]), '', false);
                rfbObj.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', false);
              } else {
                rfbObj.sendKey(toUnicode(sendTxtValue[i]), '', true);
                rfbObj.sendKey(toUnicode(sendTxtValue[i]), '', false);
              }
              // eslint-disable-next-line no-underscore-dangle
              rfbObj._sock.send([]);
            }
          }}
        >Send</Button>
      </Menu.Item>
    </Menu>
  )

  return (
    <div>
      <div className="header">
        <Row>
          <Col span={8}>
            <Dropdown overlay={sendKeyMenu}>
              <Button style={{float: 'left', margin: '8px 10px'}} size="small" type="default">
                按键操作 <DownOutlined/>
              </Button>
            </Dropdown>
          </Col>
          <Col span={8}>
            <div style={{textAlign: 'center', margin: '8px 10px', color: '#FFFFFF'}}>{desktopName}</div>
          </Col>
          <Col span={8}>
            <Dropdown overlay={sendTextMenu} trigger={['click']} placement="topRight" arrow>
              <Button style={{float: 'right', margin: '8px 10px',}} size="small" type="default">发送文本</Button>
            </Dropdown>
          </Col>
        </Row>
      </div>
      <div ref={screenRef}/>
    </div>
  )

}

export default VNC;
