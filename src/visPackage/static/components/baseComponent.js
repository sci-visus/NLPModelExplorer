/*
 - standardize query interface
 - handle component wise communication
*/

// console.log(document.domain, location.port);

class baseComponent {
    constructor(uuid) {
        this.uuid = uuid;
        // console.log(this.uuid);
        this.div = "#" + this.uuid;
        this.data = {};

        socket.on(this.uuid, this.parseMessage.bind(this));

        //default margin
        this.margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        };
    }

    subscribeDatabyNames(names) {
        if (!Array.isArray(names)) {
            console.log("Error: input need to be a list of names\n");
            return;
        }

        for (var i = 0; i < names.length; i++) {

            var msg = {
                "type": "subscribeData",
                "name": names[i],
                "uid": this.uuid
            };
            // console.log(msg);
            socket.emit('message', msg);
        }
    }

    callFunc(funcName, params = {}) {
        var msg = {
            "type": "call",
            "func": funcName,
            "params": params,
            "uid": this.uuid
        };
        socket.emit('message', msg);
    }

    setData(name, data) {
        this.data[name] = data;
        var msg = {
            "type": "setData",
            "name": name,
            "data": data,
            "uid": this.uuid
        };
        // console.log(msg);
        socket.emit('message', msg);
    }

    parseMessage(msg) {
        // console.log("\nparse message in base class\n", msg);
        switch (msg['type']) {
            case 'data':
                this.parseDataUpdate(msg);
                break;
                // case 'functionReturn':
                //     this.parseFunctionReturn(msg);
                //     return;
            case 'funcReturn':
                this.parseFunctionReturn(msg);
                break;
        }
    }

    parseFunctionReturn(msg) {

    }

    parseDataUpdate(msg) {
        this.updateData(msg);
    }

    updateData(msg) {
        var name = msg["name"];
        var data = msg["data"]["data"];
        this.data[name] = data;
    }

    ////////// implemented by individual component ////////

    draw() {

    }

    resize() {

    }

    /////////// helper function //////////////
    _updateWidthHeight() {
        //resize width height
        //parent width, height
        this.pwidth = $(this.div).parent().parent().parent().width();
        this.pheight = $(this.div).parent().parent().parent().height();
        // console.log(this.pwidth, this.pheight);

        //setup single plot data
        this.width = this.pwidth - this.margin.left - this.margin.right;
        this.height = this.pheight - this.margin.top - this.margin.bottom;
        // console.log(this.width, this.height);
    }

}
