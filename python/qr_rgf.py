def rgf_generator(modules,filename=None):
    if len(modules)>128:
        raise OverflowError("QR code is too big")
    resize=128//len(modules)
    result=[]
    for x in range((128-len(modules)*resize)//2):
        result.append([False]*176)
    for x in range(len(modules)*resize):
        line=[]
        for y in range((176-len(modules)*resize)//2):
            line.append(False)
        for y in range(len(modules)*resize):
            line.append(modules[x//resize][y//resize])
        while len(line)<176:
            line.append(False)
        result.append(line)
    while len(result)<128:
        result.append([False]*176)
    if filename==None:
        final_result=bytes([176,128])
        for line in result:
            value=0
            i=1
            for x in line:
                value+=int(x)*i
                i*=2
                if i==256:
                    final_result+=bytes([value])
                    value=0
                    i=1
        return final_result
    with open(filename,"wb")as file:
        file.write(bytes([176,128]))
        for line in result:
            value=0
            i=1
            for x in line:
                value+=int(x)*i
                i*=2
                if i==256:
                    file.write(bytes([value]))
                    value=0
                    i=1
                    
