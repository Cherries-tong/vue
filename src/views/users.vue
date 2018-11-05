<template>
  <el-card class="box-card">

  	<!-- 面包屑 -->
  	<el-breadcrumb separator="/">
	  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
	  <el-breadcrumb-item>用户管理</el-breadcrumb-item>
	  <el-breadcrumb-item>用户列表</el-breadcrumb-item>
	</el-breadcrumb>

	<!-- 搜索框 -->
	<el-row class="searchArea">
        <el-col :span="20">
            <el-input placeholder="请输入内容" class="input-with-select">
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
        </el-col>

        <el-col :span="4">
            <el-button type="success" plain @click="dialogFormVisibleAddUser = true">添加用户</el-button>
        </el-col>
    </el-row>

    <!-- 添加表单 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisibleAddUser">
      <el-form :model="formData">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input v-model="formData.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-input v-model="formData.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="formData.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" :label-width="formLabelWidth">
          <el-input v-model="formData.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAddUser = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>



    <!-- 表格 -->
    <el-table :data="list" v-loading="loading" style="width: 100%">
	    <el-table-column type="index" label="#" width="80"></el-table-column>
	    <el-table-column prop="username" label="姓名" width="120"></el-table-column>
	    <el-table-column prop="email" label="邮箱"></el-table-column>
	    <el-table-column prop="mobile" label="电话"></el-table-column>
	    <el-table-column prop="create_time" label="创建日期">
	    	<template slot-scope="scope">{{scope.row.create_time | fmtDate}}</template>
	    </el-table-column>
	    <el-table-column label="用户状态">
	    	<template slot-scope="scope">
                <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="changeMgState(scope.row)"></el-switch>
            </template>
	    </el-table-column>
	    <el-table-column label="操作">
	    	<template slot-scope="scope">
	    		<el-button type="primary" icon="el-icon-edit" circle plain size="mini" @click="handleEdit(scope.row)"></el-button>
	    		<el-button type="danger" icon="el-icon-delete" circle plain size="mini" @click="handleDelete(scope.row.id)"></el-button>
	    		<el-button type="success" icon="el-icon-check" circle plain size="mini" @click="handleRole(scope.row)"></el-button>
	    	</template>
	    </el-table-column>
	</el-table>


	<!-- 编辑表单 -->
	<el-dialog title="修改用户" :visible.sync="dialogFormVisibleEditUser">
      <el-form :model="formData">
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input disabled v-model="formData.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth">
          <el-input v-model="formData.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" :label-width="formLabelWidth">
          <el-input v-model="formData.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEditUser = false">取 消</el-button>
        <el-button type="primary" @click="EditUser()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色 -->
    <el-dialog title="分配角色" :visible.sync="dialogFormVisibleRoleUser">
	  <el-form>
	    <el-form-item label="用户名" :label-width="formLabelWidth">{{currUserName}}</el-form-item>
	    <el-form-item label="角色" :label-width="formLabelWidth">
	      <el-select v-model="currRoleId" placeholder="请选择">
	        <el-option disabled label="请选择" :value="-1"></el-option>
	        <el-option v-for="(item,index) in roles" :key="index" :label="item.roleName" :value="item.id "></el-option>
	      </el-select>
	    </el-form-item>
	  </el-form>
	  <div slot="footer" class="dialog-footer">
	    <el-button @click="dialogFormVisibleRoleUser = false">取 消</el-button>
	    <el-button type="primary" @click="setRole()">确 定</el-button>
	  </div>
	</el-dialog>


	<!-- 分页 -->
	<el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>




  </el-card>
</template>

<script>
export default {
	data(){
		return {
			list:[],
			loading:false,
			currentPage:1,
			pagesize:2,
			pagenum:1,
			total:10,
			dialogFormVisibleAddUser:false,
			dialogFormVisibleEditUser:false,
			dialogFormVisibleRoleUser:false,
			formData:{
				username:'',
				password:'',
				email:'',
				mobile:''
			},
			formLabelWidth:'140px',
			currUserId:-1,
			currUserName:'',
			currRoleId:-1,
			roles:[],
			getRoleById:-1
		}
	},
	 mounted () {
		this.loadTableData()
		this.loading = true
	},
	methods:{
		async loadTableData() {
			const AUTH_TOKEN = sessionStorage.getItem('token')
			this.$http.defaults.headers.common['Authorization'] = AUTH_TOKEN
			const res = await this.$http.get(`users?pagenum=${this.pagenum}&pagesize=${this.pagesize}`)
			const {meta,data} = res.data
			if(meta.status === 200){
				this.total = res.data.data.total
				this.loading = false
				this.list = data.users
			}
		},

		handleSizeChange(val) {
			this.pagesize = val
			this.loadTableData()
        },
        handleCurrentChange(val) {
        	this.pagenum = val
        	this.loadTableData()
        },
        async changeMgState(user){
        	const res = await this.$http.put(`users/${user.id}/state/${user.mg_state}`)
        	const {meta:{msg,status}} = res.data
        	if(status === 200){
        		this.$message.success(msg)
        	}
        },
        handleDelete(ID){
        	this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
	          confirmButtonText: '确定',
	          cancelButtonText: '取消',
	          type: 'warning'
	        }).then(async() => {
	        	const res = await this.$http.delete(`users/${ID}`)
	        	const {meta:{msg,status}} = res.data
	        	if(status ===200){
	        		this.pagenum = 1
	        		this.loadTableData()
	        		this.$message({
			            type: 'success',
			            message: msg
		        	})
	        	}
		        
	        }).catch(() => {
	          this.$message({
	            type: 'info',
	            message: '已取消删除'
	          })        
	        })
        },
        async addUser(){
        	this.dialogFormVisibleAddUser = false
        	const res = await this.$http.post('users',this.formData)
        	const {meta:{msg,status}} = res.data
        	if(status === 201){
        		for(const key in this.formData){
        			if(this.formData.hasOwnProperty(key)){
        				this.formData[key] = ''
        			}
        		}
        		this.$message.success(msg)
        		this.loadTableData()
        	}
        },
        handleEdit(user) {
        	this.dialogFormVisibleEditUser = true
        	this.formData= user
        	this.currUserId = user.id
        },
        async EditUser() {
        	const res = await this.$http.put(`users/${this.currUserId}`,this.formData)
        	const {meta:{msg,status}} = res.data
        	if(status === 200){
        		this.dialogFormVisibleEditUser = false
        		this.$message.success(msg)
        	}
        },
        async handleRole(user){

        	this.getRoleById = user.id
        	this.dialogFormVisibleRoleUser = true
        	this.currUserName = user.username
        	const res = await this.$http.get(`roles`)
        	this.roles = res.data.data

        	const res1 = await this.$http.get(`users/${user.id}`)
        	this.currRoleId = res1.data.data.rid
        },
        async setRole() {
        	this.dialogFormVisibleRoleUser = false
        	const res = await this.$http.put(`users/${this.getRoleById}/role`,{
        		rid:this.currRoleId
        	})
        	const {meta:{msg,status}} = res.data
        	if(status === 200){
        		this.$message.success(msg)
        	}
        }
        
        

	}
}
</script>

<style>
.box-card {
  height: 100%;
}
.searchArea {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 350px;
}

</style>