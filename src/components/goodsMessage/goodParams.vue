<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
      ></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectKeys"
            :options="options"
            :props="propsDefault"
            @change="handleChange"
            clearable
            change-on-select
          >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtn"
            @click="addDialogVisble = true"
            >添加参数</el-button
          >
          <!--动态参数表格 -->
          <el-table :data="manytable" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="deleteTag(i,scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  icon="el-icon-edit"
                  size="mini"
                  type="primary"
                  @click="getParamById(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  icon="el-icon-delete"
                  size="mini"
                  type="danger"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only"
          ><el-button
            type="primary"
            size="mini"
            :disabled="isBtn"
            @click="addDialogVisble = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlytable" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                   @close="deleteTag(i,scope.row)"
                  >{{ item }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  icon="el-icon-edit"
                  size="mini"
                  type="primary"
                  @click="getParamById(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  icon="el-icon-delete"
                  size="mini"
                  type="danger"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table></el-tab-pane
        >
      </el-tabs>
    </el-card>
    <!-- 添加表单对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisble"
      width="30%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisble = false">取消</el-button>
        <el-button @click="addParams" type="primary">确定</el-button>
      </span>
    </el-dialog>
    <!-- 修改的表单 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisble"
      width="30%"
    >
      <el-form label-width="80px" ref="editFormRef">
        <el-form-item :label="titleText">
          <el-input v-model="saveForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisble = false">取消</el-button>
        <el-button @click="updateParams" type="primary">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: [],
      options: [],
      propsDefault: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectKeys: [],
      activeName: 'only',
      //静态属性列表
      onlytable: [],
      manytable: [],
      addDialogVisble: false,
      addForm: {
        attr_name: ''
      },

      addFormRules: {
        attr_name: [{ required: true, message: ' 请输入', trigger: 'blur' }]
      },
      editDialogVisble: false,
      saveForm: {}
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    //如果没有选中三级,则金庸按钮
    isBtn() {
      if (this.selectKeys.length !== 3) {
        return true
      }
      return false
    },
    //获取三级中的id
    getCateId() {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.options = res.data
    },
    handleChange() {
      this.getCateParamsList()
    },
    handleClick() {
      this.getCateParamsList()
    },
    //获取table列表
    async getCateParamsList() {
      //只有三级标签才可以选中
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        return
      }
      //获取列表数据
      const { data: res } = await this.$http.get(
        `categories/${this.getCateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )

      if (res.meta.status !== 200) {
        this.$message.error('获取列表数据失败')
      }
      //attr_vals用空格切割，
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //给每一个item添加inputVisible和inputValue去除联动效果
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manytable = res.data
      } else {
        this.onlytable = res.data
      }
    },
    //添加表单关闭之后清空
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //添加表单数据
    addParams() {
      //预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //校验成功之后
        const { data: res } = await this.$http.post(
          `categories/${this.getCateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
      })
      this.getCateParamsList()
      this.addDialogVisble = false
    },
    //删除
    async deleteParams(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除,是否继续',
        '提示',
        {
          confirmButtonText: '确定',
          concelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(
        `categories/${this.getCateId}/attributes/${id}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getCateParamsList()
    },
    //根据id查询
    async getParamById(id) {
      this.editDialogVisble = true
      const { data: res } = await this.$http.get(
        `categories/${this.getCateId}/attributes/${id}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('根据id查询失败')
      }
      this.saveForm = res.data
    },
    //编辑
    async updateParams() {
      //预校验
      const { data: res } = await this.$http.put(
        `categories/${this.getCateId}/attributes/${this.saveForm.attr_id}`,
        {
          attr_name: this.saveForm.attr_name,
          attr_sel: this.activeName
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        this.$message.error('更新失败')
      }
      this.getCateParamsList()
      this.editDialogVisble = false
    },
    async handleInputConfirm(row) {
      console.log('11')
      //如果文本框输入的空格，失去焦点之后要清空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        //失去焦点获取点击enter之后变成+new tag标志
        row.inputVisible = false
        console.log(row.inputVisible)
        return
      }
      //添加参数
      //先前端添加，之后再将添加好的，存入后端数据库
      console.log(row)
      row.attr_vals.push(row.inputValue.trim())
      this.saveAttr_vals(row)
    },
    //
     //将attr_vals保存到数据库
    async saveAttr_vals(row) {
     
      await this.$http.put(
        `categories/${this.getCateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      row.inputValue = ' '
      row.inputVisible = false
    },
    showInput(row) {
      row.inputVisible = true
      //文本框自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    deleteTag(id,row){
      console.log(id)
     row.attr_vals.splice(id,1)
     this.saveAttr_vals(row)
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.input-new-tag {
  width: 120px;
}
.el-tag {
  margin: 15px;
}
</style>
