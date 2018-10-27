import os
import socket
import hmac
import qrcode
import qr_rgf
import bluetooth
import hashlib
import EV3BT
from threading import Thread
addr="127.0.0.1" #const
def sign(value):
    signeur=hmac.HMAC(b"t6QpYbBKR5gJm8tLddkA5xxnehGqxKpl7C83qqJbF3JYR2jupah54Zl5xLTNw1L5N9icHQ4O2FSS0EzbVeDh6HXHAqnWZeU1lqZZNRx3AzO4CGrpjiu5Z8QWAIgmgAQKD0Z9nFj4Fp9bGWJTC51WTk",digestmod=hashlib.sha256)
    signeur.update(value)
    return signeur.hexdigest()
def get_voyage(robot):
    return qr_ev3_senders[robot].get_voyage()
def reset_screen(robot):
    qr_ev3_senders[robot].reset_screen()
def command_drink(robot,drink):
    qr_ev3_senders[robot].command_drink(drink)
def get_etape(robot):
    return qr_ev3_senders[robot].get_etape()
class request_recieve(Thread):
    def __init__(self,a):
        Thread.__init__(self)
        self.a=a
    def response(self,response):
        self.cnx.send(response)
        self.cnx.close()
    def default_response(self,version,code,*infos):
        if code==404:
            self.response(version+b" 404 Not Found\r\n\r\n<h1>404 Not Found</h1><br/>This page was not found on this server."+b"".join([b"<br/>"+x for x in infos]))
        elif code==400:
            self.response(version+b" 400 Bad Request\r\n\r\n<h1>400 Bad Request</h1><br/>Your browser sent a request that this server could not understand."+b"".join([b"<br/>"+x for x in infos]))
        elif code==403:
            self.response(version+b" 403 Forbidden\r\n\r\n<h1>403 Forbidden</h1><br/>You are not authorized to view this page."+b"".join([b"<br/>"+x for x in infos]))
        elif code==500:
            self.response(version+b" 500 Internal Server Error\r\n\r\n<h1>500 Internal Server Error</h1>"+b"".join([b"<br/>"+x for x in infos]))
        elif code==501:
            self.response(version+b" 501 Not Implemented\r\n\r\n<h1>501 Not Implemented</h1>"+b"".join([b"<br/>"+x for x in infos]))
    def verify_that(self,ctn,**kwargs):
        condition=ctn.split(b"\n")[0][13:].decode()
        kwargs["a"]=[]
        if condition.endswith("\r"):
            condition=condition[:-1]
        exec("a.append("+condition+")",kwargs)
        if kwargs["a"][0]:
            return b"\n".join(ctn.split(b"\n")[1:])
        else:
            self.default_response(version,403)
            return 0
    def define(self,ctn,**kwargs):
        kwargs["a"]=[]
        expr=ctn.split(b"\n")[0][8:].decode()
        if expr.endswith("\r"):
            expr=expr[:-1]
        value=expr.split(";")[0]
        while value.startswith(" "):
            value=value[1:]
        while value.endswith(" "):
            value=value[:-1]
        expr=expr.split(";")[1]
        exec("a.append(str("+expr+").encode())",kwargs)
        ctn=b"\n".join(ctn.split(b"\n")[1:])
        return kwargs["a"][0].join(ctn.split(value.encode()))
    def run(self):
        self.cnx,infos=self.a.accept()
        request_recieve(self.a).start()
        try:
            request=self.cnx.recv(1024)
            request=request.split(b"\r\n")
            try:
                version=request[0].split(b" ")[2]
            except:
                self.default_response(b"HTTP/1.1",400)
                return
            try:
                url=request[0].split(b" ")[1]
            except IndexError:
                self.default_response(version,400)
                return
            parameters={}
            path=url.split(b"?")[0]
            if len(url.split(b"?"))==2:
                for x in url.split(b"?")[1].split(b"&"):
                    parameters[x.split(b"=")[0]]=x.split(b"=")[1]
                    print(parameters)
            elif len(url.split(b"?"))>2:
                self.default_response(version,400)
                return
            i=0
            path=list(path)
            while i<len(path):
                if path[i]==37:
                    HEX=path[i+1:i+3]
                    if len(HEX)!=2:
                        self.default_response(version,400)
                        return
                    for x in bytes(HEX).decode():
                        if not x in "0123456789ABCDEFabcdef":
                            self.default_response(version,400)
                            return
                    path[i]=int(bytes(HEX).decode(),16)
                    del path[i+1]
                    del path[i+1]
                i+=1
            path=bytes(path)
            a=list(parameters)
            for x in a:
                y=list(x)
                i=0
                while i<len(y):
                    if y[i]==37:
                        HEX=y[i+1:i+3]
                        if len(HEX)!=2:
                            self.default_response(version,400)
                            return
                        for b in bytes(HEX).decode():
                            if not b in "0123456789ABCDEFabcdef":
                                self.default_response(version,400)
                                return
                        y[i]=int(bytes(HEX).decode(),16)
                        del y[i+1]
                        del y[i+1]
                    i+=1
                z=list(parameters[x])
                i=0
                while i<len(z):
                    if z[i]==37:
                        HEX=z[i+1:i+3]
                        if len(HEX)!=2:
                            self.default_response(version,400)
                            return
                        for b in bytes(HEX).decode():
                            if not b in "0123456789ABCDEFabcdef":
                                self.default_response(version,400)
                                return
                        z[i]=int(bytes(HEX).decode(),16)
                        del z[i+1]
                        del z[i+1]
                    i+=1
                parameters[bytes(y)]=bytes(z)
                if x!=bytes(y):
                    del parameters[x]
                i=1
            headers={}
            while i<len(request) and request[i]!="":
                headers[request[i].split(b":")[0]]=b":".join(request[i].split(b":")[1:])
                i+=1
            print(headers)
            if request[0].split(b" ")[0]==b"GET":
                try:
                    if path.decode()[-1]=="/":
                        path+=b"index.html"
                    with open("./../html"+path.decode(),"rb")as f:
                        ctn=f.read()
                    while 1:
                            if ctn.startswith(b"verify that :"):
                                ctn=self.verify_that(ctn,sign=sign,path=path,parameters=parameters,headers=headers,url=url,ip_srv=addr)#,get_voyage=get_voyage,reset_screen=reset_screen,command_drink=command_drink,get_etape=get_etape)
                                if ctn==0:
                                    return
                            elif ctn.startswith(b"define :"):
                                ctn=self.define(ctn,sign=sign,path=path,parameters=parameters,headers=headers,url=url,ip_srv=addr)#,get_voyage=get_voyage,reset_screen=reset_screen,command_drink=command_drink,get_etape=get_etape)
                            else:
                                break
                    self.response(version+b" 200 OK\r\n\r\n"+ctn)
                    return
                except FileNotFoundError:
                    self.default_response(version,404)
            elif request[0].split(b" ")[0]==b"POST":
                self.default_response(version,501)
                return
            else:
                self.response(version+b" 405 Method Not Allowed\r\n\r\n")
                return
        except Exception as e:
            self.default_response(version,500,(str(e)+str(e.__traceback__.tb_lineno)).encode())
            return

class QR_ev3_sender(Thread):
    def __init__(self,ev3,no):
        self.ev3=ev3
        self.no=no
        Thread.__init__(self)
    def get_voyage(self):
        self.ev3.send(EV3BT.encodeMessage(EV3BT.MessageType.Numeric,"command",1))
        return EV3BT.decodeMessage(self.ev3.recv(1024),EV3BT.MessageType.Numeric)
    def reset_screen(self):
        self.ev3.send(EV3BT.encodeMessage(EV3BT.MessageType.Numeric,"command",2))
    def command_drink(self,drink):
        self.ev3.send(EV3BT.encodeMessage(EV3BT.MessageType.Numeric,"command",2+drink))
    def get_etape(self):
        self.ev3.send(EV3BT.encodeMessage(EV3BT.MessageType.Numeric,"command",8))
        return EV3BT.decodeMessage(self.ev3.recv(1024),EV3BT.MessageType.Text)
    def run(self):
        while 1:
            msg=self.ev3.recv(1024)
            print("message recieved")
            mailbox,msg,a=EV3BT.decodeMessage(msg,EV3BT.MessageType.Numeric)
            if mailbox=="qrcode":
                qr=qrcode.QRCode()
                url="http://"+addr+"/command.html?robot={}&voyage={}".format(self.no,int(msg))
                signature=sign(url)
                url+="&signature="
                url+=signature
                qr.add_data(url)
                qr.make()
                print("qrcode generé")
                rgf=qr_rgf.rgf_generator(qr.modules)
                while 1:
                    self.ev3.send(bytes([35,0,0,0,1,0x92,len(rgf)%256,(len(rgf)//256)%256,0,0])+b"../prjs/alcobot/qrcode.rgf\0")
                    response=self.ev3.recv(1024)
                    print("réponse recue")
                    if response[5]==0x92 and response[6]==0:
                        msg_send=bytes([0,0,0x81,0x93,response[7]])+rgf
                        self.ev3.send(bytes([len(msg_send)%256,len(msg_send)//256])+msg_send)
                        break
                    else:
                        print("sending intialisation failed")
                self.ev3.send(EV3BT.encodeMessage(EV3BT.MessageType.Numeric,"qrcode_update",msg))
            else:
                print("mailbox isn't valide")

a=socket.socket()
a.bind(("",80))
a.listen(1)
request_recieve(a).start()
ev3_addrs=[]
ev3_cnxs=[]
for addr in ev3_addrs:
    ev3_cnxs.append(bluetooth.BluetoothSocket(3))
    ev3_cnxs[-1].connect((addr,1))
qr_ev3_senders=[]
for i in range(len(ev3_cnxs)):
    qr_ev3_senders.append(QR_ev3_sender(ev3_cnxs[i],i))
for qr_ev3_sender in qr_ev3_senders:
    qr_ev3_sender.start()
