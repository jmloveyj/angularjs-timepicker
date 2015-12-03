angular.module('timepicker', [])
    .directive('timepicker', function() {
        // Runs during compile
        return {
            // priority: 1,
            // terminal: true,
            scope: {
                hour: "=",
                minute: "="
            }, // {} = isolate, true = child, false/undefined = no change
            // controller: function($scope, $element, $attrs, $transclude) {},
            // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            //template: '',
            templateUrl: './timeTemplate.html',
            replace: true,
            // transclude: true,
            // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
            link: function($scope, iElm, iAttrs, controller) {
                var qHourSlot = iElm.find("#hourSlot");
                var qMinuteSlot = iElm.find("#minuteSlot");
                var theRadius = 15 / Math.tan(7.5 / 180 * Math.PI);
      
                fillHourSlot();
                fillMinuteSlot();

                defineSlotScroll(qHourSlot);
                defineSlotScroll(qMinuteSlot);

                $scope.$watch($scope.hour, changeHour);
                $scope.$watch($scope.minute, changeMinute);

                function changeHour() {
                    var degree = -$scope.hour * 15;
                    qHourSlot.css("transform", "rotateX(" + degree + "deg)");
                    qHourSlot.css("-webkit-transform", "rotateX(" + degree + "deg)");
                }

                function changeMinute() {
                    var degree = -$scope.minute / 5 * 15;
                    qMinuteSlot.css("transform", "rotateX(" + degree + "deg)");
                    qMinuteSlot.css("-webkit-transform", "rotateX(" + degree + "deg)");

                }


                function fillHourSlot() {

                    for (var i = 0; i < 24; i++) {
                        var li = document.createElement("li");
                        li.innerHTML = numToString(i);
                        li.className = "cell";
                        li.style.transform = "rotateX(" + (i * 15) + "deg) translateZ(" + theRadius + "px)";
                        li.style.webkitTransform = "rotateX(" + (i * 15) + "deg) translateZ(" + theRadius + "px)";
                        qHourSlot.append(li);
                    }
                }

                function fillMinuteSlot() {

                    for (var i = 0; i < 24; i++) {
                        var li = document.createElement("li");
                        li.innerHTML = numToString((i % 12) * 5);
                        li.className = "cell";
                        li.style.transform = "rotateX(" + (i * 15) + "deg) translateZ(" + theRadius + "px)";
                        li.style.webkitTransform = "rotateX(" + (i * 15) + "deg) translateZ(" + theRadius + "px)";
                        qMinuteSlot.append(li);
                    }
                }

                function numToString(intValue) {
                    if (intValue < 10) {
                        return "0" + intValue;
                    }
                    return "" + intValue;
                }

                function defineSlotScroll(qDom) {
                    var touchY;
                    var startY;
                    var startTimeStamp;
                    var fiction = 2;
                    var swipeVelocityThreshold = 0.2;

                    qDom.on('touchstart', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        touchY = e.originalEvent.changedTouches[0].clientY;
                        startY = touchY;
                        startTimeStamp = e.timeStamp;

                        //If there is transition undone, just stop it.
                        qDom.css("transition", "");
                        qDom.css("-webkit-transition", "");
                        qDom.off("transitionend");
                        var degree = getCurrentDegree();
                        qDom.css("transform", "rotateX(" + degree + "deg)");
                        qDom.css("-webkit-transform", "rotateX(" + degree + "deg)");

                    });

                    qDom.on('touchmove', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        var moveDeltaY = e.originalEvent.changedTouches[0].clientY - touchY;
                        touchY = e.originalEvent.changedTouches[0].clientY;

                        var degree = getCurrentDegree() - moveDeltaY / fiction;

                        qDom.css("transform", "rotateX(" + degree + "deg)");
                        qDom.css("-webkit-transform", "rotateX(" + degree + "deg)");

                    });

                    qDom.on('touchend', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        //if the duration of swipe is too short, just ignore it.
                        if ((e.timeStamp - startTimeStamp) < 100) {
                            return;
                        }

                        var endY = e.originalEvent.changedTouches[0].clientY;

                        var velocity = (endY - startY) / (e.timeStamp - startTimeStamp);

                        if (Math.abs(velocity) > swipeVelocityThreshold) {
                            swipeEffect(velocity);
                        } else {
                            tune();
                        }

                    });

                    function swipeEffect(velocity) {
                        var deceleration = 1;
                        var duration = Math.abs(velocity) / deceleration;
                        var degree = getCurrentDegree();

                        degree = degree - (velocity * duration / deceleration) * 50;

                        var scaleNum = qDom.children().length;

                        degree = Math.round(degree / (360 / scaleNum)) * (360 / scaleNum);

                        qDom.css("transition", "transform " + duration + "s cubic-bezier(0, 0, 0.2, 1)");
                        qDom.css("-webkit-transition", "transform " + duration + "s cubic-bezier(0, 0, 0.2, 1)");

                        qDom.css("transform", "rotateX(" + degree + "deg)");
                        qDom.css("-webkit-transform", "rotateX(" + degree + "deg)");
                        endTransition();
                    }


                    function tune() {
                        var degree = getCurrentDegree();
                        var scaleNum = qDom.children().length;

                        degree = Math.round(degree / (360 / scaleNum)) * (360 / scaleNum);

                        qDom.css("transition", "transform .5s ease-out");
                        qDom.css("-webkit-transition", "transform .5s ease-out");

                        qDom.css("transform", "rotateX(" + degree + "deg)");
                        qDom.css("-webkit-transform", "rotateX(" + degree + "deg)");
                        endTransition();

                    }

                    function endTransition() {
                        qDom.on('transitionend', function(e) {
                            e.preventDefault();
                            e.stopPropagation();

                            qDom.css("transition", "");
                            qDom.css("-webkit-transition", "");

                            qDom.off("transitionend");

                            $scope.$apply(function() {
                                setViewValueToScope();
                            });

                        });
                    }

                    function setViewValueToScope() {
                        var degree = getCurrentDegree();
                        if (qDom == qHourSlot) {
                            var tempHour = (degree / 15) % 24;
                            $scope.hour = (24 - tempHour) < 24 ? 24 - tempHour : -tempHour;
                        } else if (qDom == qMinuteSlot) {
                            var tempMinute = ((degree / 15) % 12) * 5;
                            $scope.minute = (60 - tempMinute) < 60 ? 60 - tempMinute : -tempMinute;
                        }
                    }

                    function getCurrentDegree() {
                        var matrix = qDom.css("transform");
                        var transform = new WebKitCSSMatrix(matrix);
                        var cosw = transform.m22;
                        var sinw = transform.m23;
                        var angle = Math.round(Math.atan2(sinw, cosw) * (180 / Math.PI));
                        return angle;

                    }

                }

            }
        };
    });