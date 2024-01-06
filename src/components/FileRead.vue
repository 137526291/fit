<template>
    <div>
      <input type="file" @change="handleFile">
    </div>
  </template>
  
  <script>
  export default {
    data() {
        return {
            localBinArr: null,
        };
    },
    methods: {
      handleFile(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
  
        reader.onload = (e) => {
        //   const arrayBuffer = e.target.result;
            this.localBinArr = new Uint8Array(e.target.result);
            console.log(this.localBinArr);
          // 在这里将触发自定义事件 以通知父组件
          this.$emit('file-loaded', this.localBinArr);
        };
  
        reader.onerror = (e) => {
          console.error('FileReader failed to read file', e);
        };
  
        reader.readAsArrayBuffer(file);
      }
    },
    // props: {
    //     binArr: { type: Uint8Array, required: true },
    // }
  }
  </script>
  