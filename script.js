(function($){
    
    $(function(){       
      var $scope = $(".content");
      Manager.init();

        $("#contextualNav").ferroMenu({
                position    : "center-bottom",
                    delay       : 50,
                    rotation    : 720,
                    margin      : 20,

                });
        var intro = introJs();        
          intro.setOptions({
            steps: [
              {
                element: document.querySelector('#ferromenu-controller'),
                intro: "<strong>Organisez votre séquence</strong>",
                position:"top"
              },

               {
                element: document.querySelector(".navbar"),
                intro: "<strong>Naviguez dans les différents espaces</strong>",
                position:"bottom"
              }
               
              
            ],
              skipLabel:"Passer",
              doneLabel:"<i class='fa fa-stop '></i>",
              prevLabel:"<i class='fa fa-step-backward '></i>",
              nextLabel:"<i class='fa fa-step-forward '></i>"

          });



         $(document).on("click","#uiFriendlyzr-btn",function(){
            intro.start();

         });
          $(document).on("click",".ferroMenu li a.play",function(){
          Manager.play();

         });
          $(document).on("click","#reset-timeline", function(){
              Manager.resetTimeline();
          });
           $(document).on("click","#log-timeline", function(){

              $("#uifriendlyzr-timeline-summary tr").has("td").remove();
              Manager.getTimeline().steps.forEach(function(step,index){
                 var frags = step.hashDomElem.split(":");
    
                  var tag = frags[0];
                  var hashKey = frags[1];
                  var hash = parseInt(frags[2]);
                  $("#uifriendlyzr-timeline-summary").append("<tr><td>"+(index+1)+"</td><td>"
                                                              +tag+"</td><td>"
                                                              +hash+"</td><td>"
                                                              +step.tooltip.content+"</td></tr>");
              });
          });


         $(document).on("click",".ferroMenu li a.timeline",function(){
            $.fn.ferroMenu.toggleMenu();
            

            /** Init Manager **/
            var prevTarget;
            Manager.switchMode($scope);
           
            $("#console-settings").fadeIn(300);
            /** Init Manager **/

         });


$("body").on("click", function (event) {
   
    if (Manager.getMode() === "edit" && ($scope.find($(event.target)).length)) { // en mode �dition et si on cliqu� dans la zone d'�dition
       
        curHash = getElementHash($(event.target), event.target.nodeName); // hash de l'�l�ment cliqu� 
      console.log(curHash);
    }

});

$("#tooltip-form button.validate").on("click", function () {
    var content = $("#tooltip-form textarea").val();
    console.log(content);
    var tooltip = new Tooltip(content, {});
    var step = new Step(0, curHash, tooltip);
    Manager.saveStep(step);


    /** Alimentation du tableau récapitulatif **/
        $("")
    /** Alimentation du tableau récapitulatif **/
   // console.log(Manager.getTimeline());
   
});


    });



})(jQuery)


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
    function Timeline(id, steps,scope) {
        this.id = id;
        this.scope=scope;
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
                  $scope.removeClass("uifriendlyzr-scope");
                 $(document).unbind("mousemove");
                break;
            case "edit":
                $scope.addClass("uifriendlyzr-scope");
                $(document).mousemove(function(event) {
              var targetElement=$(document.elementFromPoint(event.pageX,event.pageY));      
                  if(typeof prevTarget != "undefined" && targetElement[0] !== prevTarget[0]){
                    targetElement.addClass("focused");
                    prevTarget.removeClass("focused");                   
                  }                  
                   prevTarget=targetElement;
            });
                break;
        }
    };
    var persistTimeline=function(){
            localStorage.setItem("Timeline",JSON.stringify(timeline));
        };
    return {
        init: function(){  
            if( localStorage.getItem("Timeline") === null || JSON.parse(localStorage.getItem("Timeline")).length == 0){
                 timeline= new Timeline(1, []);

            }else{
                var timelineData=JSON.parse(localStorage.getItem("Timeline"));
               timeline=$.extend({},new Timeline(1,[]),timelineData);
            }       
        },
        play:function(){
          if(timeline.steps.length != 0){
            var intro = introJs();
          var allSteps= $.map(timeline.steps,
                function(item,index){
                    return {
                      element:getElementByHash(item.hashDomElem)[0],
                      intro:item.tooltip.content
                      };
                  })  ;
          intro.setOptions({steps:allSteps ,skipLabel:"Passer",
              doneLabel:"<i class='fa fa-stop '></i>",
              prevLabel:"<i class='fa fa-step-backward '></i>",
              nextLabel:"<i class='fa fa-step-forward '></i>"});
          intro.start();
          }
          
            
           
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
              timeline.steps=[];
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

        $(".content " + tag).each(function () {
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