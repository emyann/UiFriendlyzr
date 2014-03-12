$(document).ready(function(){

var currentState = "normal";
var $console = $("#console-result");
var $scope = $(".container").find(".span6").first();
var curHash = "";


$("body").on("click", function (event) {
   
    //timeline.push(event.target);
    if (Manager.getMode() === "edit" && ($scope.find($(event.target)).length)) { // en mode �dition et si on cliqu� dans la zone d'�dition

        $scope.find(".selected").not(event.target).removeClass('selected');
        $(event.target).toggleClass("selected");
        curHash = getElementHash($(event.target), event.target.nodeName); // hash de l'�l�ment cliqu� 

    }

});
$("#tooltip-form button.validate").on("click", function () {
    var content = $("#tooltip-form textarea").val();
    console.log(content);
    var tooltip = new Tooltip(content, {});
    var step = new Step(0, curHash, tooltip);
    Manager.saveStep(step);
   // console.log(Manager.getTimeline());
   
});


$("#settings").on("click", function (e) {
   var mode= Manager.switchMode($scope);
   console.log(mode);
    if(mode === "normal" || !Manager.timelineIsEmpty){
        $("#play, #log-timeline").css("visibility","visible");
    }else{
         $("#play, #log-timeline").css("visibility","hidden");
    }
    
    
});
$("#play").on("click",function(){
    Manager.play();
});
$("#reset-timeline").on("click",function(){
    Manager.resetTimeline();
    $("#play, #log-timeline").css("visibility","hidden");
});
$("#log-timeline").on("click",function(){
     $("#console-result").html("<h2>D�tails de la timeline</h2>");
    $.each(Manager.getTimeline().steps,function(index,step){
         $("#console-result").append("<div class=\"step\"> <h3>Etape "+ parseInt(step.index+1) +"</h3>");
        var $el= getElementByHash(step.hashDomElem);
        $("#console-result").append("sur un �l�ment de type <strong> "+ $el[0].nodeName +"</strong><br/>");
        
    });
});
Manager.init(function(){
    if (Manager.getTimeline().steps.length !== 0){
        $("#play , #log-timeline").css("visibility","visible");
    }
});

});


var Tooltip = (function () {
    function Tooltip(content, position) {
        this.content = content;
        this.position = position;
    }
    return Tooltip;
})();
var Step = (function () {
    function Step(index, hashDomElem, tooltip) {
        this.index = index;
        this.hashDomElem = hashDomElem;
        this.tooltip = tooltip;
    }
    return Step;
})();
var Timeline = (function () {
    function Timeline(id, steps) {
        this.id = id;
        this.steps = steps;
    }

    Timeline.prototype.addStep = function (step) {
        this.steps.push(step);
    };
    return Timeline;
})();

var Manager = (function () {
    var mode = "normal";
    var timeline ={};
    var setUi = function ($scope) {
        switch (mode) {
            case "normal":
                $scope.removeClass("edit-mode");
                break;
            case "edit":
                $scope.addClass("edit-mode");
                break;
        }
    };
    var persistTimeline=function(){
            localStorage.setItem("Timeline",JSON.stringify(timeline));
        };
    return {
        init: function(callback){       

                
            if( localStorage.getItem("Timeline") === null || JSON.parse(localStorage.getItem("Timeline")).length == 0){
                console.log("ici");
                 timeline= new Timeline(1, []);

            }else{
                console.log("ici");
                var timelineData=JSON.parse(localStorage.getItem("Timeline"));
               timeline=$.extend({},new Timeline(1,[]),timelineData);
            }
            if(callback){
                callback();
            }
            console.log(timeline);           
        },
        play:function(){
             $.each(timeline.steps,function(index,step){
                console.log(step.tooltip.content);
                var $el= getElementByHash(step.hashDomElem);
                console.log($el);
                $el.qtip({
                              content:{
                                    text:step.tooltip.content
                                },
                                style: {
                                    classes: 'qtip-blue qtip-shadow qtip-rounded qtip-tipsy'
                                } 
              });
         
        
             });
           
        },
        switchMode: function ($scope) {
            mode = (mode === "normal") ? "edit" : "normal";
            setUi($scope);
            if (mode === "normal"){
                persistTimeline();
                
            }
            return mode;
        },
        getMode: function () {
            return mode;
        },
        saveStep: function (step) {
            step.index = timeline.steps.length;
            timeline.addStep(step);
            return step.index;
        },
        getTimeline: function () {
            return timeline;
        },
        timelineIsEmpty:function(){
             return timeline.steps.length === 0;
        },
        resetTimeline:function(){
             localStorage.removeItem("Timeline");
        }
     
    };
})();


function getElementHash(el, tag) {
    var hashKey = "H";
    var hashContent = $.trim(el.html());

    if (hashContent === "") {
        hashContent = getElementAttributes(el);
        if (hashContent !== "") hashKey = "A";
        else hashKey = "";
    }

    if (hashKey !== "") return (tag + ":" + hashKey + ":" + getHash(hashContent));
    else return "";
}

function getElementAttributes(el) {
    var allAttribs = el[0].attributes;
    console.log(allAttribs);
    attribs = "";
    for (var i = 0; i < allAttribs.length; i++) {
        attribs += allAttribs[i].nodeName + "-" + allAttribs[i].nodeValue + ";";
    }

    return attribs;
}

function getElementByHash(hashValue) {
    var el = null;
    var frags = hashValue.split(":");
    if (frags.length !== 3) return null;
    else {

        var tag = frags[0];
        var hashKey = frags[1];
        var hash = parseInt(frags[2]);

        $(".container " + tag).each(function () {
            if (hashKey == "H") {
                if ((getHash($.trim($(this).html())) - hash) == 0) {
                    el = $(this);
                    return false;
                }
            } else {

                if ((getHash(getElementAttributes($(this))) - hash) == 0) {
                    el = $(this);
                    return false;
                }
            }
        });
    }
    return el;
}

function getHash(s) {
    var hash = 0;
    for (var i = 0; i < s.length; i++) {
        hash = parseInt(s.charCodeAt(i)) + (parseInt(hash << 5) - parseInt(hash));
    }
    return hash;
}