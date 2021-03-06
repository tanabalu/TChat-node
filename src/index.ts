import { Socket } from "socket.io";

const Koa = require('koa');
const logger = require('koa-logger');
// 引入http标准模块,CommonJS模块
const http = require("http");
const fs = require("fs");
const ws = require("socket.io");
// const openUrl = require('@utils/openUrl');

const app = new Koa();
app.use(logger);

// 创建一个web服务器
// const server = http.createServer();
const server = http.Server(app.callback());

// 当前在线人数
let count = 0;
// 总访客人数
let totalCount = 0;

// 基于当前web服务器开启socket实例
// FIX: 处理跨域
const io = ws(server, {
	cors: {
		origin: '*'
	}
});

// 检测连接事件
io.on("connection", function(socket: Socket) {

	// console.log("当前有用户连接");
	++count;
	++totalCount;

	let name = '';

	// 给公众发送上线信息
	//	socket.broadcast.emit("connection", {
	//		count: count,
	//		id: count
	//	});

	// 给自己发送上线信息
	//	socket.emit("connection", {
	//		count: count,
	//		id: totalCount
	//	});

	// 加入群聊
	socket.on("join", function(message) {
		console.log('join', message, count, totalCount);
		name = message.name;
		console.log(name + "加入了群聊  ", new Date().toLocaleString());
		socket.broadcast.emit("joinNoticeOther", {
			name: name,
			action: "加入了群聊",
			count: count
		});
		socket.emit("joinNoticeSelf", {
			count: count,
			id: totalCount
		});
	});

	// 接收客户端所发送的信息
	socket.on("message", function(message) {
		console.log('message', message);
		// 向所有客户端广播发布的消息
		io.emit("message", message);
	});

	//	 监听到连接断开
	socket.on("disconnect", function() {
		--count;
		console.log(name + "离开了群聊  ", new Date().toLocaleString())
		io.emit("disconnection", {
			count: count,
			name: name
		});
	});

});

// 服务器监听端口
const port = 3001;
server.listen(port);
console.log(`Server has started: http://localhost:${port}\n`)
// openUrl(`http://localhost:${port}`)
