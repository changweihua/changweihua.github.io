---
commentabled: true
recommended: false
title: ASPNETCORE 程序与 Ant Design Vue 实现表格的 Column 的自动绑定
description: ASPNETCORE 程序与 Ant Design Vue 实现表格的 Column 的自动绑定
---

# ASPNETCORE 程序与 Ant Design Vue 实现表格的 Column 的自动绑定 #

## 背景 ##

经历了很多项目，每次都要编写大量的 Column 配置代码。如何能够简化操作呢？

通过反射生成 Column 配置，查询的时候与列表数据的一起返回给前端，自动绑定并展示。

## DOTNET ##

```csharp
public class AntdvPagerRequestHandler<TPagerListEntity>
    {
        public virtual int AntdVersion { get; set; } = 3;


        public virtual List<object> GetPagerColumns()
        {
            AntdVersion = AntdvVersion.Version;
            PropertyInfo[] properties = typeof(TPagerListEntity)!.GetProperties(BindingFlags.Instance | BindingFlags.Public);
            PropertyInfo[] properties2 = typeof(AntdvTableSlotColumnModel)!.GetProperties(BindingFlags.Instance | BindingFlags.Public);
            PropertyInfo[] properties3 = typeof(AntdvTableColumnAttribute)!.GetProperties(BindingFlags.Instance | BindingFlags.Public);
            List<PagerColumnModel> list = new List<PagerColumnModel>();
            if (typeof(PagerColumnModel)!.IsAssignableFrom(typeof(AntdvTableSlotColumnModel)))
            {
                PropertyInfo[] array = properties;
                foreach (PropertyInfo propertyInfo in array)
                {
                    if (propertyInfo.GetCustomAttributes<AntTableColumnIgnoreAttribute>().Any())
                    {
                        continue;
                    }

                    AntdvTableSlotColumnModel antdvTableSlotColumnModel = Activator.CreateInstance<AntdvTableSlotColumnModel>();
                    AntdvTableColumnAttribute customAttribute = propertyInfo.GetCustomAttribute<AntdvTableColumnAttribute>();
                    PropertyInfo[] array2 = properties2;
                    foreach (PropertyInfo columnProp in array2)
                    {
                        PropertyInfo propertyInfo2 = properties3.FirstOrDefault((PropertyInfo _) => _.Name == columnProp.Name);
                        if (propertyInfo2 != null)
                        {
                            object obj = columnProp.GetValue(antdvTableSlotColumnModel, null) ?? propertyInfo.Name.ToJsonLowerCamelCase();
                            if (customAttribute != null && (object)propertyInfo2 != null && propertyInfo2.GetValue(customAttribute, null) != null)
                            {
                                obj = propertyInfo2?.GetValue(customAttribute, null);
                            }

                            if (propertyInfo2 != null && obj != null)
                            {
                                if (columnProp.GetType().IsValueType || typeof(string)!.Equals(columnProp.PropertyType))
                                {
                                    columnProp.SetValue(antdvTableSlotColumnModel, obj, null);
                                }
                            }
                            else if (propertyInfo2 != null && obj == null && propertyInfo2.PropertyType.IsGenericType && propertyInfo2.PropertyType.GetGenericTypeDefinition().Equals(typeof(Nullable<>)))
                            {
                                NullableConverter nullableConverter = new NullableConverter(propertyInfo2.PropertyType);
                                columnProp.SetValue(antdvTableSlotColumnModel, nullableConverter.ConvertFrom(obj), null);
                            }
                        }

                        if (customAttribute == null)
                        {
                            continue;
                        }

                        if (customAttribute.ScopedSloted && AntdVersion <= 2)
                        {
                            properties2.FirstOrDefault((PropertyInfo _) => _.Name == "ScopedSlots")!.SetValue(antdvTableSlotColumnModel, new ScopedSlot
                            {
                                CustomRender = propertyInfo.Name.ToJsonLowerCamelCase()
                            }, null);
                            properties2.FirstOrDefault((PropertyInfo _) => _.Name == "Slots")!.SetValue(antdvTableSlotColumnModel, new ScopedSlot
                            {
                                CustomRender = propertyInfo.Name.ToJsonLowerCamelCase()
                            }, null);
                            antdvTableSlotColumnModel.IsSlotColumn = true;
                        }

                        antdvTableSlotColumnModel.Order = customAttribute.Order;
                    }

                    if (antdvTableSlotColumnModel.IsSlotColumn)
                    {
                        list.Add(antdvTableSlotColumnModel);
                        continue;
                    }

                    list.Add(new AntdvTableColumnModel
                    {
                        Align = antdvTableSlotColumnModel.Align,
                        DataIndex = antdvTableSlotColumnModel.DataIndex,
                        Ellipsis = antdvTableSlotColumnModel.Ellipsis,
                        IsRowKey = antdvTableSlotColumnModel.IsRowKey,
                        IsSlotColumn = antdvTableSlotColumnModel.IsSlotColumn,
                        Key = antdvTableSlotColumnModel.Key,
                        Order = antdvTableSlotColumnModel.Order,
                        Title = antdvTableSlotColumnModel.Title
                    });
                }

                list = list.OrderBy((PagerColumnModel _) => _.Order).ToList();
                if (typeof(IAntdvTableOperation)!.IsAssignableFrom(typeof(TPagerListEntity)))
                {
                    if (AntdVersion >= 3)
                    {
                        AntdvTableSlotColumnModel item = new AntdvTableSlotColumnModel
                        {
                            Title = "操作",
                            DataIndex = "hasOperation",
                            Key = "hasOperation"
                        };
                        list.Add(item);
                    }
                    else
                    {
                        AntdvTableSlotColumnModel item2 = new AntdvTableSlotColumnModel
                        {
                            Title = "操作",
                            DataIndex = "operation",
                            Key = "operation",
                            ScopedSlots = new ScopedSlot
                            {
                                CustomRender = "operation"
                            },
                            Slots = new ScopedSlot
                            {
                                CustomRender = "operation"
                            }
                        };
                        list.Add(item2);
                    }
                }
            }

            return list.OfType<object>().ToList();
        }
    }
```

## Vue ##

```vue
<template>
  <div>
    <a-card>
      <a-row>
        <a-col :span="24">
          <a-form ref="searchFormRef" :layout="searchFormLayout.layoutType" :model="query" :rules="searchFormRules"
            :label-col="searchFormLayout.labelCol" :wrapper-col="searchFormLayout.wrapperCol">
            <a-row :gutter="searchFormLayout.gutter">
              <a-col v-if="query" :span="8">
                <a-form-item name="userName">
                  <a-input v-model:value="query.userName" placeholder="用户名、工号" has-feedback />
                </a-form-item>
              </a-col>

              <a-col :span="16" class="btn-wrap btn-wrap-right">
                <a-form-item :wrapper-col="{ span: 24, offset: 0 }">
                  <a-button type="default" class="ant-btn-search" @click="doSearch">
                    {{ $t('buttons.query') }}
                    <template #icon>
                      <SearchOutlined />
                    </template>
                  </a-button>
                  <a-button class="ant-btn-create" type="default" @click="doCreate">
                    {{ $t('buttons.create') }}
                    <template #icon>
                      <PlusOutlined />
                    </template>
                  </a-button>
                  <a-upload :headers="headers" :showUploadList="false" :max-count="1" v-model:file-list="fileList"
                    name="file" action="/api/users/import" @change="handleChange">
                    <a-button class="ant-btn-create" type="default">
                      {{ $t('buttons.import') }}
                      <template #icon>
                        <file-excel-outlined />
                      </template>
                    </a-button>
                  </a-upload>

                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24">
          <a-table :columns="columns" :data-source="items" bordered :pagination="pager" :rowKey="rowKey"
            class="ant-table-striped" :rowClassName="(record: any, index: number) => (index % 2 === 1 ? 'table-striped' : null)
              " size="small" @change="handlePagerChange">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'isVerified'">
                <span>
                  <a-tag :color="record.isVerified ? 'blue' : 'red'">
                    {{ record.isVerified ? '已认证' : '未认证' }}
                  </a-tag>
                </span>
              </template>
              <template v-else-if="column.key === 'roleNames'">
                <span>
                  <a-tag :key="role" v-for="role in record.roleNames">
                    {{ role }}
                  </a-tag>
                </span>
              </template>
              <template v-else-if="column.key === 'isCompanyVerified'">
                <span>
                  <a-tag :color="record.isCompanyVerified ? 'blue' : 'red'">
                    {{ record.isCompanyVerified ? '已认证' : '未认证' }}
                  </a-tag>
                </span>
              </template>
              <template v-else-if="column.key === 'hasOperation'">
                <a-button type="link" size="small" :title="$t('buttons.edit')"
                  @click="doEdit({ text: '', record, index })">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-button type="link" size="small" :title="$t('buttons.delete')"
                  @click="doDelete({ text: '', record, index })">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </template>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </a-card>
    <a-modal v-model:visible="dialogVisible" :destroyOnClose="true" :maskClosable="false" cancelText="取消" okText="保存"
      title="用户信息" width="45%" :closable="false" :footer="null" centered @afterClose="onDialogAfterColse">
      <Item :model="user" @dialogCancel="onDialogCancel" @dialogSubmmit="onDialogSubmmit" />
    </a-modal>
  </div>
</template>

<script lang="ts">
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import modal from 'ant-design-vue/lib/modal'
import { defineComponent, reactive, ref, toRaw, toRefs, watch } from 'vue'

import {
  createUser,
  getUserPageList,
  updateUser
} from '@/apis/authority/user.api'
import useAntTable, { type AntTableModel } from '@/hooks/useAntTable'
import type {
  AntSearchFormLayoutModel,
  AntTableOperationModel
} from '@/models/ant.model'
import type { AntdvTableColumn } from '@/models/api.result'
import {
  emptyUser
} from '@/models/authority/user.model'
import type {
  UserListModel,
  UserModel,
  UserSearchFormModel
} from '@/models/authority/user.model'
import { useAuthStore } from '@/stores/auth.store';

import Item from './Item.vue'

import type { UploadChangeParam } from 'ant-design-vue';
import type { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'

export default defineComponent({
  components: {
    Item,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    PlusOutlined
  },
  setup(props, { emit }) {
    function loadData(
      data: AntTableModel<UserListModel, UserSearchFormModel, AntdvTableColumn>
    ) {
      emit('content_spinning', true)
      getUserPageList(data.pager.current, data.pager.pageSize, data.query)
        .then((json) => {
          data.pager.total = json.totalCount
          data.items = [...json.items]
          data.columns = [...json.columns]
        })
        .catch((err) => {
          console.log(err)
        })
    }

    const {
      rowKey,
      pager,
      searchFormLayout,
      handlePagerChange,
      handleSearch,
      items,
      columns,
      query
    } = useAntTable<UserListModel, UserSearchFormModel, AntdvTableColumn>(
      'userId',
      { userName: '' },
      loadData,
    )

    const data: {
      dialogVisible: boolean
      user: UserModel
      searchFormLayout: AntSearchFormLayoutModel
    } = reactive({
      searchFormLayout,
      dialogVisible: false,
      user: emptyUser
    })

    const { accessToken } = useAuthStore().currentToken
    const headers = ref({
      Platform: import.meta.env.VITE_APP_PLATFORM,
      Authorization: `${import.meta.env.VITE_APP_AUTHENTICATION_SCHEMA} ${accessToken}` || ''
    })

    const refData = toRefs(data)

    const searchFormRef = ref()
    const searchFormRules = {
      userName: [{ max: 5, message: '用户名最多5位', trigger: 'blur' }]
    }

    function doSearch() {
      searchFormRef.value
        .validate()
        .then(() => {
          handleSearch()
        })
        .catch((error: ValidateErrorEntity<UserSearchFormModel>) => {
          console.log('error', error)
        })
    }

    function doCreate() {
      console.log('doCreate')
      data.dialogVisible = true
    }

    function handleChange(info: UploadChangeParam) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    };

    const fileList = ref([]);

    const methods = reactive({
      doSearch,
      doCreate,
      handleChange,
      doDelete: (param: AntTableOperationModel<UserListModel>) => {
        modal.confirm({
          title: '操作提示',
          content: '确认删除该记录!',
          okText: '是',
          okType: 'danger',
          cancelText: '否',
          onOk: () => {
            console.log(toRaw(param.record))
            items.value.splice(param.index, 1)
            message.success('删除成功')
          }
        })
      },
      doEdit: (param: AntTableOperationModel<UserListModel>) => {
        data.user = {
          userId: param.record.userId,
          loginName: param.record.loginName,
          userName: param.record.userName,
          staffNumber: param.record.staffNumber,
          cellPhone: param.record.cellPhone,
          userRoles: param.record.userRoles
        }
        data.dialogVisible = true
      },
      onDialogCancel: () => {
        data.dialogVisible = false
        data.user = { ...emptyUser }
      },
      onDialogSubmmit: (model: UserModel) => {
        if (model.userId != '') {
          updateUser(model).then(() => {
            handleSearch()
            methods.onDialogCancel()
          })
        } else {
          createUser(model).then(() => {
            handleSearch()
            methods.onDialogCancel()
          })
        }
      },
      onDialogAfterColse: () => {
        console.log('onAfterColse')
        data.user = { ...emptyUser }
      }
    })

    // onMounted(() => {
    //   loadData()
    // })

    watch(pager, (oldVal, newVal) => {
      console.log(oldVal, newVal)
      // loadData()
    })

    return {
      rowKey,
      pager,
      items,
      columns,
      query, fileList,
      handlePagerChange,
      handleSearch,
      ...refData,
      headers,
      searchFormRef,
      searchFormRules,
      ...toRefs(methods)
    }
  }
})
</script>

<style lang="less" scoped>
.ant-table-striped :deep(.table-striped) {
  background-color: #fafafa;
}
</style>

```

## Hooks ##

```typescript
import { onMounted, reactive, toRefs, type UnwrapRef } from 'vue'
import i18n from '@/i18n'
import type {
    AntSearchFormLayoutModel,
    AntTablePaginationModel,
    AntTablePaginationQueryModel
} from '@/models/ant.model'

export interface AntTableModel<TItemModel, TQueryModel, TColumnModel, TRowKeyModel = string> {
  pager: AntTablePaginationModel
  searchFormLayout: AntSearchFormLayoutModel
  items: Array<TItemModel>
  columns: Array<TColumnModel>
  query: TQueryModel
  rowKey: TRowKeyModel
}

function useAntTable<TItemModel, TQueryModel, TColumnModel, TRowKeyModel = string>(
  rowKey: TRowKeyModel,
  defaultQuery: TQueryModel,
  loadData?: (
    data: UnwrapRef<AntTableModel<TItemModel, TQueryModel, TColumnModel, TRowKeyModel>>
  ) => void
) {
  const { t } = i18n.global

  const data: UnwrapRef<AntTableModel<TItemModel, TQueryModel, TColumnModel, TRowKeyModel>> =
    reactive({
      pager: {
        total: 0,
        current: 1,
        pageIndex: 1,
        pageSize: 10,
        responsive: true,
        showTotal: (total: number) => t('showTotal', { total }) //分页中显示总的数据
      },
      searchFormLayout: {
        layoutType: 'horizontal',
        labelCol: { span: 0 },
        wrapperCol: { span: 24 },
        inputCol: 4,
        buttonCol: 8,
        gutter: 20
      },
      items: [],
      columns: [],
      query: defaultQuery,
      rowKey
    })

  function handlePagerChange(pagination: AntTablePaginationModel) {
    console.log(pagination)
    data.pager.current = pagination.current
    data.pager.pageIndex = pagination.current
    data.pager.pageSize = pagination.pageSize

    if (data.query as AntTablePaginationQueryModel) {
      ;(data.query as AntTablePaginationQueryModel).pageIndex = pagination.current
      ;(data.query as AntTablePaginationQueryModel).pageSize = pagination.pageSize
    }

    if (loadData) {
      loadData(data)
    }
  }

  function handleSearch() {
    data.pager.current = 1

    if (data.query as AntTablePaginationQueryModel) {
      ;(data.query as AntTablePaginationQueryModel).pageIndex = 1
    }

    if (loadData) {
      loadData(data)
    }
  }

  onMounted(() => {
    if (loadData) {
      loadData(data)
    }
  })

  return {
    ...toRefs(data),
    handlePagerChange,
    handleSearch
  }
}

export default useAntTable

```
