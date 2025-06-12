<template>
  <v-app>
    <v-navigation-drawer app permanent color="indigo darken-3">
      <v-list dense>
        <v-list-item
            v-for="item in menuItems"
            :key="item.name"
            link
            @click="$router.push(item.route)"
        >
          <v-list-item-content>
            <v-list-item-title class="white--text">{{ item.label }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'SidebarVuetify',
  data() {
    return {
      menuItems: [
        { name: 'addSale', label: 'Add Sale', route: '/add-sale' },
        { name: 'addBuy', label: 'Add Buy', route: '/add-buy' },
        { name: 'manageInventory', label: 'Manage Inventory', route: '/manage-inventory' },
        { name: 'viewReports', label: 'View Reports', route: '/reports' }
      ]
    }
  }
}
</script>