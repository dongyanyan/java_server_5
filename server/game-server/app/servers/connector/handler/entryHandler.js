module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
  this.sessionService = this.app.get('sessionService');
  this.loginUser = {};
};


var handler = Handler.prototype;

//登录
handler.enter = function(msg, session, next) {
  var self = this;
  var uid = msg.uid
  var sessionService = self.app.get('sessionService');

  //duplicate log in
  if( !! sessionService.getByUid(uid)) {
    next(null, {
      code: 500,
      error: true
    });
    return;
  }

  session.bind(uid);
  session.set("uid", uid);
  session.push("uid", function(err) {
    if(err) {
      console.error('set uid for session service failed! error is : %j', err.stack);
    }
  });
  console.log("uid : "+session.get("uid"))
  //session.on('closed', onUserLeave.bind(null, self.app));

  //put user into channel
    next(null, {
        code: 100,
    });
};

//接受客户端发送数据
handler.sendData = function(msg, session, next){
    console.log("code : "+msg.code)
    var self = this;
    //判断登录
    var uid = session.get("uid")
    console.log("uid : "+uid)
    if(!!uid){
        self.app.rpc.game.remote.receive(session, uid, self.app.get('serverId'), msg.code,msg.params, function(flag){
            next(null,{flag : flag});
        });   
    }else{
          next(null,{flag : false})
    }
}