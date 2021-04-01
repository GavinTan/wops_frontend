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
        <el-input v-model="num" style="width: 10%" oninput="value=value.replace(/[^\d]/g,'')"></el-input>
        <el-button type="primary" icon="el-icon-edit" @click="addData">添加</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="emptyData">清空数据</el-button>
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
      tableData: [],
      tableSearch: '',
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        sort: '+age'
      },
      num: 1000
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
      api.addData(this.num, this.listQuery).then(response => {
        this.getData()
        this.$message({
          type: 'success',
          message: '添加成功'
        })
      })
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
