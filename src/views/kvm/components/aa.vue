<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-input
          v-model="tableSearch"
          style="width: 200px;float: right;"
          class="filter-item"
          placeholder="搜索"
          prefix-icon="el-icon-search"
          :default-sort="{prop: 'age', order: 'descending'}"
          @change="searchData"
        />
        <el-button type="primary" icon="el-icon-edit" @click="addData">添加问卷</el-button>
      </div>
      <el-table
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column
          label="Name"
          prop="name"
          sortable
        />
        <el-table-column
          label="Age"
          prop="age"
          sortable
        />
        <el-table-column
          label="Desc"
          prop="desc"
          sortable
        >
          <template slot-scope="scope">
            <p v-html="scope.row.desc" />
          </template>
        </el-table-column>
        <el-table-column
          label="Timestamp"
          prop="timestamp"
          sortable
        />
      </el-table>
    </el-card>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getData" />

    <el-dialog title="添加问卷" :visible.sync="addDialogVisible" :width="dialogWidth">
      <el-form ref="nodeFormRef" :model="nodeForm" label-position="left" label-width="70px" :rules="nodeFormRules">
        <el-form-item label="标题" prop="host" style="width: 470px">
          <el-input v-model="nodeForm.host" />
        </el-form-item>
        <el-form-item label="评估内容" prop="type">
          <el-select v-model="nodeForm.conn_type" placeholder="请选择连接类型" style="width: 400px" multiple>
            <el-option label="组织管理" value="ssh" />
            <el-option label="防控方案" value="tcp" />
            <el-option label="实施过程" value="tls" />
            <el-option label="防控效果" value="tls" />
            <el-option label="特别评价" value="tls" />
          </el-select>
          <el-link class="el-icon-edit" style="margin-left: 10px" @click="dd" />
        </el-form-item>
        <el-form-item label="问卷期限">
          <el-date-picker v-model="value2" type="datetimerange" align="right" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['12:00:00', '08:00:00']" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addNodeClick">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      width="60%"
      title="内层 Dialog"
      :visible.sync="innerVisible"
      append-to-body
    >

      <el-table
        :data="tableData1"
        :span-method="objectSpanMethod"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="a"
          label="评估内容"
        />
        <el-table-column
          prop="b"
          label="分部内容"
        />
        <el-table-column
          prop="c"
          label="分项内容"
        />
        <el-table-column
          prop="d"
          label="评估标准"
        />
        <el-table-column
          prop="e"
          label="分值"
        />
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="innerVisible = false">取 消</el-button>
        <el-button type="primary" @click="addNodeClick">确 定</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
import * as api from '@/api/es'
import Pagination from '@/components/Pagination'

export default {
  name: 'Asset',
  components: { Pagination },
  data() {
    return {
      tableSearch: '',
      tableData: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        sort: '+age'
      },
      num: 1000,
      addDialogVisible: false,
      dialogWidth: '40%',
      nodeForm: {},
      nodeFormRules: {},
      nodeFormRef: '',
      value2: '',
      innerVisible: false,
      tableData1: [
        { 'id': 1, 'a': '组织管理', 'b': '政府主体', 'c': '组织机构', 'd': '林业有害生物或松材线虫病指挥部机构文件', 'e': 5,'f': 2},
        { 'id': 2, 'a': '组织管理', 'b': '政府主体', 'c': '安排部署', 'd': '会议、活动、（新发生的）启动应急预案。有依据（文件、影像等资料，下同', 'e': 10, },
        { 'id': 3, 'a': '防控方案', 'b': '防治方案', 'c': '规范性', 'd': '符合国家、省、市有关技术要求', 'e': 10 },
        { 'id': 4, 'a': '防控方案', 'b': '作业设计', 'c': '一致性', 'd': '与防治方案、技术标准比较。一致的，10分；不一致或缺失的，5分；措施强化的，在特别评价项中考虑加分。', 'e': 10 },
      ]
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      if (this.tableSearch) {
        this.searchData()
      } else {
        api.getData(this.listQuery).then(response => {
          this.tableData = response.data.result
          this.total = response.data.total
        })
      }
    },
    addData() {
      this.addDialogVisible = true
      // api.addData(this.num, this.listQuery).then(response => {
      //   this.getData()
      //   this.$message({
      //     type: 'success',
      //     message: '添加成功'
      //   })
      // })
    },
    dd() {
      this.innerVisible = true
    },
    addNodeClick() {

    },
    searchData() {
      api.searchData(this.tableSearch, this.listQuery).then(response => {
        this.tableData = response.data.result
        this.total = response.data.total
      })
    },
    emptyData() {
      api.deleteData(0).then(response => {
        this.tableData = response.data.result
        this.total = response.data.total
        this.$message({
          type: 'success',
          message: '清空数据成功'
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
