<template>
  <div class="app-container">
    <el-table
      ref="table"
      :data="tableData"
      style="width: 100%"
      row-key="id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="#" width="50" />
      <el-table-column label="主机" prop="host">
        <template slot-scope="scope">
          <div v-if="!Number.isInteger(scope.row.memory_usage)">
            <el-button type="text" @click="getVmInfo(scope.row)">{{ scope.row.name }}</el-button>
          </div>
          <div v-else>{{ scope.row.host }}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="180">
        <template slot-scope="scope">
          <div v-if="Number.isInteger(scope.row.memory_usage)">
            <span v-if="scope.row.status" style="color: #67C23A">Connected</span>
            <span v-else style="color: #F56C6C">Not Connected</span>
          </div>
          <div v-else>
            <span v-if="scope.row.status === 1" style="color: #67C23A">运行</span>
            <span v-if="scope.row.status === 5" style="color: #909399">关机</span>
            <span v-if="scope.row.status === 3" style="color: #E6A23C">暂停</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="CPU" prop="cpu" width="180" />
      <el-table-column label="内存" prop="memory" width="180" />
      <el-table-column label="内存使用量 / 操作">
        <template slot-scope="scope">
          <div v-if="Number.isInteger(scope.row.memory_usage)">
            <el-progress v-if="scope.row.memory_usage < 60" :text-inside="true" :stroke-width="15" :percentage="scope.row.memory_usage" status="success" />
            <el-progress v-if="scope.row.memory_usage >= 60" :text-inside="true" :stroke-width="15" :percentage="scope.row.memory_usage" status="warning" />
            <el-progress v-if="scope.row.memory_usage >= 80" :text-inside="true" :stroke-width="15" :percentage="scope.row.memory_usage" status="exception" />
          </div>
          <div v-else>
            <el-button-group>
              <el-tooltip content="启动">
                <el-button size="mini" type="info" icon="el-icon-video-play" />
              </el-tooltip>
              <el-tooltip content="暂停">
                <el-button size="mini" type="info" icon="el-icon-video-pause" :disabled="scope.row.disabled" @click="stopVM(scope.row)" />
              </el-tooltip>
              <el-tooltip content="关闭">
                <el-button size="mini" type="info" icon="el-icon-switch-button" />
              </el-tooltip>
              <el-tooltip content="删除">
                <el-button size="mini" type="info" icon="el-icon-delete" @click.native.prevent="deleteVM(scope.row)" />
              </el-tooltip>
              <el-tooltip content="连接">
                <el-button size="mini" type="info" icon="el-icon-s-platform" />
              </el-tooltip>
            </el-button-group>
          </div>
        </template>

      </el-table-column>
    </el-table>

    <el-dialog title="详情" :visible.sync="vmInfoVisible">
      <el-form :model="form">
        <el-form-item label="活动名称" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="活动区域" :label-width="formLabelWidth">
          <el-select v-model="form.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getVmData, deleteVM, getVmInfo, addVM } from '@/api/kvm'

export default {
  data() {
    return {
      tableData: [],
      vmInfoVisible: false,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      formLabelWidth: '120px'
    }
  },
  created() {
    this.getVmData()
  },
  methods: {
    getVmInfo(row) {
      const vmId = row.id
      const nodeHost = row.form_host
      getVmInfo(vmId, nodeHost).then(response => {
        console.log(response.data)
      }).catch(error => console.log(error))
      // getVmInfo(vmId, nodeHost).then(response => {
      //   this.vmInfoVisible = true
      //   console.log(response.data)
      // })
    },
    getVmData() {
      getVmData().then(response => {
        this.tableData = response.data
      })
    },
    stopVM(row) {
      this.$set(row, 'disabled', true)
      this.$message({
        type: 'success',
        message: '停用成功'
      })
    },
    deleteVM(row) {
      const tableData = this.tableData
      const h = this.$createElement
      this.$confirm(h('p', null, [
        h('span', null, '确认删除 '),
        h('i', { style: 'color: teal' }, row.host),
        h('span', null, ' 虚拟机吗？')
      ]), '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await tableData.forEach((item) => {
          if (item['host'] === row.form_host) {
            deleteVM().then(response => {
              console.log(response.status)
              item.children.splice(item.children.indexOf(row), 1)
              this.$message({
                type: 'success',
                message: '删除成功'
              })
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-container {
    .roles-table {
      margin-top: 30px;
    }

    .permission-tree {
      margin-bottom: 30px;
    }
  }
</style>
