<script setup lang="ts">
</script>

<template>
<p>{{$route.params.id}}</p>
</template>

<script lang="ts">
export default {
  data(){
    return {
      hello:[
        {hi:'hi',id:1},
        {hi:'hello',id:2},
        {hi:'heya',id:3},
      ]
    }
  },
  name: "AddTest"
};




</script>
