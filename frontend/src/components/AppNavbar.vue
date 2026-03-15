<template>
  <v-app-bar color="primary" dark>
    <v-app-bar-title>
      <router-link to="/" class="text-white text-decoration-none d-flex align-center">
        🐂 Meu Rebanho
      </router-link>
    </v-app-bar-title>

    <template v-slot:append>
      <v-btn to="/" variant="text" class="text-white">
        <v-icon start>mdi-view-dashboard</v-icon>
        Dashboard
      </v-btn>
      <v-btn to="/animais" variant="text" class="text-white">
        <v-icon start>mdi-cow</v-icon>
        Animais
      </v-btn>
    </template>
  </v-app-bar>
</template>
