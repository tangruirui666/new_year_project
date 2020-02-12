<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addCategory">添加分类</el-button>
      <!-- 表格，引用的是第三方的tree-table -->
      <!-- :selection-type="false"去除默认的复选框
      :expand-type="false"去除首列默认扩展 -->
      <tree-table
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="true"
        class="tree_table"
      >
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            size="mini"
            type="success"
            >二级</el-tag
          >
          <el-tag
            v-else-if="scope.row.cat_level === 2"
            size="mini"
            type="warning"
            >三级</el-tag
          >
        </template>
        <template slot="opt" slot-scope="scope">
          <!-- 编辑 -->
          <el-button
            size="mini"
            icon="el-icon-edit"
            type="primary"
            @click="editCate(scope.row.cat_id)"
          ></el-button>
          <!-- 删除 -->
          <el-button
            icon="el-icon-delete"
            size="mini"
            type="warning"
            @click="deleteCate(scope.row.cat_id)"
          ></el-button>
        </template>
      </tree-table>
      <!-- 分页部分 -->
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
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加表单"
      :visible.sync="addDialogVisable"
      width="30%"
      @close="addCategoryDialogVisable"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addRuleForm"
        label-width="80px"
      >
        <!-- prop为验证时的值 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <!-- option指定数据源 props-->
          <el-cascader
            v-model="selectKeys"
            :options="parentCateList"
            @change="parentCateChange"
            :props="cascaderProps"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类名称的弹窗 -->
    <el-dialog :visible.sync="editCateDialog" title="修改表单" width="30%">
      <el-form label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="saveForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisble = false">取消</el-button>
        <el-button @click="updataCate">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      categoryList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          //
          type: 'template',
          //表示这一列使用的模板名称
          template: 'isOk',
          prop: 'cat_deleted'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
          prop: 'cat_lavel'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addDialogVisable: false,
      //添加分类的表单数据对象
      addForm: {
        //将要添加的分类的名称
        cat_name: '',
        //父级分类的id
        cat_pid: 0,
        //分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //父级分类的列表
      parentCateList: [],
      //指定级联选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        //指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        //指定选项标签为选项对象的某个属性值
        label: 'cat_name',
        //指定选项的子选项为选项对象的某个属性值
        children: 'children'
      },
      //选中的父级分类的id数组
      selectKeys: [],
      editCateDialog: false,
      saveForm: {}
    }
  },
  methods: {
    //获取商品分类数据
    async getcategory() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryinfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品失败')
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    //分页
    handleSizeChange(size) {
      this.queryinfo.pagesize = size
      this.getcategory()
    },
    handleCurrentChange(pagenum) {
      this.queryinfo.pagenum = pagenum
      this.getcategory()
    },
    //点击按钮，展示添加分类的对话框
    addCategory() {
      //先获取父级分类数据列表，再展示对话框
      this.getParentCateList()
      this.addDialogVisable = true
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
      console.log(res.data)
    },
    //选择项发生变化触发这个函数
    parentCateChange() {
      console.log(this.selectKeys)
      //selectKeys
      if (this.selectKeys.length > 0) {
        this.addForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addForm.cat_level = this.selectKeys.length
        return
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    //添加新的分类
    addCate() {
      //预校验
      this.$refs.addRuleForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getcategory()
        this.addDialogVisable = false
      })

      console.log(this.addForm)
    },
    //添加分类的表单关闭之后清空表单
    addCategoryDialogVisable() {
      this.$refs.addRuleForm.resetFields()
      this.selectKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    // 根据 id查询
    async editCate(id) {
      console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询失败')
      }
      //查询到的数据放入saveForm中
      this.saveForm = res.data
      this.editCateDialog = true
    },
    //编辑
    async updataCate() {
      //如果编辑之后表单为空，出现提示
      if(!this.saveForm.cat_name) return this.$message.warning('请输入编辑之后的分类')
      
      const { data: res } = await this.$http.put(
        'categories/' + this.saveForm.cat_id,
        {
          cat_name: this.saveForm.cat_name
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('编辑失败')
      }
      this.$message.success('编辑成功')
      this.getcategory()
      this.editCateDialog = false
    },
    //删除
    async deleteCate(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件,是否继续',
        '提示',
        {
          confirmButtonText: '确定',
          cancleButtonText: '取消',
          type: 'warining'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getcategory()
    }
  },
  created() {
    this.getcategory()
  }
}
</script>

<style lang="less" scoped>
.tree_table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
