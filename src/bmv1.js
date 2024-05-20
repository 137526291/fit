
// this file contains the javascript functions for the bmv1 c lib
// generate js functions like bmv1.py

/* eslint-disable */

//send a bmv1 format protocol frame.
const LOCAL_TYPE_HOST = 0xa;
const LOCAL_ID = 0x0;

const BMV1_TYPE_M1502 = 1;
const BMV1_TYPE_P1010 = 2;
const BMV1_TYPE_M1101 = 4;
const BMV1_TYPE_USBCAN = 0xB;


function crc8_maxim (array) {
    const CRC8_DATA = [
      0, 94, 188, 226, 97, 63, 221, 131, 194, 156, 126, 32, 163, 253, 31, 65,
      157, 195, 33, 127, 252, 162, 64, 30, 95, 1, 227, 189, 62, 96, 130, 220,
      35, 125, 159, 193, 66, 28, 254, 160, 225, 191, 93, 3, 128, 222, 60, 98,
      190, 224, 2, 92, 223, 129, 99, 61, 124, 34, 192, 158, 29, 67, 161, 255,
      70, 24, 250, 164, 39, 121, 155, 197, 132, 218, 56, 102, 229, 187, 89, 7,
      219, 133, 103, 57, 186, 228, 6, 88, 25, 71, 165, 251, 120, 38, 196, 154,
      101, 59, 217, 135, 4, 90, 184, 230, 167, 249, 27, 69, 198, 152, 122, 36,
      248, 166, 68, 26, 153, 199, 37, 123, 58, 100, 134, 216, 91, 5, 231, 185,
      140, 210, 48, 110, 237, 179, 81, 15, 78, 16, 242, 172, 47, 113, 147, 205,
      17, 79, 173, 243, 112, 46, 204, 146, 211, 141, 111, 49, 178, 236, 14, 80,
      175, 241, 19, 77, 206, 144, 114, 44, 109, 51, 209, 143, 12, 82, 176, 238,
      50, 108, 142, 208, 83, 13, 239, 177, 240, 174, 76, 18, 145, 207, 45, 115,
      202, 148, 118, 40, 171, 245, 23, 73, 8, 86, 180, 234, 105, 55, 213, 139,
      87, 9, 235, 181, 54, 104, 138, 212, 149, 203, 41, 119, 244, 170, 72, 22,
      233, 183, 85, 11, 136, 214, 52, 106, 43, 117, 151, 201, 74, 20, 246, 168,
      116, 42, 200, 150, 21, 75, 169, 247, 182, 232, 10, 84, 215, 137, 107, 53]
  
    // const i = 0
    // const i2 = array.length
    let b = 0
    for (let index = 0; index < array.length; index++) {
      b = CRC8_DATA[b ^ array[index] & 0xff]
    }
    return b
}

//test array = [0x30, 0x31, 0x32, 0x33];
//output should be 0xBBBB 
function crc16_xmodem(array) {
    let crc = 0x0000;
    const polynomial = 0x1021;
    let byte_val, bit, c15;
    for (let i = 0; i < array.length; i++) {
      byte_val = array[i]
      for (let k = 0; k < 8; k++) {
        bit = ((byte_val >> (7 - k) & 1) == 1);
        c15 = ((crc >> 15 & 1) == 1);
        crc <<= 1;
        if (c15 ^ bit) {
          crc ^= polynomial;
        }
      }
    }
    crc &= 0xffff;
    return crc;
}

/*
**  CRC-16/8005
**  Descriptions: CRC16 checksum function poly:0x8005
**  Input:        Data to check,Stream length, initialized checksum
**  Output:       CRC checksum uint16
*/
function crc16_arc8005(array)
{
    const CRC16_TAB = [0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601,
		0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0,
		0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81,
		0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941,
		0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01,
		0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0,
		0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081,
		0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240,
		0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00,
		0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0,
		0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981,
		0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41,
		0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700,
		0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0,
		0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281,
		0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441,
		0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01,
		0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1,
		0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80,
		0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541,
		0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101,
		0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0,
		0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481,
		0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40,
		0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801,
		0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1,
		0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581,
		0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341,
		0x4100, 0x81c1, 0x8081, 0x4040];

    let u16 = 0;
    // for (let i = 0; i < array.length; i++) {
    //     u16 = (u16 >> 8) ^ CRC16_TAB[(u16 ^ array[i]) & 0x00ff];
    // }
    // be care about js bit shift
    for (let i = 0; i < array.length; i++) {
        u16 = ((u16 >> 8) ^ CRC16_TAB[(u16 ^ array[i]) & 0x00ff]) & 0xffff;
    }
    return u16;
}

//npm install --save js-crypto-aes // npm
// import aes from 'js-crypto-aes'
var aesjs = require('aes-js');
//import aes.js in local dir
// import {aesjs} from './aes.js';


// const msg = new TextEncoder().encode('-FFFF0000-FFFF0000-FFFF0000-'); // arbitrary length of message in Uint8Array
const msg = new Uint8Array(new TextEncoder().encode('-FFFF0000-FFFF0000-FFFF0000-')); // arbitrary length of message in Uint8Array
const key = new Uint8Array([0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c]); // 16 bytes or 32 bytes key in Uint8Array
// const iv = new Uint8Array(12); // 12 bytes IV in Uint8Array for AES-CTR mode
//after enc, you get an Uint8Array of encrypted message
const emsg = new Uint8Array([80,177,45,74,92,136,169,131,14,111,182,1,255,93,100,95,103,34,80,6,114,247,248,143,158,196,86,148]);

// def bm_aes_enc(data):
//     bmkey = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c] #秘钥
//     bmkey = bytes(bmkey)
//     aes = AES.new(bmkey, AES.MODE_CTR, counter=Counter.new(128, initial_value=0))
//     return aes.encrypt(data)

//accoding to python aes code, write js version aes
// const enc = aes.encrypt(msg, key, {name: 'AES-CBC', iv});
// The counter is optional, and if omitted will begin at 1
// var aes_ctr0 = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(0));
// var aes_ctr1 = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(0));
// var enc = aes_ctr0.encrypt(msg);
// // const enc = aesjs.utils.hex.fromBytes(msg);
// console.log(enc);
// const dec = aes_ctr1.encrypt(enc);
// console.log(dec);
// if (dec !== emsg) {
//     console.log('enc failed');
// }
// console.log('after dec' + new TextDecoder().decode(dec));

class BufferManager {
    constructor(initialCapacity = 1024) {
        this.buffer = new Uint8Array(initialCapacity);
        this.length = 0;
    }

    ensureCapacity(additionalLength) {
        const requiredLength = this.length + additionalLength;
        if (requiredLength <= this.buffer.length) {
            return;
        }

        let newCapacity = this.buffer.length;
        while (newCapacity < requiredLength) {
            newCapacity *= 2; // Double the capacity until it fits the required length
        }

        // Create a new buffer with the new capacity and copy the old data into it
        const newBuffer = new Uint8Array(newCapacity);
        newBuffer.set(this.buffer.subarray(0, this.length));
        this.buffer = newBuffer;
    }

    appendBuffer(additionalBuffer) {
        this.ensureCapacity(additionalBuffer.byteLength);
        this.buffer.set(new Uint8Array(additionalBuffer), this.length);
        this.length += additionalBuffer.byteLength;
    }

    getBuffer() {
        // Return a subarray view of the actual data
        return this.buffer.subarray(0, this.length);
    }
}


export var Bmv1 = function(read, write, up_cb, receiver_type = BMV1_TYPE_M1101, receiver_id = 1, debug_tx = true, debug_rx = true) {
    this.CMDID_GET_VERSION_REQ      = (0x0001)
    this.CMDID_GET_VERSION_ACK      = (0x0002)
    this.__CMDID_ENTER_UPGRADE_REQ    = (0x000A)
    this.__CMDID_ENTER_UPGRADE_ACK    = (0x000B)
    this.__CMDID_START_UPGRADE_REQ    = (0x000C)
    this.__CMDID_START_UPGRADE_ACK    = (0x000D)
    this.__CMDID_PACKAGE_UPGRADE_REQ  = (0x000E)
    this.__CMDID_PACKAGE_UPGRADE_ACK  = (0x000F)
    this.__CMDID_END_UPGRADE_REQ      = (0x0010)
    this.__CMDID_END_UPGRADE_ACK      = (0x0011)
    this.UPPACK_SIZE = 128;
    
    
    
    this.read = read;   // read function
    this.write = write;
    this.up_progress_hook = up_cb; // upgrade callback function

    // this.__crc8_func = crcmod.predefined.mkCrcFun('crc-8-maxim')
    // this.__crc16_func = crcmod.predefined.mkCrcFun('crc-16')
    this.__crc8_func = crc8_maxim;
    // this.__crc16_func = crc16_xmodem;//0is correct
    this.__crc16_func = crc16_arc8005;

    this.__aes_key = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c];

    //symmetric encryption 
    this.aes_xcrypt = (arr)=>{
        var aesctr = new aesjs.ModeOfOperation.ctr(this.__aes_key, new aesjs.Counter(0));
        return aesctr.encrypt(arr);
    }

    // this.aes_xcrypt = aes.encrypt;//FIXME
    // this.aes_decrypt = aes.decrypt;//FIXME

    this.local_type = LOCAL_TYPE_HOST;
    this.local_id = LOCAL_ID;
    this.rx_type = receiver_type
    this.rx_id = receiver_id
    this.__debug_tx = debug_tx;
    this.__debug_rx = debug_rx;

    
    //use buffer manager to avoid allocate memory frequently
    //but need maintain buffer length manually, fuck!
    // this.bufferManager = new BufferManager();
    // this.rxdata = this.bufferManager.getBuffer();
    this.rxdata = new Uint8Array([]);
    this.fw_data = [];

    this.up_step = 0;
    this.up_successful_count = 0;
    // this.up_progress_hook;
    this.up_log_hook ;
    this.upgrade_end_hook;
    this.end_flag = 0;

    // self.cmd_handlers = {}   #dict
    this.cmd_handlers = null;
    // # v0使用req_cmdid+1作为ack v1使用相同cmdid作为ack

    // # self.cmd_handlers[self.CMDID_GET_VERSION_ACK] = self.version_ack_handler
    // this.cmd_handlers.set();
    // this.cmd_handlers.set();
    // this.cmd_handlers.set();
    // this.cmd_handlers.set();


    this.append_buffer = (buffer1, buffer2) => {
        // Ensure the first buffer has a byteLength property; if not, default to 0
        let b1l = buffer1 && buffer1.byteLength ? buffer1.byteLength : 0;
        // Create a new Uint8Array with a length equal to the sum of both buffers
        let tmp = new Uint8Array(b1l + buffer2.byteLength);
        // If the first buffer is defined and has content, set it into the new array
        if (buffer1) {
            tmp.set(new Uint8Array(buffer1), 0);
        }
        // Set the second buffer into the new array starting at the end of the first
        tmp.set(new Uint8Array(buffer2), b1l);
        return tmp;
    };

    // this.rxdata_input_bm = (arr) => {
    //     let buffer2 = arr instanceof ArrayBuffer ? arr : new Uint8Array(arr).buffer;
    //     this.bufferManager.appendBuffer(buffer2);
    //     this.rxdata = this.bufferManager.getBuffer();
    // }
    
    this.rxdata_input = (arr) => {
        // Ensure that arr is an instance of ArrayBuffer; if not, convert it
        let buffer2 = arr instanceof ArrayBuffer ? arr : new Uint8Array(arr).buffer;
        // Append the new data to this.rxdata and reassign it
        this.rxdata = this.append_buffer(this.rxdata.buffer, buffer2);
    };

    this.rxdata_clear = () => {
        // this.bufferManager = new BufferManager();
        this.rxdata = new Uint8Array([]);
    }
    
    
    //how can i load xx.bin file in nodejs?
    this.upgrade_load_firmware = (data)=>{
        this.fw_data = data;
        this.fw_size = data.length;
        // with open(fn, 'rb') as f:
        //     self.fw_data = f.read()
        // self.fw_size = os.path.getsize(fn)
    }

    this.register_cmd_handler = (cmdid, handler)=>{
        this.cmd_handlers[cmdid] = handler;
    }

    this.version = () => {
        return "bmv1 ddt";
    }

    // sof len16 crc8 cmdid data ...crc16
    this.header_size = function header_size() {
        return 6;
    }
    
    // v0 + seq + sender + receiver + attr
    this.headerv1_size = function headerv1_size() {
        return 6 + 7;
    }

    this.__bs2str = function __bs2str(bs) {
        var str = '';
        for (var i = 0; i < bs.length; i++) {
            str += bs[i].toString(16) + ' ';
        }
        return str;
    }

    this.ab2hex = function ab2hex(buffer) {
        var hexArr = Array.prototype.map.call(
            new Uint8Array(buffer),
            function (bit) {
                return ('00' + bit.toString(16)).toUpperCase().slice(-2)
            }
        )
        return hexArr.join('');
    }

    this.bs2str = function bs2str(bs) {return this.__bs2str(bs);}
    
    this.dmv0_protocol_pack = function (cmdid, data) {
        var header_len = this.header_size();
        var buffer = new Uint8Array(header_len);
        buffer[0] = 'd'.charCodeAt(0);
        var total_len = header_len + data.length + 2;
        buffer[1] = total_len&0xff;
        buffer[2] = total_len>>8;
        // buffer[3] = crc8_func(bs, crc=0x77)   //with crc init
        buffer[3] = this.__crc8_func(buffer.slice(0, 3));
        //buffer[3] = crc8.crcValue    //header crc8

        buffer[4] = cmdid & 0xff;
        buffer[5] = cmdid >> 8;

        buffer.set(data, 6);
        var crc16 = this.__crc16_func(buffer);
        buffer[buffer.length-2] = crc16&0xff;
        buffer[buffer.length-1] = crc16>>8;

        if (this.__debug_tx) {
            console.log(this.__bs2str(buffer));
        }
    }

    this.dmv1_protocol_pack = (cmdid, data, seq,
        sender_type, sender_id,
        receiver_type, receiver_id,
        is_enc, is_ack) => 
    {
        var header_len = this.headerv1_size();
        var buffer = new Uint8Array(header_len+data.length+2);
        buffer[0] = 'd'.charCodeAt(0);
        var total_len = header_len + data.length + 2;
        buffer[1] = total_len&0xff;
        buffer[2] = (total_len>>8) | (0x1<<4);
        // buffer[3] = crc8_func(bs, crc=0x77)   //with crc init
        buffer[3] = this.__crc8_func(buffer.slice(0, 3));

        buffer[4] = cmdid & 0xff;
        buffer[5] = cmdid >> 8;

        buffer[6] = seq & 0xff;
        buffer[7] = seq >> 8;
        // self.seq += 1
        // struct __PACKED
        // {
        //     uint8_t type : 4;
        //     uint8_t id : 4;
        // } sender;
        // struct __PACKED
        // {
        //     uint8_t type : 4;
        //     uint8_t id : 4;
        // } receiver;
        // buffer[8] = sender_type&0xf | (sender_id << 4)
        // buffer[9] = receiver_type&0xf | (receiver_id << 4)

        buffer[8] = sender_id;
        buffer[9] = sender_type;
        buffer[10] = receiver_id;
        buffer[11] = receiver_type;

        // struct __PACKED
        // {
        //     uint8_t encrypt_type : 2;
        //     uint8_t reserve : 4;
        //     uint8_t need_ack : 1;
        //     uint8_t cmd_type : 1; 
        // } attr;
        // 00是req明文包 80是ack明文
        // 01是req加密包 81是ack不过可以不带数据了
        buffer[12] = is_enc | (is_ack << 8);

        buffer.set(data, 13);
        var crc16 = this.__crc16_func(buffer.slice(0, buffer.length-2));
        buffer[buffer.length-2] = crc16&0xff;
        buffer[buffer.length-1] = crc16>>8;

        if (this.__debug_tx) {
            console.log(this.__bs2str(buffer), 'crc16:');
        }
        
        if (this.write) {
            this.write(buffer, (self.local_type<<8) | self.local_id);
        }
        return buffer;
    }

    this.version_req = function () {
        return this.dmv0_protocol_pack(this.CMDID_GET_VERSION_REQ, new Uint8Array([1,2,3,4]));
    }

    this.version_reqv1  = function () {
        return this.dmv1_protocol_pack(
            this.CMDID_GET_VERSION_REQ,
            new Uint8Array([1,2,3,4]), 0,
            this.local_type, this.local_id,
            this.rx_type, this.rx_id,
            0, 0);
    }

    this.version_ack = (data) => {
        // var res, pack_size = unpack('<BHxx', data);
        var dv = new DataView(data.buffer);
        var res = dv.getUint8(0);
        var pack_size = dv.getUint16(1, true);
        console.log('version ack handler called {}, {}'+(res, pack_size));
        if (res == 0) {
            this.up_step += 1;
            this.enter_upgrade_req();
        }
    },

    this.enter_upgrade_req = function () {
        console.log("--entering upgrade ");
        var cmdid = 0x000a;
        var revs0 = 0;
        var revs1 = 0;
        var bs = new Uint8Array(8);
        // v0 = self.dmv0_protocol_pack(self.__CMDID_ENTER_UPGRADE_REQ, bs)
        // return v0
        return this.dmv1_protocol_pack(this.__CMDID_ENTER_UPGRADE_REQ, bs, this.seq,
            this.local_type, this.local_id,
            this.rx_type, this.rx_id, 0, 0);
        // time.sleep(1)
        // this.up_log('--enter upgrade req, waiting for 1s')
    }

    this.enter_upgrade_ack = (data) => {
        // 主动进行下一步开始升级命令
        console.log("--enter upgrade ok");
        // time.sleep(1) #等待app进入loader再发开始升级
        this.start_upgrade_req();
        // v0 = self.dmv0_protocol_pack(self.__CMDID_ENTER_UPGRADE_REQ, bs)
        // return v0
        // v1 = self.dmv1_protocol_pack(self.__CMDID_ENTER_UPGRADE_ACK, bs, self.seq, 
        //                              self.local_type, 0,
        //                              self.rx_type, self.rx_id, 0, 0)
        // return v1
    }

    this.start_upgrade_req = function () {
        var param_start_addr = 0x08008000 - 0x800;
        var param_size = 0x100;
        var firmware_start_addr = 0x08008000;
        var firmware_size = this.fw_size;
        var hardware_code = 0xcdab8967;
        var jump2app_delay = 300;
        var revs32 = 0;
        this.upgrade_progress = 0;
        var bs = new Uint8Array(28);
        // bs = pack('<iiiiiii', 0,0,0,self.fw_size, 0,0,0)   #little endian
        var dv = new DataView(bs.buffer);
        dv.setInt32(0, 0, true);
        dv.setInt32(4, 0, true);
        dv.setInt32(8, 0, true);
        dv.setInt32(12, this.fw_size, true);
        dv.setInt32(16, 0, true);
        dv.setInt32(20, 0, true);

        console.log("--starting upgrade");
        // v0 = self.dmv0_protocol_pack(self.__CMDID_START_UPGRADE_REQ, bs)
        return this.dmv1_protocol_pack(this.__CMDID_START_UPGRADE_REQ, bs, this.seq,
            this.local_type, this.local_id,
            this.rx_type, this.rx_id, 0, 0);
    }

    this.start_upgrade_ack = (data) => {
        // var res, pack_size = unpack('<BHxx', data);
        var dv = new DataView(data.buffer);
        var res = dv.getUint8(0);
        var pack_size = dv.getUint16(1, true);
        console.log('start upgrade ack handler called {}, {}'+(res, pack_size));
        if (res == 0) {
            this.up_step += 1;
            this.package_upgrade_req(this.UPPACK_SIZE, 0, 1);
        }
    }

    this.package_upgrade_req = function (package_size, package_idx, enc=0) {
        var rd_start = package_idx * package_size; //let it be n * 16  total = 20.
        var current_package_size = package_size;
        if (rd_start + package_size <= this.fw_size) {
            current_package_size = package_size;
        } else {
            current_package_size = this.fw_size - rd_start;
        }
        var fw_start = package_idx * package_size;
        var fw_end = fw_start + current_package_size;
        var buffer = this.fw_data.slice(fw_start, fw_end);
        // req = package_upgrade_req_t()
        var req_encrypt_type = enc;
        var req_package_index = package_idx;
        var req_package_size = current_package_size;
        var req_buf;
        if (enc) {
            // aes = MyAES(self.key, self.iv)
            req_buf = this.aes_xcrypt(buffer);
        } else {
            req_buf = buffer;
        }
        this.up_last_pack_seq = req_package_index;
        // print('buffer len', len(buffer))
        var bs = new Uint8Array(9 + req_buf.length);
        // bs = pack('<BiI256s', req_encrypt_type, req_package_index, req_package_size, req_buf)   //little endian
        var dv = new DataView(bs.buffer);
        dv.setUint8(0, req_encrypt_type);
        dv.setInt32(1, req_package_index, true);
        dv.setInt32(5, req_package_size, true);
        bs.set(req_buf, 9);
        // return self.dmv0_protocol_pack(self.__CMDID_PACKAGE_UPGRADE_REQ, bs)
        return this.dmv1_protocol_pack(this.__CMDID_PACKAGE_UPGRADE_REQ, bs, this.seq,
            this.local_type, this.local_id,
            this.rx_type, this.rx_id, 0, 0);
    }

    this.pack_up_retry = function () {
        console.log( 'retry package :{}'+(this.up_last_pack_seq) );
        this.package_upgrade_req(this.UPPACK_SIZE, this.up_last_pack_seq, 1);
    }

    this.package_upgrade_ack = (data) => {
        // var res, package_index = unpack('<Bixx', data);
        var dv = new DataView(data.buffer);
        var res = dv.getUint8(0);
        var package_index = dv.getInt32(1, true);
        // print('package upgrade ack handler called', res, package_index)
        var total_package_cnt = Math.floor( this.fw_size / this.UPPACK_SIZE );
        if (this.fw_size % this.UPPACK_SIZE) {
            total_package_cnt += 1;
        }
        var upgrade_end_index = total_package_cnt - 1;

        // print("package upgrade ack ok. ack pack ", package_index, '/', upgrade_end_index)
        if (res == 0) {
            this.up_step += 1;
            // console.log(`pack  index ${package_index}/${upgrade_end_index}`);
            if (package_index == this.up_last_pack_seq && package_index < upgrade_end_index) {
                this.package_upgrade_req(this.UPPACK_SIZE, package_index + 1, 1);
                // self.retry_timer.cancel()
                // self.retry_timer = threading.Timer(0.5, self.pack_up_retry)
                // self.retry_timer.start()
                // console.log('pack up ack ok {}{}{}{}{}'+(package_index, '/', upgrade_end_index, 'tx', package_index + 1));
                console.log(`pack up ack ok ${package_index}/${upgrade_end_index} tx ${package_index + 1}`);
                var progress = Math.ceil(100 * package_index / upgrade_end_index);
                if (this.up_progress_hook) {
                    this.up_progress_hook(progress);
                }
            } else if (package_index == upgrade_end_index) {
                console.log('end of up, tx end req ');
                // self.retry_timer.cancel()
                this.end_upgrade_req();
            } else {
                console.log('package ack failed, index mismatch retry last pack{}'+(this.up_last_pack_seq) );
                this.package_upgrade_req(this.UPPACK_SIZE, this.up_last_pack_seq, 1);
            }
        }
    
    }

    this.end_upgrade_req = function () {
        console.log("--ending upgrade");
        var firmware_digest_type = 0;
        // var md5 = new js_md5();
        // md5.update(this.fw_data);
        // console.log('md5=', md5.hexdigest());
        // var md5_digest = md5.hexdigest();
        var md5_digest = new Uint8Array(16);

        // var sha256 = new js_sha256();
        // sha256.update(md5_digest);
        // sha256.update(this.uid);
        var sha256 = new Uint8Array(32);
        // console.log('sha256 of md5 & uid=', sha256.hexdigest());
        // var sha256_digest = sha256.hexdigest();
        var sha256_digest = new Uint8Array(32);
        var crc16 = this.__crc16_func(this.fw_data);
        console.log(`crc16 of fw = ${crc16}`);
        // resv = bytearray(32)
        var data = new Uint8Array(52);
        // data = pack('<HH16s32s', firmware_digest_type, crc16, md5_digest, sha256_digest)   //little endian
        var dv = new DataView(data.buffer);
        dv.setUint16(0, firmware_digest_type, true);
        dv.setUint16(2, crc16, true);
        dv.setUint8(4, md5_digest);
        dv.setUint8(20, sha256_digest);
        // return self.dmv0_protocol_pack(self.__CMDID_END_UPGRADE_REQ, data)
        return this.dmv1_protocol_pack(this.__CMDID_END_UPGRADE_REQ, data, this.seq,
            this.local_type, this.local_id,
            this.rx_type, this.rx_id, 0, 0);
    
    }

    this.end_upgrade_ack = (data) => {
        // data = data[:3] #only 3bytes
        // res = unpack('<Bxx', data)
        var dv = new DataView(data.buffer);
        var res = dv.getUint8(0);
        console.log('end upgrade ack handler called {}'+(res) );
        this.up_step = 0xff;
        this.up_successful_count+=1;
        console.log("upgrade successful. {}"+(this.up_successful_count) );
        if (this.upgrade_end_hook) {
            this.upgrade_end_hook();
        }
    }

    

    this.dmv0_unpack_frame = (data) => {
        //find sof
        var i = 0;
        while (i < data.length && data[i] != 0x64) {
            i += 1;
        }
        data = data.slice(i);   //remove front.
        if (0 == data.length) {
            return;
        }
    
        //check head
        var head3 = data.slice(0, 3);
        if (this.__crc8_func(head3) == data[3]) {
            //crc8 ok
            var head6 = data.slice(0, this.header_size());
            // var sof, size, crc8, cmdid = unpack('<cHcH', head6);
            var dv = new DataView(head6.buffer);
            var sof = dv.getUint8(0);
            var size = dv.getUint16(1, true);
            var crc8 = dv.getUint8(3);
            var cmdid = dv.getUint16(4, true);

            var frame_data = data.slice(this.header_size(), size);
            var frame = head6.concat(frame_data);
            
            if (this.__debug_rx) {
                console.log('frame_size:%d cmdid:%2x fifo remain:%d'+(size, cmdid, data.length));
            }
            var crc16 = (frame_data[-1] << 8) + frame_data[-2];
            if (crc16 == this.__crc16_func(frame.slice(0, size-2))) {
                //if whole frame crc16 pass. remove from fifo.
                // print('crc16 pass') #no msg = good msg.
                if (this.cmd_handlers.has(cmdid)) {
                    this.cmd_handlers.get(cmdid)(frame_data);   //需要crc16 unpack末尾需要加入xx
                }
            } else {
                console.log('crc16 fail');
            }
            //crc16 pass or fail. remove frame from fifo.
            data = data.slice(size);
        } else {
            data = data.slice(4);
            // pass
            // print('crc8 fail')
            // self.rxdata = self.rxdata[3:]
        }
    }

    // 解析数据 如果解析成功返回当前帧的长度 然后截断原始数据
    // 如果不足一帧则返回等待下一次调用. 不可在函数中切数据，因为是浅拷贝
    this.dmv1_unpack_frame = (data) => {
        //find sof
        var unvalid_len = 0;
        var i = 0;
        while (i < data.length && data[i] != 0x64) {
            i += 1;
        }
        data = data.slice(i);   //remove front.
        //每一帧都以至少headv1+CRC16的形式发送。若不足，则返回等待足够长度
        if (data.length < this.headerv1_size()) {
            return i+data.length;
        }
        
        unvalid_len = i;

        if (this.__debug_rx) {
            // console.log("rdata:", this.__bs2str(data));
        }
        // self.logger.info("rdata:{}"+(self.__bs2str(rdata)))
        if (data[1] == 0x64) {
            data = data.slice(1);
            unvalid_len += 1;
        }
        //check head
        var head3 = data.slice(0, 3);
        try {
            if (this.__crc8_func(head3) == data[3]) {
                //crc8 ok
                // var sof, size = unpack('<cH', head3);
                var dv = new DataView(head3.buffer);
                var sof = dv.getUint8(0);
                var size = dv.getUint16(1, true);
                size = size & 0xfff;
                //检查是否能已接收完整一帧
                if (data.length < size) {
                    return -2;
                    // return 0
                }
                // print('wanted size enough:', size)
                var frame = data.slice(0, size);
                var headv1 = data.slice(0, this.headerv1_size());
                // var sof, size, crc8, cmdid, seq, sender, receiver, attr = unpack('<cHcHHHHB', headv1);
                var dv = new DataView(headv1.buffer);
                var sof1 = dv.getUint8(0);
                var size = dv.getUint16(1, true);
                var crc8 = dv.getUint8(3);
                var cmdid = dv.getUint16(4, true);
                var seq = dv.getUint16(6, true);
                var sender = dv.getUint16(8, true);
                var receiver = dv.getUint16(10, true);
                var attr = dv.getUint8(12);
                size = size & 0xfff;
                var frame_data = data.slice(this.headerv1_size(), size);
                // frame = headv1 + frame_data

                if (this.__debug_rx) {
                    // console.log('frame_size:%d cmdid:%2x fifo remain:%d'+(size, cmdid, data.length));
                    console.log(`frame_size:${size} cmdid:${cmdid}:%2x fifo remain:${data.length}`);
                    console.log(`[sender]:${sender} => [receiver]:${receiver} attr:${attr}`);
                }
                var crc16 = (frame_data[frame_data.length-1] << 8) + frame_data[frame_data.length-2];//js dont support -index
                // if crc16 == self.__crc16_func(frame[:-2]):
                if (true) {
                    //if whole frame crc16 pass. remove from fifo.
                    // print('crc16 pass') #no msg = good msg.
                    if (this.cmd_handlers.has(cmdid)) {
                        this.cmd_handlers.get(cmdid)(frame_data);   //需要crc16 unpack末尾需要加入xx
                        this.last_cmdid = cmdid;
                    }
                } else {
                    console.log('crc16 fail');
                }
                //crc16 pass or fail. remove frame from fifo.
                // rdata[:] = rdata[size :] #FIXME 此处截断头不会影响can_rxdata
                return size+unvalid_len;  //更新的偏离要加上帧头‘d’的偏离，否则无法修正后续的缓存偏离
                // print('fifo remain:%d' % (len(rdata)))
            }
            else {
                console.warn("error head:{}, crc:{}"+(this.__bs2str(head3), this.__crc8_func(head3)));
                console.warn("buffer:{}"+(this.__bs2str(data)));
                return -3;
            }
        }
        catch (e) {
            console.warn("Exception:{}"+(head3));
            return -4;
        }
    }

    this.unpack_loopv0 = function (data) {
        // self.logger.debug('unpack loop called')
        var header_len = this.header_size();
        var header = data.slice(0, header_len);
        var total_len = header[1] | (header[2] << 8);
        var cmdid = header[4] | (header[5] << 8);
        var crc16 = header[total_len - 2] | (header[total_len - 1] << 8);
        var crc16_calc = this.__crc16_func(header);
        if (crc16_calc != crc16) {
            console.warn('crc16 check failed', crc16, crc16_calc);
            return;
        }
        var payload = data.slice(header_len, total_len - 2);
        // self.logger.debug('unpack loop called {} {} {}'+(header_len, total_len, cmdid))
        if (this.cmd_handlers.has(cmdid)) {
            this.cmd_handlers.get(cmdid)(payload);
        }
    }

    this.unpack_loopv1 = function (u8a) {
        if (u8a.length > 0) {
            console.log('rx q len:' , u8a.length);
            var frame_size = this.dmv1_unpack_frame(u8a);
            if (frame_size > 0) {   //parse ok if > 0
                this.rxdata = this.rxdata.slice(frame_size);
            }
        }
    }

    //10ms call
    this.start_unpack_thread = function () {
        // self.logger.debug('unpack thread started')

        this.cmd_handlers = new Map([
            [this.CMDID_GET_VERSION_REQ, this.version_ack.bind(this)],
            [this.__CMDID_ENTER_UPGRADE_REQ, this.enter_upgrade_ack.bind(this)],
            [this.__CMDID_START_UPGRADE_REQ, this.start_upgrade_ack.bind(this)],
            [this.__CMDID_PACKAGE_UPGRADE_REQ, this.package_upgrade_ack.bind(this)],
            [this.__CMDID_END_UPGRADE_REQ, this.end_upgrade_ack.bind(this)],
        ]);
        console.log(this.cmd_handlers);

        setInterval( ()=> {
            this.unpack_loopv1(this.rxdata);
        }, 10);
        console.warn('call once.');
    }

    
    this.start_unpack_thread(); //call when init
    
}

// test code : nodejs bmv1.js
// data = ['0','1', '2', '3'];
// data = [0x30, 0x31, 0x32, 0x33];
// crc16 = crc16_arc8005(data);
// console.log(crc16);
// console.log(crc16_xmodem(data));
// v1 = new Bmv1();
// console.log(v1.bs2str(data));
// console.log(Bmv1.CMDID_GET_VERSION_REQ);
// console.log(v1.headerv1_size());
//usage: var v1 = new Bmv1(read, write);
// v1.enter_upgrade_req();
// v1.xxx

// var sftp = require('ssh2-sftp-client');
// var fs = require('fs');
// var path = require('path');

// fs.readFile(path.join(__dirname, 'aes.js'), 'utf8', function (err, data) {
//     if (err) {
//         return console.log(err);
//     }
//     console.log(data.slice(0, 100));
// });
