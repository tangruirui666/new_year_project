<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加搜索表单 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryinfo.query"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table border stripe :data="tableList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
        ></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="add_time">
            <template slot-scope="scope">
                {{scope.row.add_time | dataFormat}}
            </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              size="mini"
              type="primary"
            ></el-button>
            <el-button
              icon="el-icon-delete"
              size="mini"
              type="danger"
              @click="deleteGood(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableList: [],
      queryinfo: {
        query: '',
        pagenum: 1, //当前页码
        pagesize: 3 //每页显示条数
      },
      total: 0
    }
  },
  created() {
    this.getGoodList()
  },
  methods: {
    //获取列表数据
    async getGoodList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryinfo
      })
      console.log(res.data)
      this.tableList = res.data.goods
      this.total = res.data.total
    },
    handleCurrentChange(current) {
      //   console.log(current)
      this.queryinfo.pagenum = current
      this.getGoodList()
    },
    handleSizeChange(size) {
      this.queryinfo.pagesize = size
      this.getGoodList()
    },
    async deleteGood(id) {
      const comfirmResult = await this.$confirm(
        '该操作将会永久删除,是否继续',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).catch(err => err)
      console.log(comfirmResult)
      if (comfirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status === 200) {
        this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodList()
    },
    //根据id查询
  }
}
</script>

<style></style>
