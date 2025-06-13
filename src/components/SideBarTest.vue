<template>
  <div class="app-container">
    <aside class="sidebar">
      <ul class="menu">
        <li
            v-for="item in menuItems"
            :key="item.name"
            class="menu-item"
            @click="handleClick(item)"
        >
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </aside>
    <main class="content">

    </main>
  </div>
</template>

<script>
import router from "../router";

export default {
  name: "SidebarMenu",
  data() {
    return {
      menuItems: [
        { name: "addSale", label: "Add Sale", route: "https://www.youtube.com/" },
        { name: "addBuy", label: "Add Buy", route: "/add-buy" },
        { name: "manageInventory", label: "Manage Inventory", route: "/manage-inventory" },
        { name: "viewReports", label: "View Reports", route: "/reports" }
        // Add more operations here as needed
      ]
    };
  },
  methods: {
    handleClick(item) {
      router.push('/test');
    }
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  padding-top: 20px;
  color: #ecf0f1;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  padding: 15px 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.menu-item:hover {
  background-color: #34495e;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>