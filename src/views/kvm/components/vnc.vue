<template>
  <div class="app-vnc">
    <sticky :z-index="10" class-name="sub-navbar">
      <el-row>
        <el-col :span="8">
          <el-dropdown style="padding-left: 20px;float: left;">
            <el-button type="success">
              发送指令<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="sendCtrlAltDelClick">Ctrl+Alt+Delete</el-dropdown-item>
              <el-dropdown-item divided @click.native="sendCtrlAltFnClick(0)">Ctrl+Alt+F1</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(1)">Ctrl+Alt+F2</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(2)">Ctrl+Alt+F3</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(3)">Ctrl+Alt+F4</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(4)">Ctrl+Alt+F5</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(5)">Ctrl+Alt+F6</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(6)">Ctrl+Alt+F7</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(7)">Ctrl+Alt+F8</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(8)">Ctrl+Alt+F9</el-dropdown-item>
              <el-dropdown-item @click.native="sendCtrlAltFnClick(9)">Ctrl+Alt+F10</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <el-col :span="8" style="text-align: center;">
          <span style="color: white;">{{ desktopName }}</span>
        </el-col>

        <el-col :span="8">
          <el-dropdown ref="sendTextDropdownRef" trigger="click">
            <el-button type="success">发送文本</el-button>
            <el-dropdown-menu slot="dropdown" class="no-padding no-border" style="width:400px">
              <el-tag type="danger" style="width: 100%;text-align: center;margin-top: 5px;" size="medium">不支持中文以及非键盘上的符号</el-tag>
              <el-input ref="sendTextTextareaRef" v-model="sendTextTextarea" style="margin-top: 15px;margin-bottom: 15px;" type="textarea" placeholder="请输入内容" maxlength="100" rows="8" show-word-limit />
              <el-button type="primary" size="mini" style="float: right;margin-bottom: 5px;margin-right: 5px;" @click="sendText">Send</el-button>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </sticky>

    <div id="vncScreen" class="screen" />

  </div>

</template>

<script>
import RFB from '@novnc/novnc/core/rfb'
import Sticky from '@/components/Sticky/index'
import KeyTable from '@novnc/novnc/core/input/keysym'

export default {
  name: 'Vnc',
  components: { Sticky },
  data() {
    return {
      rfb: null,
      url: process.env.VUE_APP_NOVNC_API, // 链接的url
      IsClean: false, // 是否已断开并不可重新连接
      connectNum: 0, // 重连次数
      desktopName: '连接中。。。',
      sendTextTextarea: ''
    }
  },
  mounted() {
    // 这时已经可以获取到dom元素
    this.connectVnc()
  },
  methods: {
    toUnicode(theString) {
      var unicodeString = ''
      for (var i = 0; i < theString.length; i++) {
        var theUnicode = theString.charCodeAt(i).toString(16).toUpperCase()
        while (theUnicode.length < 4) {
          theUnicode = '0' + theUnicode
        }
        theUnicode = '0x' + theUnicode
        unicodeString += theUnicode
      }
      return unicodeString
    },
    sleep(d) {
      return new Promise((resolve) => setTimeout(resolve, d))
    },
    async sendText() {
      this.$refs.sendTextDropdownRef.visible = false
      const str = String(this.sendTextTextarea)
      const shiftStr = '~!@#$%^&*()_+|{}:"<>?'

      for (let i = 0, len = str.length; i < len; i++) {
        if (shiftStr.indexOf(str[i]) >= 0) {
          this.rfb.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', true)
          this.rfb.sendKey(this.toUnicode(str[i]), '', true)
          this.rfb.sendKey(this.toUnicode(str[i]), '', false)
          this.rfb.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', false)
        } else {
          this.rfb.sendKey(this.toUnicode(str[i]), '', true)
          this.rfb.sendKey(this.toUnicode(str[i]), '', false)
        }
        this.rfb._sock.send([])
        await this.sleep(100)
      }
    },
    sendCtrlAltDelClick() {
      this.rfb.sendCtrlAltDel()
    },
    sendCtrlAltFnClick(f) {
      const keys_code = [0xFFBE, 0xFFBF, 0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC4, 0xFFC5, 0xFFC6, 0xFFC7, 0xFFC8, 0xFFC9]
      this.rfb.sendKey(KeyTable.XK_Control_L, 'ControlLeft', true)
      this.rfb.sendKey(KeyTable.XK_Alt_L, 'AltLeft', true)
      this.rfb.sendKey(keys_code[f], 'Fn', true)
      this.rfb.sendKey(keys_code[f], 'Fn', false)
      this.rfb.sendKey(KeyTable.XK_Alt_L, 'AltLeft', false)
      this.rfb.sendKey(KeyTable.XK_Control_L, 'ControlLeft', false)
    },

    // vnc连接断开的回调函数
    disconnectedFromServer(msg) {
      if (msg.detail.clean) {
        // 根据 断开信息的msg.detail.clean 来判断是否可以重新连接
        this.desktopName = '连接断开，进行重连。。。'
        this.connectVnc()
      } else {
        this.desktopName = '连接被关闭'
      }
    },
    // 连接成功的回调函数
    connectedToServer() {
      this.desktopName = 'Connected to ' + this.desktopName
    },
    updateDesktopName(e) {
      this.desktopName = e.detail.name
    },

    // 连接vnc的函数

    connectVnc() {
      const token = this.$route.query.token
      this.url = this.url + `?token=${token}`
      const password = ''
      const rfb = new RFB(document.getElementById('vncScreen'), this.url, {
        // 向vnc 传递的一些参数，比如说虚拟机的开机密码等
        credentials: { password: password }
      })
      rfb.addEventListener('connect', this.connectedToServer)
      rfb.addEventListener('disconnect', this.disconnectedFromServer)
      rfb.addEventListener('desktopname', this.updateDesktopName)
      // rfb.scaleViewport = true // scaleViewport指示是否应在本地扩展远程会话以使其适合其容器。禁用时，如果远程会话小于其容器，则它将居中，或者根据clipViewport它是否更大来处理。默认情况下禁用。
      rfb.resizeSession = true // 是一个boolean指示是否每当容器改变尺寸应被发送到调整远程会话的请求。默认情况下禁用
      this.rfb = rfb
    }

  }
}
</script>

<style scoped>
  .screen {
  margin: 30px auto;
  }

  .screen aside {
    margin-bottom: 0;
  }

  .app-vnc {
    height: 100%;
    background: rgb(40, 40, 40);
  }
</style>
