var panelMetaInfo = {
    'Prediction': ['prediction_view', 'predictionComponent'],
    'Attention': ['attention_view', 'attentionComponent'],
    'Sentence': ['sentence_view', 'sentenceComponent'],
    'Evaluation': ['evaluation_view', 'evaluationComponent']
};

//for lookup component class on-the-fly
var objectMap = {
    predictionComponent: predictionComponent,
    attentionComponent: attentionComponent,
    sentenceComponent: sentenceComponent,
    evaluationComponent: evaluationComponent
};

var config = {
    settings: {
        showPopoutIcon: true,
        // showPopoutIcon: false,
        showCloseIcon: true
    },
    content: [{
        type: 'column',
        content: [{
            type: 'row',
            content: [{
                type: 'component',
                componentName: 'Prediction',
                componentState: {
                    route: 'prediction_view',
                    name: 'predictionComponent'
                }
            }, {
                type: 'component',
                componentName: 'Attention',
                componentState: {
                    route: 'attention_view',
                    name: 'attentionComponent'
                }
            }]
        }, {
            type: 'component',
            componentName: 'Sentence',
            componentState: {
                route: 'sentence_view',
                name: 'sentenceComponent'
            }
        }]
    }]
};



function registerComponent(appLayout, name) {
    //register factory callback
    appLayout.registerComponent(name, function(container, componentState) {
        // console.log("loading -- ", componentState);
        //popout test
        // console.log("container constructor:", componentState.name);
        // container.getElement().html( '<h2>' + componentState.name + '</h2>' );

        $.get(componentState.route,
            function(template) {
                // var uuid = guid();
                var uuid = "div_" + uuidv1();
                var data = {
                    id: uuid
                };
                var htmlComponent = Mustache.render(template,
                    data);
                //create panel component
                var panel = container.getElement();
                panel.html(htmlComponent)
                    // var panel = new window[componentState.name](uuid);
                    //storge the object with panel
                var component = new objectMap[componentState.name]
                    (
                        uuid);
                panel.data("component", component);
                container.on("resize", component.resize.bind(
                    component));
            });
    });
}

//don't need this for now
// function insertPanel(name) {
//   var newItemConfig = panelItemConfig[name];
//   appLayout.root.contentItems[0].addChild(newItemConfig);
// }

//////////////////////create layout ///////////////////////
var appLayout = new window.GoldenLayout(config, $('#layoutContainer'));

//register components
for (key in panelMetaInfo) {
    if (panelMetaInfo.hasOwnProperty(key)) {
        // addMenuItem(key, panelMetaInfo[key][0], panelMetaInfo[key][1]);
        registerComponent(appLayout, key);
    }
}

appLayout.init()

//handle whole window resize
window.addEventListener('resize', function() {
    appLayout.updateSize();
})

window.onbeforeunload = function(e) {
    console.log("@@@@@@@@@@@ reset module on server @@@@@@@@@\n");
    $.get("/reset/", d => console.log(d));
};
