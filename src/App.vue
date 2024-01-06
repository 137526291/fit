<template>
  <div>
    <button class="btn btn__lg btn-group" @click="testBLE">BLE</button>
    <button class="btn btn__danger btn-group" @click="disconnect">disconnect</button>
    <button class="btn" @click="send">send</button>
    <button class="btn" @click="append">append</button>
    <button class="btn" @click="clear">clear</button>
    <button class="btn" @click="v1ota">v1ota</button>
    <textarea v-model="logText" id="log" rows="10" cols="40"></textarea><br>
    <table>
      <tr v-for="(value, name) in variables" :key="name">
        <td>{{ name }}</td>
        <td>{{ value }}</td>
      </tr>
    </table>
    <!-- Chart container -->
    
    <input type="range" id="up_progress" :value="upgradeProgress"><br>
    <file-read @file-loaded="handleFileLoaded"></file-read>
    <h1>TODO List</h1>
    <todo-form @add-todo="addTodo"></todo-form>
    <ul aria-labelledby="list-summary" class="stack_large">
      <li v-for="item in TodoItems" :key="item.id">
        <!-- <todo-item label="my fucking todo" :done='true'></todo-item> -->
        <todo-item :label="item.label" :done="item.done" :id="item.id"></todo-item>
      </li>
    </ul>
    <img alt="Vue logo" src="./assets/image.webp" width="500" height="500">
    <div ref="chart" style="width: 500px;height:500px;"></div>

  </div>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <!-- <HelloWorld msg="Welcome to Your Vue.js App" /> -->
</template>

<script>
import FileRead from './components/FileRead.vue';
// import HelloWorld from './components/HelloWorld.vue';
import TodoItem from './components/TodoItem.vue';
import TodoForm from "./components/TodoForm";
import uniqueId from "lodash.uniqueid";
import { Bmv1 } from './bmv1.js'; //如果是导出函数需要加大括号
import * as echarts from 'echarts';
//如需导出class 则使用constructor
// let v1 = new Bmv1(this.methods.ble_read, this.methods.ble_write );
// let v1 = this.v1;
let gattServer;
// let commandService;
// let readCharacteristic;
let writeCharacteristic;
let commandQueue = [];
let busy = false;
const FIFO_CNT = 50;

// typedef enum
// {
//     PWR_WAIT_RMS,       // 等待ac有效值变大
//     PWR_WAIT_DC_STABLE, // 初始上电 等待稳定
//     PWR_WAIT_PFC,       // 等待PFC工作稳定
//     PWR_STABLE,         // 电源稳定，可正常工作
//     PWR_STABLE_SLEEP,   // 电源稳定，关闭PWM锁闭电机进行休眠
//     PWR_DISCHARGING,    // 开始泄放掉电，主动放电
//     PWR_FATAL,
// } pwr_fsm_e;
const fsm2str = {
  0: 'PWR_WAIT_RMS',
  1: 'PWR_WAIT_DC_STABLE',
  2: 'PWR_WAIT_PFC',
  3: 'PWR_STABLE',
  4: 'PWR_STABLE_SLEEP',
  5: 'PWR_DISCHARGING',
  6: 'PWR_FATAL',
};
// const fsmToString = {
//   PWR_WAIT_RMS: '等待ac有效值变大',
//   PWR_WAIT_DC_STABLE: '初始上电 等待稳定',
//   PWR_WAIT_PFC: '等待PFC工作稳定',
//   PWR_STABLE: '电源稳定,可正常工作',
//   PWR_STABLE_SLEEP: '电源稳定,关闭PWM锁闭电机进行休眠',
//   PWR_DISCHARGING: '开始泄放掉电,主动放电',
//   PWR_FATAL: 'PWR_FATAL',
// };


export default {
  name: 'App',
  components: {
    TodoItem,
    TodoForm,
    FileRead,
  },
  data() {
    return {
      TodoItems: [
        { id: uniqueId("todo-"), label: "fuck me", done: false },
        { id: uniqueId("todo-"), label: "fuck you", done: false },
        { id: uniqueId("todo-"), label: "have fun", done: true },
        { id: uniqueId("todo-"), label: "learn vue", done: false },
      ],
      binFile: new Uint8Array([]),
      logText: '',
      v1: null,
      upgradeProgress: 0,
      variables: {
        'vac': 0,
        'vac_rms': 0,
        'vdc': 0,
        'ibus': 0,
        'tempm0': 0,
        'tempm1': 0,
        'tempmos': 0,
        'fsm_raw': 0,
        'fsm_str': 0,
      },
      var_fifos: [
        new Array(FIFO_CNT),
        new Array(FIFO_CNT),
        new Array(FIFO_CNT),
        new Array(FIFO_CNT),
        new Array(FIFO_CNT),
        new Array(FIFO_CNT),
        new Array(FIFO_CNT),
        new Array(FIFO_CNT),
      ],
      simu_dt : 0,
      echartOption : {
        legend: {
          data: ['vac', 'vac_rms', 'vdc', 'ibus', 'tempm0', 'tempm1', 'tempmos',  'fsm_raw', 'fsm_str' ],
          // orient: 'vertical',
          // top: 20,
          // // left:10,
          // // top: 'center',
          // left: 'center',
          // backgroundColor: '#eee',
          // z: 400,
        },
      },
      chartInstance: null,
      // v1 : new Bmv1(),
    };
  },

  methods: {
    initChart() {
      // Initialize the chart instance
      this.chartInstance = echarts.init(this.$refs.chart);

      //gen fake data for variables
      this.variables['vac'] = 123;
      this.variables['vdc'] = 333;

      // Define the chart options
      const option = {
        xAxis: {
          type: 'category',
          // data: Object.keys(this.variables)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: Object.values(this.variables),
          type: 'line'
        }]
      };

      // Set the chart options
      this.chartInstance.setOption(option);
    },

    updatePlot() {
      // Update the chart with new data
      const option = {
        series: [{
          data: Object.values(this.variables)
        }]
      };
      this.chartInstance.setOption(option);
    },

    updatePlotFifo() {
      // Update the chart with new data
      for (let i = 0; i < this.var_fifos.length; i++) {
        this.var_fifos[i].shift();
        this.var_fifos[i].push(this.variables[Object.keys(this.variables)[i]]);
      }
      // console.log(this.variables);
      console.log(this.var_fifos);


      this.echartOption = {
        xAxis: {
          type: 'category',
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: 'vac',
          data: this.var_fifos[0],
        },
      ]};
      this.chartInstance.setOption(this.echartOption);
    },
    fakeSimuPlot() {
      //gen sin wave into this.var_fifos
      this.simu_dt += 0.1;
      
      for (let i = 0; i < this.var_fifos.length; i++) {
        console.log(this.var_fifos[i]);
        this.var_fifos[i].shift();
        // push random
        // this.var_fifos[i].push(Math.sin(this.simu_dt));
        this.var_fifos[i].push(Math.random());
      }

      this.echartOption = {
        xAxis: {
          type: 'category',
          // data: Object.keys(this.variables)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: 'vac',
          data: this.var_fifos[0],
        },
        {
          name: 'rms',
          data: this.var_fifos[1],
        },
      ]};
      this.chartInstance.setOption(this.echartOption);
    },

    ble_read() {
      //we put data into v1 directly.
    },

    ble_write(arr) {
      this.sendCommand(arr);
    },
    addTodo(lab) {
      console.log('todo added' + lab);
      this.TodoItems.push({ id: uniqueId('todo-'), label: lab, done: false });
      console.log(this.v1.version());
      console.log(this.v1.bs2str([48, 49, 50, 51]));
    },

    handleNotifications(event) {
      let u8arr = new Uint8Array(event.target.value.buffer);
      // console.log('> ', (u8arr));
      // this.v1.rxdata.set(value.buffer);
      // this.v1.rxdata.buffer = this._appendBuffer(this.v1.rxdata.buffer, value.buffer);
      // this.v1.rxdata_input(u8arr);

      //parse data
      /*
      typedef struct __attribute__((packed))
      {
          uint16_t vdc_realtime;
          uint16_t vac_rms;
          uint16_t vdc;
          uint16_t ibus_ma;
          int16_t temp_m0;
          int16_t temp_m1;
          int16_t temp_mos;
          pwr_fsm_e power_fsm;//size4 int
      } upload_data_t;
       */
      // if (u8arr.length == 15) {
      //   //use dataview
      //   let dv = new DataView(u8arr.buffer);
      //   let vdc_realtime = dv.getUint16(0, true);
      //   let vac_rms = dv.getUint16(2, true);
      //   let vdc = dv.getUint16(4, true);
      //   let ibus_ma = dv.getUint16(6, true);
      //   let temp_m0 = dv.getInt16(8, true);
      //   let temp_m1 = dv.getInt16(10, true);
      //   let temp_mos = dv.getInt16(12, true);
      //   let power_fsm = dv.getUint8(14, true);
        
      //   console.log('vdc_realtime:' + vdc_realtime);
      //   console.log('vac_rms:' + vac_rms);
      //   console.log('vdc:' + vdc);
      //   console.log('ibus_ma:' + ibus_ma);
      //   console.log('temp_m0:' + temp_m0);
      //   console.log('temp_m1:' + temp_m1);
      //   console.log('temp_mos:' + temp_mos);
      //   console.log('power_fsm:' + power_fsm);
      // }

      //parse data format in string '/*v1,v2,v3,...*/'
      let str = new TextDecoder().decode(u8arr);
      console.log(str);
      
      this.parseUploadString(str);
      // this.updatePlot();
      // this.updatePlotFifo();
      // this.logText += this.v1.ab2hex(u8arr);
      this.logText += str;
    },

    send() {
        // let cmd = new Uint8Array([0x1,0x64, 0, 0, 0, 0, 0, 0]);
        // let value = document.querySelector('#tx').value;
        //convert string to Uint8Array
        // let ab = new TextEncoder().encode('fuck');
        // this.sendCommand(ab);
        this.v1.version_reqv1();
    },

    v1ota() {
      this.v1.enter_upgrade_req();
      //如果是直接settimout调用 this是html,没有v1这个对象
      // setTimeout(()=>{
      //   this.v1.start_upgrade_req();
      // }, 2000);
    },

    append() {
      this.v1.rxdata_input(new TextEncoder().encode('abcd'));
      this.logText += this.v1.ab2hex(this.v1.rxdata);
    },

    clear() {
      this.v1.rxdata_clear();
      this.logText = '';
    },
    /**
     * Send a command to the device.
     * See http://wittidesign.com/en/developer/ for API.
     *
     * @param cmd The command bytes and associated data.
     */
    sendCommand(cmd) {
      if (writeCharacteristic) {
        // Handle one command at a time
        if (busy) {
          // Queue commands
          commandQueue.push(cmd);
          return Promise.resolve();
        }
        busy = true;


        return writeCharacteristic.writeValue(cmd).then(() => {
          // console.log('call send' + cmd);
          busy = false;
          // Get next command from queue
          let nextCommand = commandQueue.shift();
          if (nextCommand) {
            this.sendCommand(nextCommand);
          }
        });
      }
      else {
        return Promise.resolve();
      }
    },

    testBLE() {
      console.log('btn');
      navigator.bluetooth.requestDevice({
        filters: [{
          namePrefix: '@',
        }],
        optionalServices: ['0000fff0-0000-1000-8000-00805f9b34fb',
          '0000fff1-0000-1000-8000-00805f9b34fb']
      })
        .then(device => {
          console.log('Got device:', device.name);
          console.log('id:', device.id);
          return device.gatt.connect();
        })
        .then(server => {
          console.log('server:', server);
          gattServer = server;
          return gattServer.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
        })
        .then(service => {
          console.log('> service:', service);
          // commandService = service;
          return service.getCharacteristic(0xfff1);
        })
        .then(characteristic => {
          console.log('> characteristic:', characteristic);
          if (characteristic.properties.read) {
            // readCharacteristic = characteristic;
            console.log('> characteristic has read');
            // characteristic.readValue().then(value => {
            //     console.log('> Read ' + value.getUint8(0));
            // });
          }
          if (characteristic.properties.write) {
            console.log('> characteristic has write');
            // characteristic.writeValue(new Uint8Array([0x01]));
            writeCharacteristic = characteristic;
            // let cmd = new Uint8Array([0x1, 0x64, 0, 0, 0, 0, 0, 0]);
            // this.sendCommand(cmd);
          }

          if (characteristic.properties.notify) {
            console.log('> characteristic has notify');
            return characteristic.startNotifications().then(() => {
              console.log('> Notifications started');
              characteristic.addEventListener('characteristicvaluechanged',
                this.handleNotifications);
            });
          }
          else {
            console.log('> characteristic has no notify');
          }
        })
        .catch(error => {
          console.log('Argh! ' + error);
        });
    },
    disconnect() {
      if (gattServer) {
        gattServer.disconnect();
        writeCharacteristic = null;
      }
    },
    handleFileLoaded(arr) {
      console.log('file loaded to v1');
      this.v1.upgrade_load_firmware(arr);
      // console.log(this.v1.fw_data);
      console.log(this.v1.package_upgrade_req(this.v1.UPPACK_SIZE, 0, 1));
    },
    up_show_progress(progress) {
      // let progress = this.v1.upgrade_progress();
      console.log(progress);
      this.upgradeProgress = progress;
      if (progress == 100) {
        console.log('upgrade done');
      }
    },
    
    // str like /*v1,v2,v3,...*/
    parseUploadString(s) {
      if (s.startsWith('/*') && s.endsWith('*/')) {
        s = s.substring(2, s.length - 2);
      }
      else {
        console.log('invalid upload string');
        return;
      }
      let arr = s.split(',');
      this.variables['vac'] = parseInt(arr[0]);
      this.variables['vac_rms'] = parseInt(arr[1]);
      this.variables['vdc'] = parseInt(arr[2]);
      this.variables['ibus'] = parseInt(arr[3]);
      this.variables['tempm0'] = parseInt(arr[4]);
      this.variables['tempm1'] = parseInt(arr[5]);
      this.variables['tempmos'] = parseInt(arr[6]);
      this.variables['fsm_raw'] = parseInt(arr[7]);
      this.variables['fsm_str'] = fsm2str[this.variables['fsm_raw']];
      console.log('vac:' + this.variables['vac']);
      console.log('vac_rms:' + this.variables['vac_rms']);
      console.log('vdc:' + this.variables['vdc']);
      console.log('ibus_ma:' + this.variables['ibus']);

      // this.vac_rms = parseInt(arr[1]);
      // this.vdc = parseInt(arr[2]);
      // this.ibus = parseInt(arr[3]);
      // this.tempm0 = parseInt(arr[4]);
      // this.tempm1 = parseInt(arr[5]);
      // this.tempmos = parseInt(arr[6]);
      // this.fsm = parseInt(arr[7]);
      // console.log('vdc_realtime:' + vdc_realtime);
      // console.log('vac_rms:' + vac_rms);
      // console.log('vdc:' + vdc);
      // console.log('ibus_ma:' + ibus_ma);
      // console.log('temp_m0:' + temp_m0);
      // console.log('temp_m1:' + temp_m1);
      // console.log('temp_mos:' + temp_mos);
      // console.log('power_fsm:' + power_fsm);
    },
    
  },

  mounted() {
    this.initChart();
  },
  
  created() {
    // setInterval(this.fakeSimuPlot, 100);
    this.v1 = new Bmv1(this.ble_read, this.ble_write, this.up_show_progress, 4, 1, false, true);
    //gen fake bin arr
    for(let i = 0; i < 100; i++) {
      this.binFile = new Uint8Array(20*1024);
    }
    this.v1.upgrade_load_firmware(this.binFile);
    
    // console.log(this.v1.enter_upgrade_req());
    // console.log(this.v1.start_upgrade_req());
    // console.log(this.v1.end_upgrade_req());
  },
}
</script>

<style>

/* Add some basic styling */
table {
  width: 100%;
  border-collapse: collapse;
}

td {
  border: 1px solid #ddd;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

/* 全局样式 */
.btn {
  padding: 0.8rem 1rem 0.7rem;
  border: 0.2rem solid #4d4d4d;
  cursor: pointer;
  text-transform: capitalize;
}

.btn__danger {
  color: #fff;
  background-color: #ca3c3c;
  border-color: #bd2130;
}

.btn__filter {
  border-color: lightgrey;
}

.btn__danger:focus {
  outline-color: #c82333;
}

.btn__primary {
  color: #fff;
  background-color: #000;
}

.btn-group {
  display: flex;
  justify-content: space-between;
}

.btn-group>* {
  flex: 1 1 auto;
}

.btn-group>*+* {
  margin-left: 0.8rem;
}

.label-wrapper {
  margin: 0;
  flex: 0 0 100%;
  text-align: center;
}

[class*="__lg"] {
  display: inline-block;
  width: 100%;
  font-size: 1.9rem;
}

[class*="__lg"]:not(:last-child) {
  margin-bottom: 1rem;
}

@media screen  {
  [class*="__lg"] {
    font-size: 2.4rem;
  }
}

.visually-hidden {
  position: absolute;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px 1px 1px 1px);
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}

[class*="stack"]>* {
  margin-top: 0;
  margin-bottom: 0;
}

.stack-small>*+* {
  margin-top: 1.25rem;
}

.stack-large>*+* {
  margin-top: 2.5rem;
}

@media screen {
  .stack-small>*+* {
    margin-top: 1.4rem;
  }

  .stack-large>*+* {
    margin-top: 2.8rem;
  }
}

/* 全局样式结束 */
#app {
  background: #fff;
  margin: 2rem auto;
  padding: 1rem;
  padding-top: 0;
  position: relative;
  box-shadow:
    0 2px 4px 0 rgba(0, 0, 0, 0.2),
    0 2.5rem 5rem 0 rgba(0, 0, 0, 0.1);
  min-width: 800px;
  max-width: 1200px;
}

@media screen {
  #app {
    padding: 4rem;
  }
}

#app>* {
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}

/* #app>form {
  max-width: 100%;
} */

#app h1 {
  display: block;
  min-width: 100%;
  width: 100%;
  text-align: center;
  margin: 0;
  margin-bottom: 1rem;
}
</style>

