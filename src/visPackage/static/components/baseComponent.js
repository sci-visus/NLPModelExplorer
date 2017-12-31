/*
 - standardize query interface
 - handle component wise communication

*/
var namespace = '/app'; //global namespace
//create a web socket connect to the server domain.
var socket = io.connect('http://' + document.domain + ':' + location.port +
    namespace);

class baseComponent {
    constructor(div) {
        this._divTag = div;
        this._div = '#' + div;

        //default margin
        this.margin = {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5
        };
    }

    getType() {

    }

    getVisData() {


    }

    resize() {

    }

    _updateWidthHeight() {
        //resize width height
        //parent width, height
        this.pwidth = $(this._div).parent().parent().parent().width();
        this.pheight = $(this._div).parent().parent().parent().height();
        // console.log(this.pwidth, this.pheight);

        //setup single plot data
        this.width = this.pwidth - this.margin.left - this.margin.right;
        this.height = this.pheight - this.margin.top - this.margin.bottom;
        // console.log(this.width, this.height);
    }

}
