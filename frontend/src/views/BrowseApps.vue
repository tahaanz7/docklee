<script setup lang="ts">
import { onMounted } from "vue";
import AppCard from "../components/AppCard.vue";
import { fetchApps } from "../../services/appsService";
import { ref } from "vue";

const apps = ref([]);

onMounted(async () => {
  try {
    apps.value = await fetchApps();
  } catch (error) {
    console.error("Error fetching apps:", error);
  } finally {
    console.log("Fetch attempt finished");
  }
});
</script>

<template>
  <div class="container mx-auto my-4">
    <div class="text-3xl font-bold mb-4 text-center">
      Browse Applications
    </div>

    <div class="grid grid-cols-3 gap-2">
      <div v-for="app in apps" :key="app.name">
        <AppCard :app="app" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
