<template>
  <view class="categories-page">
    <!-- 类型切换 -->
    <view class="type-toggle">
      <view
        class="type-btn"
        :class="{ active: currentType === 'expense' }"
        @click="switchType('expense')"
      >
        <text>支出分类</text>
      </view>
      <view
        class="type-btn"
        :class="{ active: currentType === 'income' }"
        @click="switchType('income')"
      >
        <text>收入分类</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- 分类列表 -->
    <view v-else class="category-list">
      <view
        v-for="cat in categories"
        :key="cat.id"
        class="category-item card"
        @click="toggleExpand(cat)"
      >
        <view class="cat-main">
          <text class="cat-icon">{{ getIconEmoji(cat.icon) }}</text>
          <view class="cat-info">
            <text class="cat-name">{{ cat.name }}</text>
            <text class="cat-system" v-if="cat.is_system">系统分类</text>
          </view>
          <text class="expand-icon">{{ expanded === cat.id ? '▲' : '▼' }}</text>
        </view>

        <!-- 展开编辑（仅自定义分类） -->
        <view v-if="expanded === cat.id && !cat.is_system" class="cat-edit">
          <view class="icon-grid">
            <text
              v-for="ic in currentIconSet"
              :key="ic.name"
              class="icon-option"
              :class="{ selected: iconSelected === ic.name }"
              @click.stop="iconSelected = ic.name"
            >{{ ic.emoji }}</text>
          </view>
          <view class="edit-row">
            <input class="input edit-input" v-model="nameInput" placeholder="分类名称" />
            <button class="btn-save" @click.stop="saveCat(cat)">保存</button>
          </view>
          <text class="btn-delete-text" @click.stop="deleteCat(cat)">删除分类</text>
        </view>
      </view>

      <!-- 添加新分类 -->
      <view class="add-section card" v-if="!addingNew" @click="startAdd">
        <text class="add-btn">+ 添加新分类</text>
      </view>

      <view class="card add-form" v-else>
        <text class="form-title">新建分类</text>
        <view class="icon-grid">
          <text
            v-for="ic in currentIconSet"
            :key="ic.name"
            class="icon-option"
            :class="{ selected: iconSelected === ic.name }"
            @click="iconSelected = ic.name"
          >{{ ic.emoji }}</text>
        </view>
        <view class="edit-row">
          <input class="input edit-input" v-model="nameInput" placeholder="输入分类名称" />
          <button class="btn-save" @click="createCat">创建</button>
        </view>
        <view class="edit-actions">
          <text class="btn-cancel" @click="cancelAdd">取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { category } from '@/utils/api.js'

const EXPENSE_ICONS = [
  { name: 'restaurant', emoji: '🍜' }, { name: 'directions_car', emoji: '🚗' },
  { name: 'shopping_cart', emoji: '🛒' }, { name: 'home', emoji: '🏠' },
  { name: 'movie', emoji: '🎬' }, { name: 'medical_services', emoji: '🏥' },
  { name: 'school', emoji: '📚' }, { name: 'more_horiz', emoji: '📌' },
  { name: 'local_gas_station', emoji: '⛽' }, { name: 'checkroom', emoji: '👔' },
  { name: 'flight', emoji: '✈️' }, { name: 'fitness_center', emoji: '🏋️' },
  { name: 'pets', emoji: '🐶' }, { name: 'child_care', emoji: '👶' },
  { name: 'store', emoji: '🏪' }, { name: 'local_cafe', emoji: '☕' },
  { name: 'celebration', emoji: '🎉' }, { name: 'account_balance_wallet', emoji: '👛' }
]

const INCOME_ICONS = [
  { name: 'payments', emoji: '💰' }, { name: 'account_balance', emoji: '🏦' },
  { name: 'savings', emoji: '🐷' }, { name: 'trending_up', emoji: '📈' },
  { name: 'work', emoji: '💼' }, { name: 'attach_money', emoji: '💴' },
  { name: 'school', emoji: '🎓' }, { name: 'volunteer_activism', emoji: '🤝' },
  { name: 'more_horiz', emoji: '📌' }
]

export default {
  data() {
    return {
      currentType: 'expense',
      categories: [],
      loading: true,
      expanded: null,
      addingNew: false,
      nameInput: '',
      iconSelected: ''
    }
  },
  computed: {
    currentIconSet() {
      return this.currentType === 'expense' ? EXPENSE_ICONS : INCOME_ICONS
    }
  },
  onLoad(opts) {
    if (opts.type) this.currentType = opts.type
    this.loadCategories()
  },
  methods: {
    async loadCategories() {
      this.loading = true
      try {
        const res = await category.list(this.currentType)
        if (res.success) this.categories = res.data
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    switchType(type) {
      this.currentType = type
      this.expanded = null
      this.addingNew = false
      this.loadCategories()
    },
    toggleExpand(cat) {
      if (cat.is_system) return
      if (this.expanded === cat.id) {
        this.expanded = null
      } else {
        this.expanded = cat.id
        this.nameInput = cat.name
        this.iconSelected = cat.icon
        this.addingNew = false
      }
    },
    startAdd() {
      this.addingNew = true
      this.expanded = null
      this.nameInput = ''
      this.iconSelected = this.currentIconSet[0] ? this.currentIconSet[0].name : ''
    },
    cancelAdd() {
      this.addingNew = false
      this.nameInput = ''
    },
    async createCat() {
      if (!this.nameInput.trim()) {
        uni.showToast({ title: '请输入分类名称', icon: 'none' })
        return
      }
      try {
        const res = await category.create({
          type: this.currentType,
          name: this.nameInput.trim(),
          icon: this.iconSelected
        })
        if (res.success) {
          uni.showToast({ title: '创建成功' })
          this.cancelAdd()
          this.loadCategories()
        }
      } catch (e) {
        uni.showToast({ title: e.message || '创建失败', icon: 'none' })
      }
    },
    async saveCat(cat) {
      if (!this.nameInput.trim()) {
        uni.showToast({ title: '请输入分类名称', icon: 'none' })
        return
      }
      try {
        const res = await category.update(cat.id, {
          name: this.nameInput.trim(),
          icon: this.iconSelected
        })
        if (res.success) {
          uni.showToast({ title: '保存成功' })
          this.expanded = null
          this.loadCategories()
        }
      } catch (e) {
        uni.showToast({ title: e.message || '保存失败', icon: 'none' })
      }
    },
    async deleteCat(cat) {
      try {
        const res = await category.delete(cat.id)
        if (res.success) {
          uni.showToast({ title: '已删除' })
          this.expanded = null
          this.loadCategories()
        }
      } catch (e) {
        uni.showToast({ title: e.message || '删除失败', icon: 'none' })
      }
    },
    getIconEmoji(icon) {
      const all = [...EXPENSE_ICONS, ...INCOME_ICONS]
      const found = all.find(i => i.name === icon)
      return found ? found.emoji : '📌'
    }
  }
}
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background: #f5fdf8;
  padding: 12px;
}

.type-toggle {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 12px;
  border: 1px solid #e0ebe4;
}

.type-btn {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
}

.type-btn.active {
  background: #006c49;
  color: #ffffff;
}

.loading-state {
  padding: 60px;
  text-align: center;
  color: #9ca3af;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  padding: 14px;
}

.cat-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cat-icon { font-size: 28px; }

.cat-info { flex: 1; }

.cat-name {
  font-size: 14px;
  font-weight: 600;
  color: #191c1a;
  display: block;
}

.cat-system {
  font-size: 11px;
  color: #9ca3af;
}

.expand-icon { font-size: 20px; color: #9ca3af; }

.cat-edit {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f0f7f3;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.icon-option {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5fdf8;
  border: 1px solid #e0ebe4;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

.icon-option.selected {
  background: #d0f5e8;
  border-color: #006c49;
}

.edit-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.edit-input {
  flex: 1;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #d1ddd6;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}

.btn-save {
  height: 38px;
  padding: 0 16px;
  background: #006c49;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete-text {
  display: block;
  text-align: center;
  font-size: 13px;
  color: #ef4444;
  margin-top: 10px;
}

.add-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  cursor: pointer;
}

.add-btn {
  font-size: 14px;
  font-weight: 600;
  color: #006c49;
}

.add-form { padding: 16px; }

.form-title {
  font-size: 14px;
  font-weight: 700;
  color: #191c1a;
  display: block;
  margin-bottom: 12px;
}

.edit-actions {
  margin-top: 8px;
  text-align: center;
}

.btn-cancel {
  font-size: 13px;
  color: #9ca3af;
}
</style>
