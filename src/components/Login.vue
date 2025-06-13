<template>
  <div class="login-container">
    <h2>Login</h2>
    <input v-model="username" placeholder="Username">
    <input v-model="password" type="password" placeholder="Password">
    <button @click="login">Login</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script>
import {Pool} from "pg";

const pool = new Pool({
  user:'postgres',
  password:'root',
  database:'base_prueba',
  host:'localhost',
  port:5432,
});
export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    login() {
      if (!this.username || !this.password) {
        this.errorMessage = 'Username and password are required.';
        return;
      }

      // Simulated authentication logic
      if (this.username === 'admin' && this.password === 'password') {
        alert('Login successful');
      } else {
        this.errorMessage = 'Invalid credentials';
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 300px;
  margin: auto;
  text-align: center;
}
input {
  display: block;
  width: 100%;
  margin: 10px 0;
}
button {
  width: 100%;
  padding: 10px;
}
</style>