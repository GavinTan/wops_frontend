import React, {useEffect, useRef, useState} from "react";
// @ts-ignore
import Guacamole from 'guacamole-common-js';
import {Button, Col, Dropdown, Input, Menu, message, Row, Tag} from "antd";
import './index.less'
import KeyTable from "./keysym";
import {DownOutlined} from "@ant-design/icons";
import {actionInstance} from "@/services/wops/kvm";

const Console: React.FC = (props: any) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const [guac, setGuac] = useState<any>();
  const [sendTxtValue, setSendTxtValue] = useState<string>('');
  const desktopName = '1';

  const STATE_IDLE = 0;
  const STATE_CONNECTING = 1;
  const STATE_WAITING = 2;
  const STATE_CONNECTED = 3;
  const STATE_DISCONNECTING = 4;
  const STATE_DISCONNECTED = 5;


  useEffect(() => {
    document.title = '172.16.7.14'
    actionInstance({data: {instanceId: props.location.query.instanceId, action: 'console'}}).then(res => {



    const tunnel = new Guacamole.WebSocketTunnel('ws://127.0.0.1:8000/ws/kvm/?id=999&name=123')
    const client = new Guacamole.Client(
      // new Guacamole.HTTPTunnel("tunnel")
      tunnel
    );

    client.onclipboard = function(stream, mimetype) {
    //called when clipboard data changed
      console.log(stream)
      console.log(mimetype)
};


    // Add client to display div
    screenRef.current!.appendChild(client.getDisplay().getElement());


    // Error handler
    client.onerror = function (error: any) {
      console.log(error);
    };

    // Connect
    client.connect();

    // Disconnect on close
    window.onunload = () => client.disconnect();

    // Mouse
    client.getDisplay().getElement().getElementsByTagName("canvas")[0].style = "z-index: 11;"
    const mouse = new Guacamole.Mouse(client.getDisplay().getElement());

    mouse.onmousedown =
    mouse.onmouseup =
    mouse.onmousemove = function (mouseState: any) {
      client.sendMouseState(mouseState);
    };

    const sink = new Guacamole.InputSink();
    screenRef.current?.appendChild(sink.getElement());
    sink.focus();

    // Keyboard
    const keyboard = new Guacamole.Keyboard(sink.getElement());
    keyboard.onkeydown = function (keysym: any) {
      client.sendKeyEvent(1, keysym);
    };
    keyboard.onkeyup = function (keysym: any) {
      client.sendKeyEvent(0, keysym);
    };

    client.getDisplay().onresize = (w, h) => {
      console.log(w, h)
      console.log(9999)
    }

    client.onstatechange = (state: number) => {
      switch (state) {
        case STATE_IDLE:
          message.destroy();
          message.loading('正在初始化中...', 0);
          break;
        case STATE_CONNECTING:
          message.destroy();
          message.loading('正在努力连接中...', 0);
          break;
        case STATE_WAITING:
          message.destroy();
          message.loading('正在等待服务器响应...', 0);
          break;
        case STATE_CONNECTED:
          message.destroy();
          message.success('连接成功');
          break;
        case STATE_DISCONNECTING:
        case STATE_DISCONNECTED:
          message.destroy();
          message.error('连接断开');
          break;
        default:
          break;
      }
    }

    console.log(tunnel.uuid)
    tunnel.onuuid = (d) => {
      console.log(999, d)
    }
    client.onname = (name) => {
      console.log(2222, name)
    }

    tunnel.sendMessage('nop')

    setGuac(client);
    })
  }, []);

  const sendText = (text: string) => {
    const shiftStr = '~!@#$%^&*()_+|{}:"<>?';

    for (let i = 0; i < text.length; i++) {

        // Get current codepoint
        const codepoint = text.charCodeAt(i);

        // Convert to keysym
        let keysym;
        if (codepoint >= 0x0100)
            keysym = 0x01000000 | codepoint;
        else
            keysym = codepoint;

      if (shiftStr.indexOf(text[i]) >= 0) {
        guac.sendKeyEvent(1, KeyTable.XK_Shift_L);
        guac.sendKeyEvent(1, keysym)
        guac.sendKeyEvent(0, keysym);
        guac.sendKeyEvent(0, KeyTable.XK_Shift_L);
      } else {
        guac.sendKeyEvent(1, keysym)
        guac.sendKeyEvent(0, keysym);
      }
    }
  }

  const clipboard = (text: string) => {
    const stream = guac.createClipboardStream("text/plain");
    const writer = new Guacamole.StringWriter(stream);

    // Send text chunks
    for (let i = 0; i < text.length; i += 4096)
    writer.sendText(text.substring(i, i + 4096));

    // Close stream
    writer.sendEnd();
  }

  const sendCombinationKey = (keys: number[]) => {
        for (let i = 0; i < keys.length; i++) {
            guac.sendKeyEvent(1, keys[i]);
        }
        for (let j = 0; j < keys.length; j++) {
            guac.sendKeyEvent(0, keys[j]);
        }
    }

  const sendKeyMenu = (
    <Menu onClick={(e) => {
      if (e.key === 'delete') {
        sendCombinationKey([ KeyTable.XK_Control_L, KeyTable.XK_Alt_L, KeyTable.XK_Delete]);
      }
      if (e.key === 'win') {
        sendCombinationKey([KeyTable.XK_Super_L]);
      }
      if (e.key === 'win+r') {
        sendCombinationKey([KeyTable.XK_Super_L, KeyTable.XK_R]);
      }
      if (e.key === 'win+e') {
        sendCombinationKey([KeyTable.XK_Super_L, KeyTable.XK_E]);
      }
    }}>
      <Menu.Item key="delete">
        Ctrl+Alt+Delete
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="win">
        Windows
      </Menu.Item>
      <Menu.Item key="win+e">
        Windows+E
      </Menu.Item>
      <Menu.Item key="win+r">
        Windows+R
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
          maxLength={100}
          rows={5}
          onChange={(e) => {
            setSendTxtValue(e.target.value);
          }}
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
            sendText(sendTxtValue);
          }}
        >Send</Button>
      </Menu.Item>
    </Menu>
  )

  return <div>
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
      <div className="container">
      <div ref={screenRef}/>
        </div>
    </div>
}


export default Console;
