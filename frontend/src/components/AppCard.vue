<template>
  <div class="flex w-full items-start gap-4 bg-base-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
    
    <!-- Logo container -->
    <div class="flex items-center justify-center bg-white w-28 h-28 rounded-lg border border-base-300">
      <img :src="app.logo" alt="" class="max-w-[70%] max-h-[70%] object-contain" />
    </div>

    <!-- Content -->
    <div class="flex flex-col flex-1">
      <!-- Header row with name + ports + button -->
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <div class="text-lg font-semibold">{{ app.name }}</div>
            <div class="px-2 py-0.5 text-xs rounded-md bg-base-300 text-base-content/70">
              {{ app.default_ports }}
            </div>
          </div>
          <div class="text-xs text-base-content/50">
            {{ app.category }}
          </div>
        </div>

        <!-- Install button (top-right) -->
        <button class="btn btn-accent rounded-xl px-5">
          Install
        </button>
      </div>

      <!-- Description -->
      <div class="text-sm text-base-content/80 mt-3 line-clamp-3">
        {{ app.description }}
      </div>
    </div>
  </div>
</template>



<script setup>
defineProps({ app: Object });
</script>
